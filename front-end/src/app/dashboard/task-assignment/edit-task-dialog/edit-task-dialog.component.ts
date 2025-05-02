// src/app/task-assignment/edit-task-dialog/edit-task-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatSelectModule }     from '@angular/material/select';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SessionStorageService }   from '../../../services/session-storage.service';

export interface SimpleUser { id: number; prenom: string; nom: string; }
export interface EditTaskData { id: number; }

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})
export class EditTaskDialogComponent implements OnInit {
  form: FormGroup;
  users: SimpleUser[] = [];
  outilsList: string[] = [];
  separatorKeysCodes = [13, 188];
  projectPdfFile?: File;
  attachmentsFiles: File[] = [];
  existingAttachments: { id: number, fileName: string }[] = [];
  removeAttIds: number[] = [];

  readonly API = 'http://localhost:8080/api';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private session: SessionStorageService,
    private dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTaskData
  ) {
    this.form = this.fb.group({
      name:       ['', Validators.required],
      description:['', Validators.required],
      assignedTo: [[], Validators.required],
      deadline:   ['', Validators.required],
      status:     ['', Validators.required]
    });
  }

  ngOnInit() {
    // 1) charger liste des users
    this.http.get<SimpleUser[]>(`${this.API}/users`).subscribe(u => this.users = u);
    // 2) charger la tâche
    this.http.get<any>(`${this.API}/taches/${this.data.id}`)
      .subscribe(t => {
        this.form.patchValue({
          name: t.name,
          description: t.description,
          assignedTo: t.assignedTo.map((u:any)=>u.id),
          deadline: t.deadline,
          status: t.status
        });
        this.outilsList = t.outils ? t.outils.split(',').map((s:string)=>s.trim()) : [];
        // attachments PDF et autres
        this.existingAttachments = t.attachments
          .filter((a:any)=>a.fileType!=='application/pdf')
          .map((a:any)=>({ id: a.id, fileName: a.fileName }));
      });
  }

  addOutil(event: MatChipInputEvent): void {
    const v = (event.value || '').trim();
    if (v) {
      this.outilsList.push(v);
    }
    // Au lieu de event.input?.value = '';
    if (event.input) {
      event.input.value = '';
    }
  }
  
  removeOutil(o: string) {
    this.outilsList = this.outilsList.filter(x=>x!==o);
  }

  onProjectPdfChange(ev: any) {
    this.projectPdfFile = ev.target.files[0];
  }
  onAttachmentsChange(ev: any) {
    this.attachmentsFiles = Array.from(ev.target.files);
  }

  // retirer une pièce existante
  removeExisting(att: {id:number}) {
    this.removeAttIds.push(att.id);
    this.existingAttachments = this.existingAttachments.filter(a=>a.id!==att.id);
  }

  submit() {
    if (this.form.invalid) return;
    const u = this.session.getUser();
    const payload = {
      ...this.form.value,
      outils: this.outilsList.join(', '),
      assignedBy: u.id,
      creationDate: this.form.value.deadline // ou votre champ date de création
    };
    const blob = new Blob([JSON.stringify(payload)], { type:'application/json' });
    const fd = new FormData();
    fd.append('data', blob);
    if (this.projectPdfFile) {
      fd.append('projectPdf', this.projectPdfFile, this.projectPdfFile.name);
    }
    this.attachmentsFiles.forEach(f=> fd.append('attachments', f, f.name));
    // envoi removeAttIds en query param
    let params = new HttpParams();
    this.removeAttIds.forEach(id=> params = params.append('removeAttIds', id));
    this.http.put(`${this.API}/taches/${this.data.id}`, fd, { params, responseType:'text' })
      .subscribe(() => this.dialogRef.close(true),
                 err=> console.error(err));
  }

  cancel() { this.dialogRef.close(false); }
}
