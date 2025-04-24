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

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FileSizePipe
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

  const user = this.sessionStorage.getUser();
  if (!user?.id) {
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

  this.uploadFilesSequentially(user.id);
}
public getFileIcon(fileName: string): string {
  if (fileName.toLowerCase().endsWith('.zip') || fileName.toLowerCase().endsWith('.rar')) {
    return 'archive';
  }
  return fileName.includes('.') ? 'insert_drive_file' : 'folder';
}

private uploadFilesSequentially(userId: number) {
  const user = this.sessionStorage.getUser();
  const formData = new FormData();
  this.files.forEach(file => formData.append('files', file));

  const isArchive = this.files.some(file => 
    file.name.toLowerCase().endsWith('.zip') || 
    file.name.toLowerCase().endsWith('.rar')
  );

  const params = new HttpParams()
    .set('decompress', isArchive.toString())
    .set('userId', userId);

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
            this.sessionStorage.setUser({ ...user, currentProjectId: projectId });
            this.snackBar.open('Upload terminé!', 'Fermer', { duration: 3000 });
            // Ouvrir la popup pour saisir la description du projet
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

private updateIndividualProgress(event: any) {
  const elapsedTime = (Date.now() - this.startTime) / 1000;
  const totalLoaded = event.loaded;
  const totalSize = event.total;
  
  this.uploadProgress = this.uploadProgress.map((progress, index) => {
    const fileRatio = this.files[index].size / totalSize;
    const uploaded = totalLoaded * fileRatio;
    
    return {
      ...progress,
      progress: Math.round((uploaded / progress.size) * 100),
      speed: (uploaded / elapsedTime) / 1024,
      uploaded: uploaded
    };
  });
}


// … dans UploadComponent …

private openProjectDescriptionDialog(projectId: number): void {
  const dialogRef = this.dialog.open(ProjectDescriptionDialogComponent, {
    width: '500px',
    data: { projectId }
  });

  dialogRef.afterClosed().subscribe(formData => {
    if (!formData) {
      this.snackBar.open('Finalisation annulée', 'Fermer', { duration: 3000 });
      this.resetState();
      return;
    }

    // 1) On commit d'abord le projet
    const status = formData.visibilite === 'public' ? 1 : 0;
    const commitPayload = {
      name: formData.name,
      type: formData.type,
      description: formData.description || '',
      visibilite: formData.visibilite,
      status
    };

    const params = new HttpParams().set('projectId', projectId.toString());
    this.http.post('http://localhost:8080/api/projects/commit', commitPayload, { params, responseType: 'text' })
      .subscribe({
        next: () => {
          this.snackBar.open('Projet finalisé.', 'Fermer', { duration: 3000 });

          // 2) Si des invitations ont été sélectionnées, on les envoie en parallèle
          const toInvite: number[] = formData.users || [];
          if (toInvite.length) {
            // un tableau d’observables POST d’invitation
            const invites$ = toInvite.map(uid =>
              this.http.post(
                `http://localhost:8080/api/projects/${projectId}/invite`,
                { userId: uid, status: 'pending' },
                { responseType: 'text' }
              )
            );
            forkJoin(invites$).subscribe({
              next: () => {
                this.snackBar.open('Invitations envoyées.', 'Fermer', { duration: 3000 });
                this.uploadCompleted.emit();
                this.resetState();
              },
              error: () => {
                this.snackBar.open('Erreur lors des invitations', 'Fermer', { duration: 3000 });
                this.uploadCompleted.emit();
                this.resetState();
              }
            });
          } else {
            // pas d’invitations -> on termine
            this.uploadCompleted.emit();
            this.resetState();
          }
        },
        error: () => {
          this.snackBar.open('Erreur finalisation projet', 'Fermer', { duration: 3000 });
          this.uploadCompleted.emit();
          this.resetState();
        }
      });
  });
}




  private resetState() {
    this.files = [];
    this.uploadProgress = [];
    this.isUploading = false;
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
