import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-contact-details-dialog',
  standalone: true,
  imports: [ CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule ],
  template: `
    <mat-dialog-content class="details-container">
      <img class="avatar-lg" [src]="'http://localhost:8080'+data.user.avatarUrl" alt="" (error)="data.user.avatarUrl=defaultAvatar">
      <h2>{{ data.user.prenom }} {{ data.user.nom }}</h2>
      <p><strong>Status :</strong> {{ data.user.online ? 'En ligne' : 'Hors-ligne' }}</p>
      <p><strong>Dernière connexion :</strong> {{ data.user.lastSeen | date:'fullDate HH:mm' }}</p>
      <mat-divider></mat-divider>
      <button mat-stroked-button color="primary" class="full-width">
        <mat-icon>person_add</mat-icon> Ajouter aux favoris
      </button>
      <button mat-stroked-button color="warn" class="full-width">
        <mat-icon>block</mat-icon> Bloquer
      </button>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .details-container { text-align: center; padding: 16px; }
    .avatar-lg { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 8px; }
    h2 { margin: 0 0 8px; }
    p { margin: 4px 0; font-size: 0.95rem; color: #555; }
    .full-width { width: 100%; margin-top: 8px; }
  `]
})
export class ContactDetailsDialogComponent {
  defaultAvatar = 'https://i.imgur.com/vtrfxgY.png';
  constructor(
    public dialogRef: MatDialogRef<ContactDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: any }
  ) {}
}
