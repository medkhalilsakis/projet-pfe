import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-description-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h1 mat-dialog-title>Finalisez votre projet</h1>
    <div mat-dialog-content>
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Nom du projet</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="projectForm.get('name')?.invalid">Ce champ est obligatoire</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Type de projet</mat-label>
          <mat-select formControlName="type">
            <mat-option value="WEB">Application Web</mat-option>
            <mat-option value="MOBILE">Application Mobile</mat-option>
            <mat-option value="IA">Intelligence Artificielle</mat-option>
            <mat-option value="DATA">Science des Données</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Visibilité</mat-label>
          <mat-select formControlName="visibilite">
            <mat-option value="public">Public</mat-option>
            <mat-option value="prive">Privé</mat-option>
          </mat-select>
        </mat-form-field>

        <div mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Annuler</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="projectForm.invalid">Finaliser</button>
        </div>
      </form>
    </div>
  `
})
export class ProjectDescriptionDialogComponent {
  projectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      type: ['WEB', Validators.required],
      description: [''],
      visibilite: ['prive', Validators.required]
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      // On retourne les données du formulaire
      this.dialogRef.close(this.projectForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}