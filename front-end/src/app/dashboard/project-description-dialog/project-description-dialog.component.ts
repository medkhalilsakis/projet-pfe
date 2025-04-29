// src/app/project-description-dialog/project-description-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-project-description-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
        <!-- Nom du projet -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nom du projet</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="projectForm.get('name')?.hasError('required')">
            Le nom est obligatoire
          </mat-error>
        </mat-form-field>

        <!-- Type de projet -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Type de projet</mat-label>
          <mat-select formControlName="type">
            <mat-option value="WEB">Application Web</mat-option>
            <mat-option value="MOBILE">Application Mobile</mat-option>
            <mat-option value="IA">Intelligence Artificielle</mat-option>
            <mat-option value="DATA">Science des Données</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <!-- Sélection d’une tâche libre -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Tâche à associer (facultatif)</mat-label>
          <mat-select formControlName="taskId">
            <mat-option [value]="null">— Aucune —</mat-option>
            <mat-option *ngFor="let t of tasks" [value]="t.id">
              {{ t.name }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Visibilité -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Visibilité</mat-label>
          <mat-select formControlName="visibilite">
            <mat-option value="public">Public</mat-option>
            <mat-option value="prive">Privé</mat-option>
          </mat-select>
        </mat-form-field>

        <!-- Invitations -->
        <mat-form-field appearance="outline" class="full">
          <mat-label>Inviter des utilisateurs (optionnel)</mat-label>
          <input matInput placeholder="Rechercher" [(ngModel)]="userFilter"
                 [ngModelOptions]="{ standalone: true }">
          <mat-select formControlName="users" multiple>
            <mat-option *ngFor="let u of filteredUsers" [value]="u.id">
              {{ u.prenom }} {{ u.nom }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Annuler</button>
          <button mat-raised-button color="primary" type="submit"
                  [disabled]="projectForm.invalid">
            Finaliser
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .full { width: 100%; margin-bottom: 1rem; }
  `]
})
export class ProjectDescriptionDialogComponent implements OnInit {
  projectForm: FormGroup;
  users: User[] = [];
  tasks: { id: number; name: string }[] = [];
  userFilter = '';

  private readonly API = 'http://localhost:8080/api';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProjectDescriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number },
    private session: SessionStorageService,
    private http: HttpClient
  ) {
    this.projectForm = this.fb.group({
      name:        ['', Validators.required],
      type:        ['WEB', Validators.required],
      description: [''],
      visibilite:  ['prive', Validators.required],
      users:       [[]],
      taskId:      [null]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadFreeTasks();
  }

  private loadUsers() {
    this.http.get<User[]>(`${this.API}/users`)
      .pipe(
        map(list => list.filter(u => u.id !== this.session.getUser()?.id))
      )
      .subscribe(users => this.users = users);
  }

  private loadFreeTasks() {
    this.http.get<{ id:number; name:string }[]>(`${this.API}/taches/free`)
      .subscribe(tasks => this.tasks = tasks);
  }

  get filteredUsers(): User[] {
    const q = this.userFilter.toLowerCase().trim();
    return this.users.filter(u =>
      `${u.prenom} ${u.nom}`.toLowerCase().includes(q)
    );
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.dialogRef.close(this.projectForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
