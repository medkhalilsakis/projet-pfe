import { HttpClient, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    FileSizePipe,
    MatFormField,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  files: File[] = [];
  uploadProgress: FileProgress[] = [];
  isUploading = false;
  private destroy$ = new Subject<void>();
  private startTime!: number;

  showDescriptionForm = false;
  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      type: ['WEB', Validators.required],
      description: [''],
      visibilite: ['privé', Validators.required]
    });
  }

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
    if (!user || !user.id) {
      this.snackBar.open('Utilisateur non identifié, veuillez vous reconnecter.', 'Fermer', { duration: 5000 });
      this.isUploading = false;
      return;
    }
    const userId = user.id;

    const formData = new FormData();
    this.files.forEach(file => formData.append('files', file));

    // Détermine si c'est une archive
    const isArchive = this.files.length === 1 &&
      ['application/zip', 'application/x-rar-compressed'].includes(this.files[0].type);

    // Ajout de userId dans les paramètres
    const params = new HttpParams()
      .set('decompress', isArchive.toString())
      .set('userId', userId);

    // Supposons que le backend renvoie du JSON contenant { projectId: number }
    this.http.post<{ projectId: number }>('http://localhost:8080/api/projects/upload', formData, {
      reportProgress: true,
      observe: 'events',
      params
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.updateProgress(event);
          } else if (event instanceof HttpResponse) {
            // L'upload est terminé : récupérer l'ID du projet et le stocker dans le session storage
            this.isUploading = false;
            const projectId = event.body.projectId;
            // Mettre à jour l'utilisateur avec currentProjectId
            this.sessionStorage.setUser({ ...user, currentProjectId: projectId });
            this.showDescriptionForm = true;
            this.snackBar.open('Upload terminé! Complétez les informations du projet', 'Fermer', { duration: 5000 });
          }
        },
        error: (error) => {
          console.log(error);
          this.snackBar.open('Erreur lors de l\'upload', 'Fermer', { duration: 5000 });
          this.resetState();
        }
      });
  }

  private updateProgress(event: any) {
    const elapsedTime = (Date.now() - this.startTime) / 1000;
    const speed = event.loaded / elapsedTime; // bytes/sec

    this.uploadProgress = this.files.map(file => ({
      name: file.name,
      progress: Math.round((event.loaded / event.total) * 100),
      speed: speed / 1024, // KB/s
      size: file.size,
      uploaded: event.loaded
    }));
  }

  commitProject() {
    if (this.projectForm.invalid) return;
  
    // Récupérer l'ID du projet stocké dans le session storage
    const projectId = this.sessionStorage.getUser()?.currentProjectId;
    if (!projectId) {
      this.snackBar.open('Aucun projet en cours', 'Fermer', { duration: 5000 });
      return;
    }
  
    const params = new HttpParams().set('projectId', projectId.toString());
    this.http.post('http://localhost:8080/api/projects/commit', {}, { params, responseType: 'text' })
      .subscribe({
        next: () => {
          this.router.navigate(['/projects']);
          this.resetState();
          // Suppression du currentProjectId après commit
          const currentUser = this.sessionStorage.getUser();
          if (currentUser) {
            delete currentUser.currentProjectId;
            this.sessionStorage.setUser(currentUser);
          }
        },
        error: (error) => {
          console.log(error);
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
