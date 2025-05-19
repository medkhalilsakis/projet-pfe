import { HttpClient, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SessionStorageService } from '../../services/session-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { ProjectDescriptionDialogComponent } from '../project-description-dialog/project-description-dialog.component';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './file-size.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FileSizePipe,
    FlexLayoutModule 
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  
  @Output() uploadCompleted = new EventEmitter<void>();

  files: File[] = [];
  uploadProgress: FileProgress[] = [];
  isUploading = false;
  private destroy$ = new Subject<void>();
  private startTime!: number;

  isUploadStarted = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService,
    private dialog: MatDialog
  ) {}

  onFileSelected(event: any) {
    this.addFiles(event.target.files);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.addFiles(event.dataTransfer.files);
    }
  }

  private addFiles(fileList: FileList) {
    const newFiles = Array.from(fileList).filter(file => {
      const exists = this.files.some(f => f.name === file.name);
      if (exists) {
        this.snackBar.open(`Le fichier ${file.name} existe déjà`, 'Fermer', { duration: 3000 });
      }
      return !exists;
    });
    this.files = [...this.files, ...newFiles];
  }

  startUpload() {
    if (this.files.length === 0) return;
  
    this.isUploading = true;
    this.startTime = Date.now();
    this.isUploadStarted = true;
  
    // Récupérer l'ID de l'utilisateur à partir du sessionStorage
    const user = this.sessionStorage.getUser();
    const userId = user?.id;
    
    if (!userId) {
      this.snackBar.open('Utilisateur non identifié, veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
      this.isUploading = false;
      return;
    }
  
    // Initialiser la progression pour chaque fichier
    this.uploadProgress = this.files.map(file => ({
      name: file.name,
      progress: 0,
      speed: 0,
      size: file.size,
      uploaded: 0
    }));
  
    // Appel à la méthode d'upload avec l'ID de l'utilisateur
    this.uploadFilesSequentially(userId);
  }
  
  private uploadFilesSequentially(userId: string) {
    const formData = new FormData();
    this.files.forEach(file => formData.append('files', file));
  
    const isArchive = this.files.some(file => 
      file.name.toLowerCase().endsWith('.zip') || 
      file.name.toLowerCase().endsWith('.rar')
    );
  
    // Préparer les paramètres HTTP
    const params = new HttpParams()
      .set('decompress', isArchive.toString())
      .set('userId', userId);  // Inclure l'ID de l'utilisateur dans les paramètres
  
    this.http.post<{ projectId: number }>('http://localhost:8080/api/projects/upload', formData, {
      reportProgress: true,
      observe: 'events',
      params
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.updateIndividualProgress(event);
          } else if (event instanceof HttpResponse) {
            this.isUploading = false;
            const projectId = event.body.projectId;
            this.sessionStorage.saveCurrentProject(projectId);
            this.snackBar.open('Upload terminé!', 'Fermer', { duration: 3000 });
            this.openProjectDescriptionDialog(projectId);
          }
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 5000 });
          this.resetState();
        }
      });
  }
  
public getFileIcon(fileName: string): string {
  if (fileName.toLowerCase().endsWith('.zip') || fileName.toLowerCase().endsWith('.rar')) {
    return 'archive';
  }
  return fileName.includes('.') ? 'insert_drive_file' : 'folder';
}


private updateIndividualProgress(event: any) {
  if (event.type === HttpEventType.UploadProgress) {
    const totalLoaded = event.loaded;
    const totalSize = event.total;

    this.uploadProgress = this.uploadProgress.map((progress, index) => {
      const file = this.files[index];
      const fileRatio = file.size / totalSize;
      const uploaded = totalLoaded * fileRatio;

      return {
        ...progress,
        progress: Math.round((uploaded / progress.size) * 100),
        speed: (uploaded / (Date.now() - this.startTime)) / 1024,
        uploaded: uploaded
      };
    });
  }
}



private openProjectDescriptionDialog(projectId: number): void {
  const dialogRef = this.dialog.open< 
      ProjectDescriptionDialogComponent,
      { projectId: number },
      ProjectFormData 
    >(ProjectDescriptionDialogComponent, {
      width: '700px',
      height: '90vh',
      data: { projectId }
    });

  dialogRef.afterClosed().subscribe(formData => {
    if (!formData) {
      // Annulation : suppression du draft puis reset + redirection
      this.http.delete(`http://localhost:8080/api/projects/${projectId}`)
        .subscribe({
          next: () => {
            this.snackBar.open('Upload annulé, projet supprimé.', 'Fermer', { duration: 3000 });
            this.resetState();
            // ** on redirige vers la liste des projets **
            this.router.navigate(['/dashboard/upload']);
          },
          error: () => {
            this.snackBar.open('Erreur suppression projet annulé.', 'Fermer', { duration: 3000 });
            this.resetState();
            this.router.navigate(['/dashboard/upload']);
          }
        });
      return;
    }
    // --- sinon on commit le projet ---
    const status = formData.visibilite === 'public' ? 1 : 0;
    const commitPayload = {
      name:        formData.name,
      type:        formData.type,
      description: formData.description || '',
      visibilite:  formData.visibilite,
      status
    };
    const params = new HttpParams().set('projectId', projectId.toString());

    this.http.post(
        'http://localhost:8080/api/projects/commit',
        commitPayload,
        { params, responseType: 'text' }
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Projet finalisé.', 'Fermer', { duration: 2000 });
          const operations = [];

          if (formData.taskId) {
            operations.push(
              this.http.put(
                `http://localhost:8080/api/taches/${formData.taskId}/assignProject`,
                null,
                {
                  params: new HttpParams().set('projectId', projectId.toString()),
                  responseType: 'text'
                }
              )
            );
          }
            (formData.users||[]).forEach(uid => {
              operations.push(
                this.http.post(
                  `http://localhost:8080/api/projects/${projectId}/invite`,
                  { userId: uid, status: 'pending' },
                  { responseType: 'text' }
                )
              );
            });

          if (operations.length) {
            forkJoin(operations).subscribe({
              next: () => {
                this.snackBar.open('Tâche & invitations enregistrées.', 'Fermer', { duration: 2000 });
                this.resetState();
                this.router.navigate(['/dashboard/projects']);
                this.uploadCompleted.emit();
              },
              error: () => {
                this.snackBar.open('Erreur post-commit.', 'Fermer', { duration: 2000 });
                this.resetState();
                this.router.navigate(['/dashboard/upload']);
                this.uploadCompleted.emit();
              }
            });
          } else {
            // pas d’opérations post-commit
            this.resetState();
            this.router.navigate(['/dashboard/upload']);
            this.uploadCompleted.emit();
          }
        },
        error: () => {
          this.snackBar.open('Erreur finalisation projet', 'Fermer', { duration: 2000 });
          this.resetState();
          this.router.navigate(['/dashboard/upload']);
          this.uploadCompleted.emit();
        }
      });
  });
}



private resetState() {
  this.files = [];
  this.uploadProgress = [];
  this.isUploading = false;
  this.isUploadStarted = false;  
}


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

interface FileProgress {
  name: string;
  progress: number;
  speed: number;
  size: number;
  uploaded: number;
}
interface ProjectFormData {
  name: string;
  type: string;
  description?: string;
  visibilite: 'public'|'prive';
  users?: number[];
  taskId?: number;         
}

