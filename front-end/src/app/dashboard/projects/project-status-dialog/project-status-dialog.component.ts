import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface Project {
  id: number;
  name: string;
  status: number;
  // Nouveaux champs :
  pauseReason?: string;
  closureReason?: string;
  attachments?: { url: string; fileName: string }[];
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
  templateUrl: './project-status-dialog.component.html',
  styleUrls: ['./project-status-dialog.component.css']
})
export class ProjectStatusDialogComponent {
  // Codes de statuts pour plus de lisibilité
  readonly PAUSED = 55;
  readonly CLOSED = 99;

  stages = [
    { index: 0, label: '1. Brouillon' },
    { index: 1, label: '2. Attente testeur' },
    { index: 2, label: '3. Phase de test' },
    { index: 3, label: '4. Phase d\'acceptation' },
    { index: 4, label: '5. En ligne' }
  ];

  current: number;

  constructor(
    public dialogRef: MatDialogRef<ProjectStatusDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: Project }
  ) {
    this.current = data.project.status;
  }

  iconName(idx: number): string {
    if (idx < this.current)   return 'done';
    if (idx === this.current) return 'autorenew';
    return 'radio_button_unchecked';
  }
  iconColor(idx: number): 'primary'|'warn'|undefined {
    if (idx < this.current)   return 'primary';  // déjà passé
    if (idx === this.current) return 'warn';     // en cours
    return undefined;                             // à venir
  }

  // Détermine si on doit afficher le bloc de raison
  get showPauseReason(): boolean {
    return this.data.project.status === this.PAUSED;
  }
  get showClosureReason(): boolean {
    return this.data.project.status === this.CLOSED;
  }
}
