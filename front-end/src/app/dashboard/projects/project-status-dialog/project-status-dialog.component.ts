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
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface Project {
  id: number;
  name: string;
  status: number;
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
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './project-status-dialog.component.html',
  styleUrls: ['./project-status-dialog.component.css']
})
export class ProjectStatusDialogComponent {
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

  /** Choix de l’icône à afficher */
  iconName(idx: number): string {
    if (this.isPaused) {
      return 'pause_circle';
    }
    if (this.isClosed) {
      return 'cancel';
    }
    if (idx < this.current)   return 'done';
    if (idx === this.current) return 'autorenew';
    return 'radio_button_unchecked';
  }

  /** Détermine si pause / clôture */
  get isPaused(): boolean {
    return this.current === this.PAUSED;
  }
  get isClosed(): boolean {
    return this.current === this.CLOSED;
  }
  get isFrozen(): boolean {
    return this.isPaused || this.isClosed;
  }

  /** Texte du warning à afficher */
  get freezeMessage(): string {
    if (this.isPaused) {
      return `⚠️ Projet mis en pause : ${this.data.project.pauseReason}`;
    }
    if (this.isClosed) {
      return `⚠️ Projet clôturé : ${this.data.project.closureReason}`;
    }
    return '';
  }
}
