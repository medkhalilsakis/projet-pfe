import { HttpClient, HttpEventType, HttpParams, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
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
import { ProjectDescriptionDialogComponent } from '../project-description-dialog/project-description-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
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

  showDescriptionForm = false;
  projectForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private sessionStorage: SessionStorageService,
    private dialog: MatDialog
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

    const isArchive = this.files.length === 1 &&
      ['application/zip', 'application/x-rar-compressed'].includes(this.files[0].type);

    const params = new HttpParams()
      .set('decompress', isArchive.toString())
      .set('userId', userId);

    // Appel à l'API upload, qui renvoie { projectId: number }
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
            this.isUploading = false;
            const projectId = event.body.projectId;
            // Stocker l'id du projet dans le session storage
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

  private openProjectDescriptionDialog(projectId: number): void {
    const dialogRef = this.dialog.open(ProjectDescriptionDialogComponent, {
      width: '400px',
      data: { projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Appel à l'API commit avec les données du formulaire
        const params = new HttpParams().set('projectId', projectId.toString());
        this.http.post('http://localhost:8080/api/projects/commit', result, { params, responseType: 'text' })
          .subscribe({
            next: (response) => {
              this.snackBar.open(response, 'Fermer', { duration: 3000 });
              // Émettre l'événement pour que le parent effectue la redirection vers la liste des projets
              this.uploadCompleted.emit();
              this.resetState();
            },
            error: (error) => {
              console.log(error);
              this.snackBar.open('Erreur lors de la finalisation du projet', 'Fermer', { duration: 5000 });
              // En cas d'échec, rediriger quand même vers la liste
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
