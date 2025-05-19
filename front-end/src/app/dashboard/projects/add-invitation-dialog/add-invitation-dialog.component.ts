import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../../services/session-storage.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-add-invitation-dialog',
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule],
  templateUrl: './add-invitation-dialog.component.html',
  styleUrl: './add-invitation-dialog.component.css'
})
export class AddInvitationDialogComponent implements OnInit{
    form: FormGroup;
    userFilter = '';

  private readonly API = 'http://localhost:8080/api';
  users: any[] = [];

constructor(
     private fb: FormBuilder,
     private http: HttpClient,
    private session: SessionStorageService,
    public dialogRef: MatDialogRef<AddInvitationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { projectId: number }
  ) {
    this.form = this.fb.group({
  users: [[], Validators.required],  // Add users control
    });
  }
  ngOnInit() {
    this.loadUsers();
  }
  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
  private loadUsers() {
      this.http.get<any[]>(`${this.API}/users`)
        .pipe(
          map(list => list.filter(u => u.id !== this.session.getUser()?.id))
        )
        .subscribe(users => this.users = users);
    }
    get filteredUsers(): any[] {
        const q = this.userFilter.toLowerCase().trim();
        return this.users.filter(u =>
          `${u.prenom} ${u.nom}`.toLowerCase().includes(q)
        );
      }

  cancel() {
    this.dialogRef.close();
  }


}
