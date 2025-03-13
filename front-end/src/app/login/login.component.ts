import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SessionStorageService } from '../services/session-storage.service';
import { EncryptionService } from '../services/encryption.service';

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

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  

  otpForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  currentUsername = '';
  isLoading = false;
  hidePassword = true;
  showOtpSection = false;

  onSubmitCredentials() {
    if (this.loginForm.invalid) return;
  
    this.isLoading = true;
    const { username, password } = this.loginForm.value;
  
    try {
      const encryptedPassword = this.encryptionService.encrypt(password ?? '');
      
      this.http.post('http://localhost:8080/api/users/login', {
        username: username,
        password: encryptedPassword
      }).subscribe({
        next: () => {
          this.currentUsername = username ?? '';
          this.showOtpSection = true;
          this.snackBar.open('Code OTP envoyé à votre email', 'Fermer', { duration: 5000 });
          this.isLoading = false;
        },
        error: (error) => {
          this.handleLoginError(error);
          this.isLoading = false;
        }
      });
    } catch (encryptionError) {
      this.isLoading = false;
      this.snackBar.open('Erreur de chiffrement des identifiants', 'Fermer', { duration: 5000 });
    }
  }

  onSubmitOtp() {
    if (this.otpForm.invalid) return;

    this.isLoading = true;
    const code = this.otpForm.value.code ?? '';

    this.http.post('http://localhost:8080/api/users/verify-otp', null, {
      params: new HttpParams()
        .set('username', this.currentUsername)
        .set('code', code)
    }).subscribe({
      next: () => {
        this.fetchAndStoreUserData();
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Code OTP invalide ou expiré', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      },
      complete: () => this.isLoading = false
    });
  }

  private fetchAndStoreUserData() {
    this.http.get(`http://localhost:8080/api/users/username/${this.currentUsername}`).subscribe({
      next: (user: any) => {
        this.sessionStorage.saveUser(user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.snackBar.open('Erreur lors de la récupération des données utilisateur', 'Fermer', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  private handleLoginError(error: any) {
    let message = 'Erreur de connexion';
    
    if (error.status === 404) {
      message = 'Utilisateur non trouvé';
    } else if (error.status === 401) {
      message = 'Mot de passe incorrect';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.snackBar.open(message, 'Fermer', { duration: 5000 });
    this.isLoading = false;
  }
}