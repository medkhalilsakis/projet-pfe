import { Component, Inject } from '@angular/core';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { Meeting } from '../../../../../services/meeting.service';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-meeting-dialog',
  templateUrl: './meeting-dialog.component.html',
  imports:[
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatDatepickerModule
  ]
})
export class MeetingDialogComponent {
  form;
  allUsers: { id: number; name: string }[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MeetingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { allUsers: any[] }
  ) {
    this.allUsers = data.allUsers;

    this.form = this.fb.group({
      subject: ['', Validators.required],
      date: ['', Validators.required],
      participants: [<string[]>[], Validators.required],
      description: [''],
      attachments: [null]
    });
  }

  save() {
    if (this.form.valid) {
      const m = this.form.value as Meeting;
      this.dialogRef.close(m);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.patchValue({ attachments: input.files as any });
    }
  }
}
