import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionStorageService } from '../../services/session-storage.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CropImageDialogComponent } from './crop-image-dialog/crop-image-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  userForm!: FormGroup;
  user: any;
  previewUrl: string|null = null;
  croppedImage: string|null = null;
  uploadInProgress = false;
  profileImageUrl: string|null = null;

  constructor(
    private fb: FormBuilder,
    private session: SessionStorageService,
    private http: HttpClient,
    public snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user = this.session.getUser();
    if (!this.user) {
      this.snack.open('Session expirée, reconnectez-vous.', 'Fermer', { duration: 3000 });
      return;
    }

    this.userForm = this.fb.group({
      nom: [this.user.nom, Validators.required],
      prenom: [this.user.prenom, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      username: [this.user.username, Validators.required],
      ncin: [this.user.ncin, Validators.required],
      password: ['']
    });

    this.loadProfileMeta();
  }

  loadProfileMeta(): void {
    this.http.get<any>(`http://localhost:8080/api/users/${this.user.id}/profile-image/meta`)
      .subscribe({
        next: meta => {
          if (meta?.filePath) {
            this.profileImageUrl = 
              `http://localhost:8080/api/users/${this.user.id}/profile-image/raw`;
          }
        },
        error: () => {
          // pas d'image => on ignore
        }
      });
  }

  openCropDialog(eventOrInput: Event|HTMLInputElement): void {
    if (eventOrInput instanceof HTMLInputElement) {
      eventOrInput.click();            // ouvre le file picker
      return;
    }
    // sinon, c'est un event change -> on ouvre le popup
    const dialogRef = this.dialog.open(CropImageDialogComponent, {
      width: '450px',
      data: { event: eventOrInput }
    });
    dialogRef.afterClosed().subscribe(base64 => {
      if (base64) {
        this.croppedImage = base64;
        this.previewUrl  = base64;
      }
    });
  }
  

  uploadImage(): void {
    if (!this.croppedImage) return;
    this.uploadInProgress = true;

    // conversion base64 → Blob → File
    const blob = this.base64ToBlob(this.croppedImage);
    const file = new File([blob], `profile_${this.user.id}.png`, { type: blob.type });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post(
      `http://localhost:8080/api/users/${this.user.id}/profile-image`,
      formData
    ).subscribe({
      next: () => {
        this.snack.open('Photo mise à jour.', 'Fermer', { duration: 2000 });
        this.session.setUser({ ...this.user, profileImageUrl: this.previewUrl });
        this.loadProfileMeta();
        this.croppedImage = null;
        this.previewUrl = null;
        this.uploadInProgress = false;
      },
      error: () => {
        this.snack.open('Erreur upload image.', 'Fermer', { duration: 2000 });
        this.uploadInProgress = false;
      }
    });
  }

  private base64ToBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    return new Blob([buffer], { type: mime });
  }

  saveProfile(): void {
    if (this.userForm.invalid) {
      this.snack.open('Corrigez le formulaire.', 'Fermer', { duration: 2000 });
      return;
    }
    const v = this.userForm.value;
    const upd: any = {
      nom: v.nom, prenom: v.prenom,
      email: v.email, username: v.username,
      ncin: v.ncin
    };
    if (v.password) upd.password = v.password;

    this.http.put<any>(`http://localhost:8080/api/users/update/${this.user.id}`, upd)
      .subscribe({
        next: u => {
          this.snack.open('Profil enregistré.', 'Fermer', { duration: 2000 });
          this.session.setUser(u);
        },
        error: err => {
          if (err.status === 409) {
            this.snack.open('Username déjà utilisé.', 'Fermer', { duration: 2000 });
          } else {
            this.snack.open('Erreur sauvegarde.', 'Fermer', { duration: 2000 });
          }
        }
      });
  }
}
