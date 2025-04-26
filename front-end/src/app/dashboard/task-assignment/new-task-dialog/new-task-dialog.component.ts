import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../services/users.service';

@Component({
  selector: 'app-new-task-dialog',
  templateUrl: './new-task-dialog.component.html',
  styleUrls: ['./new-task-dialog.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule    
  ]
})
export class NewTaskDialogComponent {
    form: FormGroup;
    projectPdf!: File;
    attachments: File[] = [];
    users: any[] = [];
  
    statuses = ['a_developper','en_test','suspendu','cloturé','terminé'];
  
    constructor(
      private fb: FormBuilder,
      private dialogRef: MatDialogRef<NewTaskDialogComponent>,
      private http: HttpClient,
      private session: SessionStorageService,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.form = this.fb.group({
        name: ['', Validators.required],
        description: ['', Validators.required],
        outils: ['', Validators.required],
        deadline: ['', Validators.required],
        status: ['a_developper', Validators.required],
        assignedTo: [null, Validators.required]
      });
      // charger la liste des utilisateurs
      this.http.get<User[]>('http://localhost:8080/api/users')
        .subscribe(u => this.users = u);
    }
  
    onProjectPdfChange(e: any) {
      this.projectPdf = e.target.files[0];
    }
    onAttachmentsChange(e: any) {
      this.attachments = Array.from(e.target.files);
    }
  
    submit() {
      if (this.form.invalid || !this.projectPdf) return;
      const data = this.form.value;
      data.creationDate = new Date().toISOString().split('T')[0];
      data.assignedBy = this.session.getUser().id;
      const fd = new FormData();
      fd.append('data', JSON.stringify(data));
      fd.append('projectPdf', this.projectPdf);
      this.attachments.forEach(f => fd.append('attachments', f));
  
      this.http.post('http://localhost:8080/api/taches', fd)
        .subscribe(() => this.dialogRef.close(true));
    }
  
    cancel() { this.dialogRef.close(false); }
  }
  export interface Tache {
    id: number;
    name: string;
    status: string;
    assignedTo: { nom: string; prenom: string };
    deadline: string;
  }