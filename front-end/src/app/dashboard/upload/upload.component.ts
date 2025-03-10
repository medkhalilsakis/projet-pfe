import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SessionStorageService } from '../../services/session-storage.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FileSizePipe } from './file-size.pipe';

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FileSizePipe
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})

export class UploadComponent {
  
  files: File[] = [];
  uploadProgress: FileProgress[] = [];
  isUploading = false;
  private destroy$ = new Subject<void>();
  private startTime!: number;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService
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
    const formData = new FormData();
    this.files.forEach(file => formData.append('files', file));

    // Détermine si c'est une archive
    const isArchive = this.files.length === 1 && 
      ['application/zip', 'application/x-rar-compressed'].includes(this.files[0].type);

    this.http.post('http://localhost:8080/api/projects/upload', formData, {
      reportProgress: true,
      observe: 'events',
      params: { decompress: isArchive }
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.updateProgress(event);
          }
        },
        error: (error) => {
          this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 5000 });
          this.resetState();
        },
        complete: () => {
          this.isUploading = false;
          this.snackBar.open('Upload terminé! Cliquez sur Commit pour sauvegarder', 'Fermer');
        }
      });
  }

  private updateProgress(event: any) {
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const speed = event.loaded / elapsedTime; // bytes/sec

    this.uploadProgress = this.files.map((file, index) => ({
      name: file.name,
      progress: Math.round((event.loaded / event.total) * 100),
      speed: speed / 1024, // KB/s
      size: file.size,
      uploaded: event.loaded
    }));
  }

  commitProject() {
    this.http.post('http://localhost:8080/api/projects/commit', {})
      .subscribe({
        next: () => {
          this.router.navigate(['/projects']);
          this.resetState();
        },
        error: () => {
          this.snackBar.open('Erreur lors du commit', 'Fermer', { duration: 5000 });
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