import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    dateEmbauche: ['', Validators.required],
    salaire: [0, [Validators.required, Validators.min(0)]]
  });

  isLoading = false;
  hidePassword = true;

  onSubmit() {
    if (this.registerForm.invalid) return;

    const userData = {
      ...this.registerForm.value,
      role: { id: 2 }
    };

    this.isLoading = true;

    this.http.post('http://localhost:8080/api/users', userData).subscribe({
      next: () => {
        this.snackBar.open('Compte créé avec succès ! Redirection...', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.snackBar.open(
          error.error?.message || 'Erreur lors de l\'inscription',
          'Fermer',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      },
      complete: () => this.isLoading = false
    });
  }
}