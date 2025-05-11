import { Component, Inject, ViewChild } from '@angular/core';
import {
  FormBuilder, FormArray, Validators, FormGroup,
  ValidatorFn, AbstractControl, ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { TestCaseService } from '../../../../../services/test-case.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FlexLayoutModule } from '@angular/flex-layout';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestCase } from '../../../../../models/test-case.model';

@Component({
  selector: 'app-test-case-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FlexLayoutModule
  ],
  templateUrl: './test-case-dialog.component.html'
})
export class TestCaseDialogComponent {
  @ViewChild(MatTable) table!: MatTable<any>;

  form: FormGroup;
  displayedColumns = ['stepDesc','action','expected','success','comment','remove'];

  constructor(
    private fb: FormBuilder,
    private tcService: TestCaseService,
    public dialogRef: MatDialogRef<TestCaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      projectId: number,
      testCase: TestCase | null
    }
  ) {
    const tc = data.testCase;
    this.form = this.fb.group({
      caseNumber: [
        tc?.caseNumber || '',
        {
          validators: [
            Validators.required,
            Validators.pattern(/^[1-9]\d*$/)
          ],
          asyncValidators: [ this.caseNumberUniqueValidator() ],
          updateOn: 'blur'
        }
      ],
      title:         [tc?.title || '', Validators.required],
      subsystem:     [tc?.subsystem || ''],
      description:   [tc?.description || ''],
      executionDate: [
        tc?.executionDate || '',
        [ Validators.required, this.maxTodayValidator() ]
      ],
      preconditions: [tc?.preconditions || ''],
      postconditions:[tc?.postconditions || ''],
      steps: this.fb.array([], [ Validators.required, Validators.minLength(1) ])
    });

    // Reconstruire les étapes existantes
    if (tc?.steps?.length) {
      tc.steps.forEach(step => this.addStep(step));
    }
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  addStep(initial?: any) {
    const fg = this.fb.group({
      stepDesc: [initial?.stepDesc || '', Validators.required],
      action:   [initial?.action   || '', Validators.required],
      expected: [initial?.expected || '', Validators.required],
      success:  [initial?.success  || false],
      comment:  [initial?.comment  || '']
    });
    this.steps.push(fg);
    Promise.resolve().then(() => this.table.renderRows());
  }

  removeStep(i: number) {
    this.steps.removeAt(i);
    Promise.resolve().then(() => this.table.renderRows());
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      const tc: TestCase = this.form.value;
      if (this.data.testCase?.id) {
        tc.id = this.data.testCase.id;
      }
      this.dialogRef.close(tc);
    }
  }

  maxTodayValidator(): ValidatorFn {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      if (!ctrl.value) return null;
      const val = new Date(ctrl.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return val > today ? { maxToday: true } : null;
    };
  }

  caseNumberUniqueValidator(): AsyncValidatorFn {
    return (ctrl: AbstractControl) => {
      const num = ctrl.value;
      if (!num) return of(null);
      // Si on est en édition et que le numéro n'a pas changé
      if (this.data.testCase?.caseNumber === num) {
        return of(null);
      }
      return this.tcService.exists(
        this.data.projectId,
        num
      ).pipe(
        map(exists => exists ? { caseNumberTaken: true } : null)
      );
    };
  }
}
