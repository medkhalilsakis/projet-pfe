import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../models/user.model';
import { Meeting } from '../../../models/meeting.model';
import { Project } from '../../../models/project.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ProjectService } from '../../../services/project.service';
import { FlexLayoutModule } from '@angular/flex-layout';

interface MeetingDialogPayload {
  allUsers: User[];
}

@Component({
  selector: 'app-meeting-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    FlexLayoutModule
  ],
  templateUrl: './meeting-dialog.component.html',
  styleUrls: ['./meeting-dialog.component.css']
})
export class MeetingDialogComponent implements OnInit {
  form!: FormGroup;
  allUsers: User[];
  projects: Project[] = [];

  minDate!: string;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MeetingDialogComponent, Meeting>,
    @Inject(MAT_DIALOG_DATA) public data: MeetingDialogPayload,
    private projectService: ProjectService
  ) {
    this.allUsers = data.allUsers;
  }

  ngOnInit(): void {
    const now = new Date();
    this.minDate = now.toISOString().substring(0,16);

    // Charger la liste des projets pour le select
    this.projectService.getAllProjects().subscribe(list => this.projects = list);

    // Construire le formulaire avec champ projectId optionnel
    this.form = this.fb.group({
      projectId:       [null],
      subject:         ['', Validators.required],
      date:            ['', [Validators.required, this.dateNotInPast.bind(this)]],
      participantsIds: [[], Validators.required],
      description:     ['', Validators.required],
      attachments:     [null]
    });
  }

  dateNotInPast(ctrl: FormControl) {
    if (!ctrl.value) return null;
    const chosen = new Date(ctrl.value).getTime();
    return chosen < Date.now() ? { past: true } : null;
  }

  submit(): void {
    if (this.form.invalid) return;

    const meeting: Meeting = {
      subject: this.form.value.subject,
      date: this.form.value.date,
      participantsIds: this.form.value.participantsIds,
      description: this.form.value.description,
      projectId: this.form.value.projectId,               // peut être null
      attachments: this.form.value.attachments,
      createdAt: new Date()
    };

    this.dialogRef.close(meeting);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onFileChange(event: any): void {
    const files: FileList = event.target.files;
    this.form.patchValue({ attachments: files });
  }
}
