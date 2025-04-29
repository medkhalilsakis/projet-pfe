// src/app/dashboard/task-assignment/new-task-dialog/new-task-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../../services/session-storage.service';

interface User { id: number; prenom: string; nom: string; }

@Component({
  selector: 'app-new-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './new-task-dialog.component.html',
  styleUrls: ['./new-task-dialog.component.css']
})
export class NewTaskDialogComponent {
  form: FormGroup;
  projectPdf!: File;
  attachments: File[] = [];
  users: User[] = [];

  // pour MatChips
  outilsList: string[] = [];
  readonly separatorKeysCodes: number[] = [13, 188]; // Enter, comma

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewTaskDialogComponent>,
    private http: HttpClient,
    private sessionStorage: SessionStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      name:       ['', Validators.required],
      description:['', Validators.required],
      assignedTo: [[]],             // multiple select facultatif
      deadline:   ['', Validators.required],
      status:     ['a_developper', Validators.required]
    });

    this.http.get<User[]>('http://localhost:8080/api/users')
      .subscribe(u => this.users = u);
  }

  // Ajouter un chip
  addOutil(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.outilsList.push(value);
    }
    // Effacer l’input
    if (event.input) {
      event.input.value = '';
    }
  }

  // Retirer un chip
  removeOutil(outil: string): void {
    const idx = this.outilsList.indexOf(outil);
    if (idx >= 0) {
      this.outilsList.splice(idx, 1);
    }
  }

  onProjectPdfChange(e: any) {
    this.projectPdf = e.target.files[0];
  }

  onAttachmentsChange(e: any) {
    this.attachments = Array.from(e.target.files);
  }

  submit() {
    if (this.form.invalid || !this.projectPdf) {
      return;
    }

    const currentUser = this.sessionStorage.getUser();

    const payload: any = {
      ...this.form.value,
      creationDate: new Date().toISOString().split('T')[0],
      outils: this.outilsList.join(', '),
      assignedBy: currentUser.id,
    };

    const jsonBlob = new Blob(
      [JSON.stringify(payload)],
      { type: 'application/json' }
    );

    const fd = new FormData();
    fd.append('data', jsonBlob);
    fd.append('projectPdf', this.projectPdf, this.projectPdf.name);
    this.attachments.forEach(f => fd.append('attachments', f, f.name));

        this.http.post(
      'http://localhost:8080/api/taches',
      fd,
      { responseType: 'text' as 'json' } 
    ).subscribe({
      next: () => this.dialogRef.close(true),
      error: err => console.log(err)
    });

  }

  cancel() {
    this.dialogRef.close(false);
  }
}
