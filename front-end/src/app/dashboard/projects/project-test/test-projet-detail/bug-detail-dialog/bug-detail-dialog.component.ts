// src/app/testing/components/bug-detail-dialog/bug-detail-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { BugReport } from '../../../../../services/bug-report.service';

@Component({
  selector: 'app-bug-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule
  ],
  templateUrl: './bug-detail-dialog.component.html',
  styleUrls: ['./bug-detail-dialog.component.css']
})
export class BugDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BugDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { bug: BugReport }
  ) {}

  // construit l’URL de téléchargement depuis le nom de fichier
  getAttachmentUrl(filename: string): string {
    return `/api/projects/${this.data.bug.projectId}/bugs/attachments/${filename}`;
  }

  close() {
    this.dialogRef.close();
  }
}
