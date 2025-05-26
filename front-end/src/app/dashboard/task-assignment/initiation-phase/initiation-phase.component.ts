import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { InitiationPhaseService } from '../../../services/initiation-phase.service';
import { InitiationPhase }         from '../../../models/initiation-phase/initiation-phase.model';
import { Exigence }                from '../../../models/initiation-phase/exigence.model';
import { AnalyseFaisabilite }      from '../../../models/initiation-phase/analyse-faisabilite.model';
import { CahierDesCharges }        from '../../../models/initiation-phase/cahier-des-charges.model';
import { PlanificationPhase }      from '../../../models/initiation-phase/planification-phase.model';
import { Priority }                from '../../../enums/priority.enum';

@Component({
  standalone: true,
  selector: 'app-initiation-phase',
  templateUrl: './initiation-phase.component.html',
  styleUrls:   ['./initiation-phase.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCheckboxModule
  ]
})
export class InitiationPhaseComponent implements OnInit {
  // Étapes
  steps = [
    'Introduction',
    'Recueil des exigences',
    'Analyse de faisabilité',
    'Cahier des charges',
    'Planification'
  ];
  currentStep = 0;

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
    techniqueDisponible:           false,
    budgetSuffisant:               false,
    delaisRealistes:               false,
    ressourcesHumainesSuffisantes: false
  };

  // 4) Cahier des Charges
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
  plannings: PlanificationPhase[] = [];

  /** ID de la tâche issu de l’URL */
  private tacheId!: number;

  constructor(
    private svc: InitiationPhaseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Récupération de l’ID dans /dashboard/InitTache/:id
    this.route.paramMap.subscribe(params => {
      this.tacheId = Number(params.get('id'));
    });
  }

  // navigation entre étapes
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

  // planifications
  addPlanning() {
    this.plannings.push({ ...this.newPlanning });
    this.newPlanning = { nomPhase: '', dateDebut: '', dateFin: '', budgetEstime: 0 };
  }

  // Au clic de « Planifier » (dernière étape) : envoi unique de toutes les données
  onPlanifier(): void {
    const payload: InitiationPhase = {
      tache: { id: this.tacheId } as any,
      introduction:      this.introduction,
      objectifs:        this.objectifs,
      exigences:        this.exigences,
      faisabilite:      this.faisabilite,
      cahierDesCharges: this.cahier,
      plannings:        this.plannings
    };

    this.svc.create(payload).subscribe({
      next: _ => {
        // redirection vers la liste / détail de la tâche
        this.router.navigate(['/dashboard/tâches', this.tacheId]);
      },
      error: err => console.error('Erreur lors de l’enregistrement de la phase', err)
    });
  }
}
