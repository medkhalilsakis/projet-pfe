import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

export interface EditUserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  genre: string;
  ncin: string;
  dateEmbauche: string;
  salaire: number;
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserData
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nom:          [this.data.nom, Validators.required],
      prenom:       [this.data.prenom, Validators.required],
      email:        [this.data.email, [Validators.required, Validators.email]],
      genre:        [this.data.genre, Validators.required],
      ncin:         [this.data.ncin, Validators.required],
      dateEmbauche: [this.data.dateEmbauche, Validators.required],
      salaire:      [this.data.salaire, [Validators.required, Validators.min(0)]],
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.value;
    this.http
      .put(`http://localhost:8080/api/users/supervisor/${this.data.id}`, payload)
      .subscribe({
        next: () => {
          this.snack.open('Mise à jour réussie','Fermer',{duration:2000});
          this.dialogRef.close(true);
        },
        error: err => {
          this.snack.open(err.error?.message || 'Erreur mise à jour','Fermer',{duration:2000});
        }
      });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
