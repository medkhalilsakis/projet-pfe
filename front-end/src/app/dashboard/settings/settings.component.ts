import { Component, OnInit ,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';

import { EncryptionService } from '../../services/encryption.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    MatSelectModule
  ]
})
export class SettingsComponent implements OnInit {

  updateUserForm!: FormGroup;
  user: any;

  emailStepStarted = false;
  emailVerified = false;
  otpVerifiedEmail = false;
  currentEmailInput = '';
  otpEmailInput = '';
  newEmailInput = '';

  passwordStepStarted = false;
  passwordVerified = false;
  otpVerifiedPassword = false;
  currentPasswordInput = '';
  otpPasswordInput = '';
  newPasswordInput = '';
  confirmPasswordInput = '';

  currentUsername = '';
  isLoading = false;
  private encryptionService = inject(EncryptionService);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sessionStorage: SessionStorageService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.sessionStorage.getUser();
    this.currentUsername = this.user.username;

    this.updateUserForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      ncin: ['', Validators.required],
      username: ['', Validators.required],
    });

    this.loadUserData(this.user.id);
  }

  loadUserData(id: number) {
    this.http.get<any>(`http://localhost:8080/api/users/${id}`).subscribe(user => {
      this.updateUserForm.patchValue(user);
      this.user = user;
    });
  }

  onSubmit() {
    if (this.updateUserForm.invalid) return;

    const formData = this.updateUserForm.value;
    const formattedData = {
      ...formData,
      salaire: this.user.salaire,
      dateEmbauche: this.user.dateEmbauche,
      role_id: this.user.role.id,
      email: this.user.email,
    };

    this.http.put(`http://localhost:8080/api/users/update/${this.user.id}`, formattedData).subscribe({
      next: () => this.snackBar.open("Informations mises à jour avec succès.", 'Fermer', { duration: 3000 }),
      error: err => console.error('Erreur lors de la mise à jour de l’utilisateur :', err)
    });
  }

  startEmailChange() {
    this.emailStepStarted = true;
  }

  verifyCurrentEmail() {
    if (this.currentEmailInput === this.user.email) {
      this.emailVerified = true;
      this.sendOtpToEmail();
    } else {
      this.snackBar.open('L’email saisi ne correspond pas à votre email actuel.', 'Fermer', { duration: 3000 });
    }
  }

  sendOtpToEmail() {
    this.http.post(`http://localhost:8080/api/users/send-otp/${this.user.username}`, null, {
    }).subscribe({
      next: () => this.snackBar.open('OTP envoyé avec succès.', 'Fermer', { duration: 3000 }),
      error: err => this.snackBar.open('Erreur lors de l’envoi du code OTP.', 'Fermer', { duration: 3000 })
    });
  }

  verifyOtpForEmail() {
    const code = this.otpEmailInput;

    this.http.post('http://localhost:8080/api/users/verify-otp', null, {
      params: new HttpParams().set('username', this.currentUsername).set('code', code)
    }).subscribe({
      next: () => this.otpVerifiedEmail = true,
      error: () => this.snackBar.open('Code OTP invalide ou expiré', 'Fermer', { duration: 5000 })
    });
  }

  confirmNewEmail() {
    const formattedData = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      ncin: this.user.ncin,
      username: this.user.username,
      email: this.newEmailInput,
      salaire: this.user.salaire,
      dateEmbauche: this.user.dateEmbauche,
      role_id: this.user.role.id,
    };

    this.http.put(`http://localhost:8080/api/users/update/${this.user.id}`, formattedData).subscribe({
      next: () => this.snackBar.open("Email mis à jour avec succès.", 'Fermer', { duration: 3000 }),
      error: err => console.error('Erreur lors de la mise à jour de l’utilisateur :', err)
    });
  }

  startPasswordChange() {
    this.passwordStepStarted = true;
  }

  verifyCurrentPassword() {
    const password = this.currentPasswordInput;

    const encryptedPassword = this.encryptionService.encrypt(password ?? '');
      
    this.http.post('http://localhost:8080/api/users/login', {
      username: this.user.username,
      password: encryptedPassword
    }).subscribe({
      next: () => {
        this.passwordVerified = true;
        this.sendOtpToEmail();
      },
      error: () => this.snackBar.open('Mot de passe incorrect.', 'Fermer', { duration: 3000 })
    });
  }

  verifyOtpForPassword() {
    const code = this.otpPasswordInput;


        this.http.post(`http://localhost:8080/api/users/verify-otp`, null, {
      params: new HttpParams().set('username', this.user.username).set('code', code)
    }).subscribe({
      next: () => this.otpVerifiedPassword = true,
      error: () => this.snackBar.open('Code OTP invalide ou expiré', 'Fermer', { duration: 5000 })
    });
  }


  confirmNewPassword() {
    if (this.newPasswordInput !== this.confirmPasswordInput) {
      this.snackBar.open('Les mots de passe ne correspondent pas.', 'Fermer', { duration: 3000 });
      return;
    }
    const encryptedPassword = this.encryptionService.encrypt(this.newPasswordInput ?? '');



const formattedData = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      ncin: this.user.ncin,
      username: this.user.username,
      email: this.newEmailInput,
      password:encryptedPassword,
      salaire: this.user.salaire,
      dateEmbauche: this.user.dateEmbauche,
      role_id: this.user.role.id,
    };
    this.http.put(`http://localhost:8080/api/users/update/${this.user.id}`,formattedData ).subscribe({
      next: () => this.snackBar.open('Mot de passe mis à jour avec succès.', 'Fermer', { duration: 3000 }),
      error: () => this.snackBar.open('Erreur lors de la mise à jour du mot de passe.', 'Fermer', { duration: 3000 })
    });
  }
}
