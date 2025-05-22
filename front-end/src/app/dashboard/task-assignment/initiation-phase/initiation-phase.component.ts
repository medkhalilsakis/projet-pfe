import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-initiation-phase',
  templateUrl: './initiation-phase.component.html',
  styleUrls: ['./initiation-phase.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatCheckboxModule,
  ]
})
export class InitiationPhaseComponent {
  currentStep = 0;
  steps = [
    { label: 'Introduction' },
    { label: 'Recueil des exigences' },
    { label: 'Analyse de faisabilité' },
    { label: 'Cahier des charges' },
    { label: 'Planification' },
  ];

  get currentStepLabel() {
    return this.steps[this.currentStep]?.label || '';
  }

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
}
