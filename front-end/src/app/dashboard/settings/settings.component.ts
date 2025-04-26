// src/app/settings/settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SessionStorageService } from '../../services/session-storage.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProfileImageService } from '../../services/profile-image.service';
import { Subscription } from 'rxjs';

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
    MatButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  user: any;

  /** Fichier sélectionné et aperçu temporaire */
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  /** URL du profil (émise par le service) */
  profileImageUrl: string | null = null;

  uploadInProgress = false;

  private sub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private session: SessionStorageService,
    private http: HttpClient,
    private snack: MatSnackBar,
    private profileImageService: ProfileImageService
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

    // S'abonner au service pour recevoir les changements d'URL d'avatar
    this.sub = this.profileImageService.imageUrl$
      .subscribe(url => this.profileImageUrl = url);

    // Charger la méta pour déclencher la 1ère émission
    this.loadProfileMeta();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Récupère la méta et notifie le service */
  private loadProfileMeta(): void {
    const id = this.user.id;
    this.http.get<any>(`http://localhost:8080/api/users/${id}/profile-image/meta`)
      .subscribe({
        next: meta => {
          const url = meta?.filePath
            ? `http://localhost:8080/api/users/${id}/profile-image/raw?ts=${Date.now()}`
            : null;
          this.profileImageService.setImageUrl(url);
        },
        error: () => {
          this.profileImageService.setImageUrl(null);
        }
      });
  }

  /** Gestion de la sélection de fichier */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedFile = input.files[0];
    this.previewUrl = URL.createObjectURL(this.selectedFile);
  }

  /** Envoie au back-end (crop côté serveur) */
  uploadImage(): void {
    if (!this.selectedFile) {
      this.snack.open('Veuillez sélectionner une image.', 'Fermer', { duration: 2000 });
      return;
    }
    this.uploadInProgress = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(
      `http://localhost:8080/api/users/${this.user.id}/profile-image`,
      formData
    ).subscribe({
      next: () => {
        this.snack.open('Photo mise à jour.', 'Fermer', { duration: 2000 });
        this.previewUrl = null;
        this.selectedFile = null;
        // recharger la méta pour propager la nouvelle URL
        this.loadProfileMeta();
        this.uploadInProgress = false;
      },
      error: () => {
        this.snack.open('Erreur upload image.', 'Fermer', { duration: 2000 });
        this.uploadInProgress = false;
      }
    });
  }

  /** Sauvegarde des autres champs */
  saveProfile(): void {
    if (this.userForm.invalid) {
      this.snack.open('Corrigez le formulaire.', 'Fermer', { duration: 2000 });
      return;
    }
    const v = this.userForm.value;
    const upd: any = {
      nom: v.nom,
      prenom: v.prenom,
      email: v.email,
      username: v.username,
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
          const msg = err.status === 409
            ? 'Username déjà utilisé.'
            : 'Erreur sauvegarde.';
          this.snack.open(msg, 'Fermer', { duration: 2000 });
        }
      });
  }
}
