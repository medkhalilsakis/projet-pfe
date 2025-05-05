// bug-report-dialog.component.ts
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BugReport } from '../../../../../services/bug-report.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-bug-report-dialog',
  templateUrl: './bug-report-dialog.component.html',
  standalone: true,            // si vous utilisez standalone components
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule
  ]
})
export class BugReportDialogComponent {
  form;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BugReportDialogComponent>
  ) {
    this.form = this.fb.group({
      level: ['minor', Validators.required],
      description: ['', Validators.required],
      suggestions: [''],
      attachments: [null]    // on réinitialise ici aussi
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.form.patchValue({ attachments: input.files as any });
    }
  }

  save() {
    if (this.form.valid) {
      const br = this.form.value as BugReport;
      this.dialogRef.close(br);
    }
  }
}
