import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/users.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-edit-user-dialog',
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule
  ]
})
export class EditUserDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) { }

  ngOnInit(): void {
    // Initialise le formulaire avec les données de l'utilisateur
    this.form = this.fb.group({
      nom: [this.data.nom, [Validators.required, Validators.maxLength(100)]],
      prenom: [this.data.prenom, [Validators.required, Validators.maxLength(100)]],
      email: [this.data.email, [Validators.required, Validators.email]],
      genre: [this.data.genre, Validators.required],
      ncin: [this.data.ncin, [Validators.required, Validators.pattern(/^\d{8}$/)]],
      dateEmbauche: [this.data.dateEmbauche, Validators.required],
      salaire: [this.data.salaire, [Validators.required, Validators.min(0)]]
    });
  }

  /** Ferme la boîte de dialogue sans enregistrer */
  cancel(): void {
    this.dialogRef.close(false);
  }

  /** Enregistre les modifications et ferme la boîte de dialogue */
  save(): void {
    if (this.form.invalid) {
      this.snack.open('Veuillez corriger les erreurs avant de sauvegarder.', 'Fermer', { duration: 3000 });
      return;
    }

    const updated: Partial<User> = {
      ...this.data,
      ...this.form.value
    };

    this.userService
      .updateUser(this.data.id!, this.form.value as Partial<User>)
      .subscribe({
        next: () => {
          this.snack.open('Utilisateur mis à jour', 'Fermer', { duration: 2000 });
          this.dialogRef.close(true);
        },
        error: () => {
          this.snack.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
        }
      });


  }
}
