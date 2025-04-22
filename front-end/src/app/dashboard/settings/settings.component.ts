// settings.component.ts
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

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class SettingsComponent implements OnInit {
  userForm!: FormGroup;
  user: any;
  previewUrl: string | null = null;
  selectedFile!: File;
  uploadInProgress = false;
  profileImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private session: SessionStorageService,
    private http: HttpClient,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.user = this.session.getUser();
    this.userForm = this.fb.group({
      nom: [this.user.nom, Validators.required],
      prenom: [this.user.prenom, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]],
      username: [this.user.username, Validators.required],
      ncin: [this.user.ncin, Validators.required]
    });
    this.loadProfileMeta();
  }

  loadProfileMeta() {
    this.http.get<any>(`http://localhost:8080/api/users/${this.user.id}/profile-image/meta`)
      .subscribe(meta => {
        if (meta?.filePath) {
          this.profileImageUrl = `http://localhost:8080/api/users/${this.user.id}/profile-image/raw`;
        }
      });
  }

  onFileChange(ev: any) {
    const f: File = ev.target.files[0];
    if (!f) return;
    this.selectedFile = f;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(f);
  }

  uploadImage() {
    if (!this.selectedFile) return;
    const fd = new FormData();
    fd.append('file', this.selectedFile);
    this.uploadInProgress = true;
    this.http.post(`http://localhost:8080/api/users/${this.user.id}/profile-image`, fd)
      .subscribe({
        next: () => {
          this.snack.open('Photo mise à jour', 'Fermer', { duration:2000 });
          this.session.setUser({ ...this.user, profileImageUrl: this.previewUrl });
          this.loadProfileMeta();
          this.uploadInProgress = false;
        },
        error: () => {
          this.snack.open('Erreur upload', 'Fermer', { duration:2000 });
          this.uploadInProgress = false;
        }
      });
  }

  saveProfile() {
    if (this.userForm.invalid) return;
    const upd = this.userForm.value;
    // on ne modifie pas le password ici
    this.http.put<any>(`http://localhost:8080/api/users/${this.user.id}`, upd)
      .subscribe({
        next: user => {
          this.snack.open('Profil enregistré', 'Fermer', { duration:2000 });
          this.session.setUser(user);
        },
        error: () => this.snack.open('Erreur mise à jour', 'Fermer', {duration:2000})
      });
  }
}
