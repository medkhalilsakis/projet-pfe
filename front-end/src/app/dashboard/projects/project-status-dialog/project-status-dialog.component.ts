import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface Project {
  id: number;
  name: string;
  status: number;
}

@Component({
  selector: 'app-project-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Statut du projet</h2>
    <mat-dialog-content>
  <div 
    class="stepper"
    [style.--progress-width.%]="(current / (stages.length - 1)) * 100">
    
    <ng-container *ngFor="let s of stages; let i = index">
      <div class="step"
           [ngClass]="{ 'completed': i < current, 'active': i === current }">
        <div class="circle">
          <mat-icon [color]="iconColor(i)">{{ iconName(i) }}</mat-icon>
        </div>
        <div class="label">{{ s.label }}</div>
      </div>
    </ng-container>

  </div>
</mat-dialog-content>


    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .stage-label { margin-left: 8px; font-weight: 500; }
    mat-list-item { align-items: center; }

    :host {
  --circle-size: 2.4rem;
}

/* Conteneur flex aligné */
.stepper {
  position: relative;
  display: flex;
  align-items: center;           /* verticalement centré */
  justify-content: space-between;/* cercles répartis */
  padding: 16px;
  z-index: 0;
}

/* Ligne grise de fond */
.stepper::before {
  content: '';
  position: absolute;
  top: 50%;                      /* milieu vertical du conteneur */
  left: calc(var(--circle-size) / 2);
  right: calc(var(--circle-size) / 2);
  height: 4px;
  background: #ccc;
  transform: translateY(-50%);
  z-index: 0;
}

/* Ligne verte de progression */
.stepper::after {
  content: '';
  position: absolute;
  top: 50%;
  left: calc(var(--circle-size) / 2);
  height: 4px;
  background: #4caf50;
  transform: translateY(-50%);
  /* largeur calculée : proportion du nombre d’étapes */
  width: calc( (currentPct) * (100% - var(--circle-size)) );
  /* Nous allons remplacer currentPct via inline-style binding en Angular */
  z-index: 1;
}

/* Chaque étape */
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2; /* au-dessus de la ligne */
}

/* Cercle contenant l’icône */
.circle {
  width: var(--circle-size);
  height: var(--circle-size);
  border-radius: 50%;
  border: 3px solid #ccc;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color .3s, background .3s;
}
.circle mat-icon {
  font-size: 1.4rem;
}

/* Texte sous le cercle */
.label {
  margin-top: 0.4rem;
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

/* État “terminé” */
.step.completed .circle {
  border-color: #4caf50;
  background: #4caf50;
  color: white;
}

/* État “actif” */
.step.active .circle {
  border-color: #ff9800;
}
.step.active .circle mat-icon {
  color: #ff9800;
  animation: spin 1.2s linear infinite;
}
.step.active .label {
  color: #ff9800;
  font-weight: 600;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive vertical */
@media (max-width: 600px) {
  .stepper {
    flex-direction: column;
  }
  .stepper::before,
  .stepper::after {
    top: calc(var(--circle-size) / 2);
    left: 50%;
    height: calc(100% - var(--circle-size));
    width: 4px;
    transform: translateX(-50%);
  }
  .step {
    margin-bottom: 1rem;
  }
}  
  `]
})
export class ProjectStatusDialogComponent {
  stages = [
    { index: 0, label: '1. Brouillon' },
    { index: 1, label: '2. Attente désignation testeur' },
    { index: 2, label: '3. Phase de test' },
    { index: 3, label: '4. Phase de révision' },
    { index: 4, label: '5. Acceptation finale' }
  ];

  current: number;

  constructor(
    public dialogRef: MatDialogRef<ProjectStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project }
  ) {
    // initialise current ici, une fois que data est disponible
    this.current = data.project.status;
  }

  iconName(idx: number): string {
    if (idx < this.current)   return 'done';
    if (idx === this.current) return 'autorenew';
    return 'radio_button_unchecked';
  }
  iconColor(idx: number): 'primary'|'accent'|'warn'|undefined {
    if (idx < this.current)   return 'primary';  // vert
    if (idx === this.current) return 'warn';     // orange/rouge
    return undefined;                             // gris par défaut
  }
}
