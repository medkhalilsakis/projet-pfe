import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SessionStorageService } from '../../../services/session-storage.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  type: string;
  description: string;
  visibilite: string;
  invitedUsers: User[];
}

@Component({
  selector: 'app-parametres-projet',
  standalone: true,
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <div *ngIf="projectForm">
      <h2 class="title">Paramètres du projet</h2>
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="project-form">
        <div class="form-field">
          <label>Nom :</label>
          <input type="text" formControlName="name">
        </div>
        <div class="form-field">
          <label>Type :</label>
          <input type="text" formControlName="type">
        </div>
        <div class="form-field">
          <label>Description :</label>
          <textarea formControlName="description"></textarea>
        </div>
        <div class="form-field">
          <label>Visibilité :</label>
          <select formControlName="visibilite">
            <option value="privée">Privé</option>
            <option value="public">Public</option>
          </select>
        </div>
        <button mat-raised-button color="primary" type="submit" [disabled]="projectForm.invalid">
          Enregistrer les modifications
        </button>
      </form>

      <h3 class="section-title">Utilisateurs invités</h3>
      <ul class="invited-list">
        <li *ngFor="let user of invitedUsers">
          {{ user.prenom }} {{ user.nom }} ({{ user.email }})
          <button mat-button color="warn" (click)="removeInvitedUser(user)">Retirer</button>
        </li>
      </ul>

      <h3 class="section-title">Ajouter un invité</h3>
      <div class="search-section">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Recherche par nom ou prénom">
      </div>
      <ul class="available-list">
        <li *ngFor="let user of availableUsers">
          {{ user.prenom }} {{ user.nom }} ({{ user.email }})
          <button mat-button color="primary" (click)="inviteUser(user)">Inviter</button>
        </li>
      </ul>

      <div class="actions">
        <button mat-button (click)="close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [`
    .title {
      margin-top: 16px;
      text-align: center;
      font-size: 22px;
    }
    .section-title {
      margin-top: 24px;
      font-size: 18px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 4px;
    }
    .project-form {
      margin: 16px 0;
    }
    .form-field {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    .form-field label {
      width: 120px;
      font-weight: bold;
    }
    .form-field input, 
    .form-field textarea, 
    .form-field select {
      flex: 1;
      padding: 6px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .form-field textarea {
      height: 80px;
      resize: vertical;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    ul li {
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 8px;
      background-color: #f7f7f7;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    .search-section {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .actions {
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class ParametresProjetComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  projectData!: Project;
  invitedUsers: User[] = [];
  availableUsers: User[] = [];
  searchQuery: string = '';
  projectId!: number;

  // Subject et abonnement pour la recherche en temps réel
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private sessionStorage: SessionStorageService,
    public dialogRef: MatDialogRef<ParametresProjetComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { projectId: number }
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du projet : depuis la route ou depuis les données injectées
    const routeId = this.route.snapshot.paramMap.get('id');
    this.projectId = routeId ? Number(routeId) : (this.data ? this.data.projectId : 0);
    if (!this.projectId) {
      this.snackBar.open('Projet non identifié', 'Fermer', { duration: 3000 });
      this.dialogRef.close();
      return;
    }
    this.loadProjectDetails();

    // Abonnement pour la recherche en temps réel
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((query: string) => this.searchUsers(query));
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  loadProjectDetails(): void {
    this.http.get<Project>(`http://localhost:8080/api/projects/${this.projectId}`)
      .subscribe({
        next: (data) => {
          this.projectData = data;
          this.invitedUsers = data.invitedUsers || [];
          this.initializeForm();
        },
        error: err => this.snackBar.open('Erreur lors du chargement du projet', 'Fermer', { duration: 3000 })
      });
  }

  initializeForm(): void {
    this.projectForm = this.fb.group({
      name: [this.projectData.name, Validators.required],
      type: [this.projectData.type, Validators.required],
      description: [this.projectData.description],
      visibilite: [this.projectData.visibilite, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;
    const payload = this.projectForm.value;
    this.http.post(`http://localhost:8080/api/projects/commit?projectId=${this.projectId}`, payload, { responseType: 'text' })
      .subscribe({
        next: res => {
          this.snackBar.open(res, 'Fermer', { duration: 3000 });
          this.loadProjectDetails();
        },
        error: err => this.snackBar.open('Erreur lors de la mise à jour du projet', 'Fermer', { duration: 3000 })
      });
  }

  // Déclenché à chaque changement dans le champ de recherche
  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  // Recherche d'utilisateurs en temps réel
  searchUsers(query: string): void {
    if (!query.trim()) {
      this.availableUsers = [];
      return;
    }
    this.http.get<User[]>(`http://localhost:8080/api/users/search?query=${query}`)
      .subscribe({
        next: users => {
          // Exclure les utilisateurs déjà invités
          this.availableUsers = users.filter(u => !this.invitedUsers.some(inv => inv.id === u.id));
        },
        error: err => this.snackBar.open('Erreur lors de la recherche des utilisateurs', 'Fermer', { duration: 3000 })
      });
  }

  inviteUser(user: User): void {
    const payload = {
      userId: user.id.toString(),
      status: "pending"
    };
    this.http.post(`http://localhost:8080/api/projects/${this.projectId}/invite`, payload, { responseType: 'text' })
      .subscribe({
        next: res => {
          this.snackBar.open(res, 'Fermer', { duration: 3000 });
          // Recharger automatiquement les détails du projet pour mettre à jour la liste des invités
          this.loadProjectDetails();
          // Réinitialiser le champ de recherche et la liste des utilisateurs disponibles
          this.searchQuery = '';
          this.availableUsers = [];
        },
        error: err => this.snackBar.open('Erreur lors de l\'invitation', 'Fermer', { duration: 3000 })
      });
  }

  removeInvitedUser(user: User): void {
    if (!confirm(`Voulez-vous retirer ${user.prenom} ${user.nom} ?`)) return;
    this.http.delete(`http://localhost:8080/api/projects/${this.projectId}/invite/${user.id}`, { responseType: 'text' })
      .subscribe({
        next: res => {
          this.snackBar.open(res, 'Fermer', { duration: 3000 });
          this.loadProjectDetails();
        },
        error: err => this.snackBar.open('Erreur lors du retrait de l\'invitation', 'Fermer', { duration: 3000 })
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
