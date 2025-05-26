// src/app/modules/your-module/test-scenario/test-scenario.component.ts

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit }           from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA }        from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar }                          from '@angular/material/snack-bar';
import { TestScenario, TestScenarioStep } from '../../../../models/test-scenario.model';
import { SessionStorageService } from '../../../../services/session-storage.service';
import { TestScenarioService } from '../../../../services/test-scenario.service';

@Component({
  selector: 'app-test-scenario',
  templateUrl: './test-scenario.component.html',
  styleUrls: ['./test-scenario.component.css'],
  imports:[
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FlexLayoutModule,
    MatIconModule
  ]
})
export class TestScenarioComponent implements OnInit {

  // Formulaire réactif
  scenarioForm: FormGroup;

  // ID du projet transmis par ScenarioTest(...)
  private projectId: number;
  // ID du superviseur courant
  private superviseurId: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TestScenarioComponent>,
    @Inject(MAT_DIALOG_DATA) data: { projectId: number },
    private session: SessionStorageService,
    private svc: TestScenarioService,
    private snack: MatSnackBar
  ) {
    this.projectId     = data.projectId;
    this.superviseurId = this.session.getUser().id;

    // Initialisation du formulaire
    this.scenarioForm = this.fb.group({
      name:        ['', Validators.required],
      description: [''],
      steps:       this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    // On démarre avec une étape vide par défaut
    this.addStep();
  }

  /** Accès pratique au FormArray steps */
  get steps(): FormArray {
    return this.scenarioForm.get('steps') as FormArray;
  }

  /** Ajoute une ligne d’étape */
  addStep(): void {
    const stepGroup = this.fb.group({
      description: ['', Validators.required],
      expected:    ['', Validators.required]
    });
    this.steps.push(stepGroup);
  }

  /** Retire l’étape d’index i */
  removeStep(i: number): void {
    this.steps.removeAt(i);
  }

  /** Envoi du formulaire */
  submit(): void {
    if (this.scenarioForm.invalid) { return; }

    // Construction de l’objet à envoyer
    const dto: TestScenario = {
      name:          this.scenarioForm.value.name,
      description:   this.scenarioForm.value.description,
      projectId:     this.projectId,
      superviseurId: this.superviseurId,
      steps:         this.scenarioForm.value.steps as TestScenarioStep[]
    };

    // Appel du service
    this.svc.create(dto).subscribe({
      next: (saved) => {
        this.snack.open('Scénario créé avec succès !', 'OK', { duration: 2500 });
        // renvoyer true pour indiquer au parent qu’il faut rafraîchir
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Échec création scénario', err);
        this.snack.open('Erreur lors de la création', 'OK', { duration: 3000 });
      }
    });
  }

  /** Annulation */
  cancel(): void {
    this.dialogRef.close(false);
  }
}
