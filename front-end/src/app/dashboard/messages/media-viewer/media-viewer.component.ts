import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-media-viewer',
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.css'],
  imports:[CommonModule, MatIconModule]
})
export class MediaViewerComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { filePath: string; mimeType: string },
    private dialogRef: MatDialogRef<MediaViewerComponent>
  ) {}
  closeViewer(): void {
    this.dialogRef.close(); // Ferme le modal
  }
}
