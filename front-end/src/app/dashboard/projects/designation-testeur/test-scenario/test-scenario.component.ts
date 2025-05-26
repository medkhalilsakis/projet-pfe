// src/app/modules/your-module/test-scenario/test-scenario.component.ts
import { CommonModule }                 from '@angular/common';
import { Component, Inject, OnInit }    from '@angular/core';
import { FlexLayoutModule }             from '@angular/flex-layout';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule }           from '@angular/material/form-field';
import { MatIconModule }                from '@angular/material/icon';
import { MatInputModule }               from '@angular/material/input';
import { MatButtonModule }              from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { TestScenario, TestScenarioStep } from '../../../../models/test-scenario.model';
import { SessionStorageService }          from '../../../../services/session-storage.service';
import { TestScenarioService }            from '../../../../services/test-scenario.service';

@Component({
  selector: 'app-test-scenario',
  standalone: true,                // <— Important en Angular 14+ pour utiliser imports
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './test-scenario.component.html',
  styleUrls: ['./test-scenario.component.css']
})
export class TestScenarioComponent implements OnInit {

  scenarioForm: FormGroup;
  private projectId:     number;
  private superviseurId: number;

  selectedFile: File | null      = null;
  selectedFileName: string | null = null;

  constructor(
    private fb:         FormBuilder,
    private dialogRef:  MatDialogRef<TestScenarioComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) data: { projectId: number },
    private session:    SessionStorageService,
    private svc:        TestScenarioService,
    private snack:      MatSnackBar
  ) {
    this.projectId     = data.projectId;
    this.superviseurId = this.session.getUser().id!;

    this.scenarioForm = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      steps:       this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    // Au moins une étape
    this.addStep();
  }

  get steps(): FormArray {
    return this.scenarioForm.get('steps') as FormArray;
  }

  addStep(): void {
    this.steps.push(this.fb.group({
      description: ['', Validators.required],
      expected:    ['', Validators.required]
    }));
  }

  removeStep(i: number): void {
    this.steps.removeAt(i);
  }

  submit(): void {
    if (this.scenarioForm.invalid) { return; }

    const dto: TestScenario = {
      name:          this.scenarioForm.value.name,
      description:   this.scenarioForm.value.description,
      projectId:     this.projectId,
      superviseurId: this.superviseurId,
      steps:         this.scenarioForm.value.steps as TestScenarioStep[]
    };

    this.svc.save(dto).subscribe({
      next: () => {
        this.snack.open('Scénario créé avec succès !', 'OK', { duration: 2500 });
        this.dialogRef.close(true);
      },
      error: err => {
        console.error('Échec création scénario', err);
        this.snack.open('Erreur lors de la création', 'OK', { duration: 3000 });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      this.selectedFile = null;
      this.selectedFileName = null;
    }
  }
}
