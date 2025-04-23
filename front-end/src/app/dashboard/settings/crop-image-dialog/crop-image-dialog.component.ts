import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-crop-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ImageCropperComponent
  ],
  template: `
    <h2 mat-dialog-title>Recadrer la photo</h2>
    <mat-dialog-content class="crop-content">
      <image-cropper
        [imageChangedEvent]="data.imageChangedEvent"
        [maintainAspectRatio]="true"
        [aspectRatio]="1 / 1"
        format="png"
        (imageCropped)="onImageCropped($event)"
        (loadImageFailed)="onLoadFailed()">
      </image-cropper>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button
              color="primary"
              [disabled]="!croppedImage"
              (click)="onConfirm()">
        Valider
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .crop-content {
      max-width: 400px;
      max-height: 400px;
      overflow: auto;
    }
  `]
})
export class CropImageDialogComponent {
  croppedImage: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<CropImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageChangedEvent: Event }
  ) {}

  onImageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64!;
  }

  onLoadFailed() {
    // si tu veux afficher un message d'erreur…
  }

  onConfirm() {
    this.dialogRef.close(this.croppedImage);
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
