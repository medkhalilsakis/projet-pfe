// src/app/initiation-phase/initiation-phase.component.ts
import { Component, ViewChild }                 from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { MatToolbarModule }                     from '@angular/material/toolbar';
import { MatIconModule }                        from '@angular/material/icon';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatFormFieldModule }                   from '@angular/material/form-field';
import { MatInputModule }                       from '@angular/material/input';
import { MatSelectModule }                      from '@angular/material/select';
import { MatOptionModule }                      from '@angular/material/core';
import { MatCheckboxModule }                    from '@angular/material/checkbox';
import { MatButtonModule }                      from '@angular/material/button';
import { AnalyseFaisabilite } from '../../../models/initiation-phase/analyse-faisabilite.model';
import { CahierDesCharges } from '../../../models/initiation-phase/cahier-des-charges.model';
import { Exigence } from '../../../models/initiation-phase/exigence.model';
import { InitiationPhase } from '../../../models/initiation-phase/initiation-phase.model';
import { PlanificationPhase } from '../../../models/initiation-phase/planification-phase.model';
import { InitiationPhaseService } from '../../../services/initiation-phase.service';
import { Priority } from '../../../enums/priority.enum';
import { StepperSelectionEvent } from '@angular/cdk/stepper';



@Component({
  standalone: true,
  selector: 'app-initiation-phase',
  templateUrl: './initiation-phase.component.html',
  styleUrls: ['./initiation-phase.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule,
    MatButtonModule
  ]
})
export class InitiationPhaseComponent {
  currentStep = 0;
  steps = [
    'Introduction',
    'Recueil des exigences',
    'Analyse de faisabilité',
    'Cahier des charges',
    'Planification'
  ];

  // 1) Intro/Objectifs
  introduction = '';
  objectifs   = '';

  // 2) Exigences
  newExigence: Exigence = {
    fonctionnelle: '',
    nonFonctionnelle: '',
    priorite: Priority.MOYENNE
  };
  exigences: Exigence[] = [];

  // 3) Faisabilité
  faisabilite: AnalyseFaisabilite = {
    techniqueDisponible: false,
    budgetSuffisant:     false,
    delaisRealistes:     false,
    ressourcesHumainesSuffisantes: false
  };

  // 4) Cahier des charges
  cahier: CahierDesCharges = {
    objectifsProjet: '',
    livrables:       '',
    contraintes:     '',
    criteresSucces:  ''
  };

  // 5) Planification
  newPlanning: PlanificationPhase = {
    nomPhase:     '',
    dateDebut:    '',
    dateFin:      '',
    budgetEstime: 0
  };

  constructor(private svc: InitiationPhaseService) {}

  // navigation
  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }
  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // exigences
  addExigence() {
    this.exigences.push({ ...this.newExigence });
    this.newExigence = { fonctionnelle: '', nonFonctionnelle: '', priorite: Priority.MOYENNE };
  }
  removeExigence(i: number) {
    this.exigences.splice(i, 1);
  }

  // validations d’étape
  onAnalyze()    { this.next(); }
  onValiderCahier() { this.next(); }

  // soumission finale
  onPlanifier() {
    const phase: InitiationPhase = {
      introduction:      this.introduction,
      objectifs:        this.objectifs,
      exigences:        this.exigences,
      faisabilite:      this.faisabilite,
      cahierDesCharges: this.cahier,
      plannings:        [ this.newPlanning ]
    };
    this.svc.create(phase).subscribe({
      next: saved => {
        console.log('Enregistré', saved);
        this.currentStep = 0;
        // réinitialisez si besoin…
      },
      error: err => console.error(err)
    });
  }
}
