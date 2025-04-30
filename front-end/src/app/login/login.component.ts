import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../services/session-storage.service';
import { EncryptionService } from '../services/encryption.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  dateEmbauche: string;
  salaire: number;
  role: { id: number; nom: string };
  ncin: string;
  genre: string;
  // on ne garde **pas** password ici
}

type Mode = 'login' | 'forgot' | 'otp' | 'reset';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private sessionStorage = inject(SessionStorageService);
  private encryptionService = inject(EncryptionService);

  mode: Mode = 'login';
  isLoading = false;
  hidePassword = true;
  currentUsername = '';

  /** true si on vient du flux “mot de passe oublié”, false si flux login */
  private isForgotFlow = false;

  // FormGroups
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  resetForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPwd: ['', Validators.required]
  }, { validators: this.passwordsMatch });

  /** 1) Connexion initiale (login) */
  onSubmitCredentials() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.isForgotFlow = false;
    const { username, password } = this.loginForm.value;

    try {
      const encrypted = this.encryptionService.encrypt(password!);
      this.http.post('http://localhost:8080/api/users/login', { username, password: encrypted })
        .subscribe({
          next: () => {
            this.currentUsername = username!;
            this.mode = 'otp';
            this.snackBar.open('Code OTP envoyé à votre email', 'Fermer', { duration: 5000 });
          },
          error: err => this.handleLoginError(err),
          complete: () => this.isLoading = false
        });
    } catch {
      this.isLoading = false;
      this.snackBar.open('Erreur de chiffrement', 'Fermer', { duration: 5000 });
    }
  }

  /** 2) Mot de passe oublié : envoi OTP */
  onForgot() {
    if (this.forgotForm.invalid) return;
    this.isLoading = true;
    this.isForgotFlow = true;
    const email = this.forgotForm.value.email!;
    this.http.post('http://localhost:8080/api/users/forgot-password', { email })
      .subscribe({
        next: () => {
          this.currentUsername = email;  // on stocke l'email ici le temps de l'OTP
          this.mode = 'otp';
          this.snackBar.open('Code OTP envoyé à votre email', 'Fermer', { duration: 5000 });
        },
        error: () => this.snackBar.open('Erreur lors de l’envoi du code', 'Fermer', { duration: 5000 }),
        complete: () => this.isLoading = false
      });
  }

  /** 3) Vérification OTP */
  onSubmitOtp() {
    if (this.otpForm.invalid) return;
    this.isLoading = true;
    const code = this.otpForm.value.code!;
    this.http.post('http://localhost:8080/api/users/verify-otp', { username: this.currentUsername, code })
      .subscribe({
        next: () => {
          if (this.isForgotFlow) {
            this.mode = 'reset';
          } else {
            // flux login → on récupère d'abord l'objet User complet
            this.http.get<User>(`http://localhost:8080/api/users/username/${this.currentUsername}`)
              .subscribe({
                next: user => {
                  // supprime le mot de passe si jamais présent
                  // @ts-ignore
                  delete user.password;
                  this.sessionStorage.setUser(user);
                  this.router.navigate(['/dashboard']);
                },
                error: () => this.snackBar.open('Impossible de récupérer les infos utilisateur', 'Fermer', { duration: 5000 })
              });
          }
        },
        error: () => this.snackBar.open('Code OTP invalide ou expiré', 'Fermer', { duration: 5000 }),
        complete: () => this.isLoading = false
      });
  }

  /** 4) Réinitialisation du mot de passe */
  onResetPassword() {
    if (this.resetForm.invalid) return;
    this.isLoading = true;
    const payload = {
      email: this.currentUsername,
      code: this.otpForm.value.code,
      newPassword: this.resetForm.value.newPassword
    };
    this.http.post('http://localhost:8080/api/users/reset-password', payload)
      .subscribe({
        next: () => {
          this.snackBar.open('Mot de passe réinitialisé', 'Fermer', { duration: 5000 });
          this.resetAllForms();
          this.mode = 'login';
          this.loginForm.patchValue({ username: this.currentUsername });
        },
        error: () => this.snackBar.open('Erreur lors du reset', 'Fermer', { duration: 5000 }),
        complete: () => this.isLoading = false
      });
  }

  /** Validator pour confirmer les mots de passe */
  private passwordsMatch(group: FormGroup) {
    const pwd = group.get('newPassword')?.value;
    const confirm = group.get('confirmPwd')?.value;
    return pwd === confirm ? null : { mismatch: true };
  }

  /** Gestion des erreurs de login */
  private handleLoginError(error: any) {
    let msg = 'Erreur de connexion';
    if (error.status === 404) msg = 'Utilisateur non trouvé';
    else if (error.status === 401) msg = 'Mot de passe incorrect';
    else if (error.error?.message) msg = error.error.message;
    this.snackBar.open(msg, 'Fermer', { duration: 5000 });
    this.isLoading = false;
  }


  private resetAllForms(): void {
    this.loginForm.reset();
    this.forgotForm.reset();
    this.otpForm.reset();
    this.resetForm.reset();
    this.hidePassword = true;
    this.isForgotFlow = false;
    this.currentUsername = '';
  }
}
