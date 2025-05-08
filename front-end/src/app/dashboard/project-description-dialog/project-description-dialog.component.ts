import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';

export interface User {
  id: number;
  nom: string;
  prenom: string;
}

@Component({
  selector: 'app-project-description-dialog',
  templateUrl: './project-description-dialog.component.html',
  styleUrls: ['./project-description-dialog.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    FlexLayoutModule
  ]
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
