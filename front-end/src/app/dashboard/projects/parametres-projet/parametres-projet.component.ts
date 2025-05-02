import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';

export interface User {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  status: 'pending' | 'accepted';
}

@Component({
  selector: 'app-parametres-projet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './parametres-projet.component.html',
  styleUrls: ['./parametres-projet.component.css']
})
export class ParametresProjetComponent implements OnInit, OnDestroy {
  projectForm!: FormGroup;
  invitedUsers: User[] = [];
  availableUsers: User[] = [];
  searchQuery = '';
  projectId!: number;

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ParametresProjetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {}

  ngOnInit(): void {
    this.projectId = this.data.projectId;
    this.loadProjectDetails();

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => this.searchUsers(query));
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  private loadProjectDetails(): void {
    this.http
      .get<any>(`http://localhost:8080/api/projects/${this.projectId}`)
      .subscribe(data => {
        this.projectForm = this.fb.group({
          name: [data.name, Validators.required],
          type: [data.type, Validators.required],
          description: [data.description],
          visibilite: [data.visibilite, Validators.required]
        });
        this.invitedUsers = data.invitedUsers || [];
      });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;
    this.http
      .post(
        `http://localhost:8080/api/projects/commit?projectId=${this.projectId}`,
        this.projectForm.value,
        { responseType: 'text' }
      )
      .subscribe(() => {
        this.snackBar.open('Modifications enregistrées', 'Fermer', { duration: 3000 });
        this.loadProjectDetails();
      });
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  private searchUsers(query: string): void {
    if (!query.trim()) {
      this.availableUsers = [];
      return;
    }
    this.http
      .get<User[]>(`http://localhost:8080/api/users/search?query=${query}`)
      .subscribe(users => {
        this.availableUsers = users.filter(
          u => !this.invitedUsers.some(inv => inv.id === u.id)
        );
      });
  }

  inviteUser(user: User): void {
    this.http
      .post(
        `http://localhost:8080/api/projects/${this.projectId}/invite`,
        { userId: user.id.toString(), status: 'pending' },
        { responseType: 'text' }
      )
      .subscribe(() => {
        this.snackBar.open(`${user.prenom} ${user.nom} invité`, 'Fermer', { duration: 3000 });
        this.loadProjectDetails();
        this.searchQuery = '';
        this.availableUsers = [];
      });
  }

  removeInvitedUser(user: User): void {
    this.http
      .delete(
        `http://localhost:8080/api/projects/${this.projectId}/invite/${user.id}`,
        { responseType: 'text' }
      )
      .subscribe(() => {
        this.snackBar.open(`${user.prenom} ${user.nom} retiré`, 'Fermer', { duration: 3000 });
        this.loadProjectDetails();
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}
