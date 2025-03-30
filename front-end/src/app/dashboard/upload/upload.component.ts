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


  private openProjectDescriptionDialog(projectId: number): void {
    const dialogRef = this.dialog.open(ProjectDescriptionDialogComponent, {
      width: '400px',
      data: { projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Envoi des informations saisies à l'API commit
        const params = new HttpParams().set('projectId', projectId.toString());
        this.http.post('http://localhost:8080/api/projects/commit', result, { params, responseType: 'text' })
          .subscribe({
            next: (response) => {
              this.snackBar.open(response, 'Fermer', { duration: 3000 });
              this.uploadCompleted.emit();
              this.resetState();
            },
            error: (error) => {
              console.log(error);
              this.snackBar.open('Erreur lors de la finalisation du projet', 'Fermer', { duration: 5000 });
              this.uploadCompleted.emit();
              this.resetState();
            }
          });
      } else {
        this.snackBar.open('Finalisation annulée', 'Fermer', { duration: 3000 });
        this.uploadCompleted.emit();
        this.resetState();
      }
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
