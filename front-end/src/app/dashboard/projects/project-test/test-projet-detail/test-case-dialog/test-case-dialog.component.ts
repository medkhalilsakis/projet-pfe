import { Component, Inject } from '@angular/core';
import { FormBuilder, FormArray, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TestCase } from '../../../../../services/test-case.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-test-case-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatDatepickerModule
  ],
  templateUrl: './test-case-dialog.component.html'
})
export class TestCaseDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TestCaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TestCase | null
  ) {
    // 1) Initialiser le formGroup **avant** patchValue
    this.form = this.fb.group({
      caseNumber:    ['', Validators.required],
      title:         ['', Validators.required],
      subsystem:     [''],
      description:   [''],
      executionDate: ['', Validators.required],
      preconditions: [''],
      postconditions:[''],
      steps:         this.fb.array([])
    });

    // 2) Si on édite un cas existant, patcher les valeurs
    if (data) {
      this.form.patchValue({
        caseNumber: data.caseNumber,
        title:      data.title,
        subsystem:  data.subsystem,
        description:data.description,
        executionDate: data.executionDate,
        preconditions: data.preconditions,
        postconditions:data.postconditions
        // NB: pour les steps, vous pouvez patcher manuellement ou reconstruire le FormArray
      });
      // Optionnel : reconstruire les steps si data.steps présent
      if (data.steps?.length) {
        data.steps.forEach(s => {
          this.steps.push(this.fb.group({
            stepDesc: [s.stepDesc, Validators.required],
            action:   [s.action,   Validators.required],
            expected: [s.expected, Validators.required],
            success:  [s.success],
            comment:  [s.comment]
          }));
        });
      }
    }
  }

  get steps() {
    return this.form.get('steps') as FormArray;
  }

  addStep() {
    this.steps.push(this.fb.group({
      stepDesc: ['', Validators.required],
      action:   ['', Validators.required],
      expected: ['', Validators.required],
      success:  [false],
      comment:  ['']
    }));
  }

  save() {
    if (this.form.valid) {
      const tc = this.form.value as TestCase;
      if (this.data?.id) {
        tc.id = this.data.id;
      }
      this.dialogRef.close(tc);
    }
  }
}
