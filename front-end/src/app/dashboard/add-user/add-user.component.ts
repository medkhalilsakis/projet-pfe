import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatCardModule
  ]
})
export class AddUserComponent {
  addUserForm: FormGroup;
  roles = [
    { value: 3, label: 'Superviseur' },
    { value: 2, label: 'Testeur' },
    { value: 1, label: 'Développeur' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.addUserForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      username: ['', Validators.required],
      ncin: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      date_embauche: ['', Validators.required],
      salaire: ['', [Validators.required, Validators.min(0)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.addUserForm.invalid) {
    return;
  }

  const formData = this.addUserForm.value;

  const formattedData = {
    ...formData,
    dateEmbauche: formData.date_embauche, // Assurez la correspondance du champ
    role_id: formData.role // Adapter le nom du champ pour correspondre à l'API
  };
    
    this.http.post('http://localhost:8080/api/users/signup', formattedData).subscribe({
      next: () => {
        this.snackBar.open('Utilisateur ajouté avec succès', 'Fermer', { duration: 3000 });
        this.addUserForm.reset();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'ajout de l\'utilisateur', 'Fermer', { duration: 3000 });
      }
    });
  }
}
