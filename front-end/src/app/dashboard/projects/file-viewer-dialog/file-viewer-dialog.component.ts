import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-file-viewer-dialog',
  templateUrl: './file-viewer-dialog.component.html',
  styleUrls: ['./file-viewer-dialog.component.css'],
  imports: [CommonModule, MatIconModule, FormsModule]
})
export class FileViewerDialogComponent implements OnInit {
  content: string = '';
  loading: boolean = true;
  isEditing: boolean = false;
  editedContent: string = '';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FileViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { file: any, projectId: number }
  ) {}

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    this.loading = true;
    this.http.get(
      `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`,
      { responseType: 'text' }
    ).subscribe({
      next: (text: string) => {
        this.content = text;
        this.editedContent = text;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur chargement contenu fichier:', err);
        this.content = 'Erreur lors du chargement du contenu.';
        this.loading = false;
      }
    });
  }

  enableEdit(): void {
    this.isEditing = true;
  }

  saveChanges(): void {
    this.http.put(
      `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`,
      { content: this.editedContent },
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.snackBar.open('Fichier sauvegardé avec succès.', 'Fermer', { duration: 3000 });
        this.content = this.editedContent;
        this.isEditing = false;
      },
      error: err => {
        console.error('Erreur sauvegarde fichier:', err);
        this.snackBar.open('Erreur lors de la sauvegarde.', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteFile(): void {
    if (!confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;
  
    this.http.delete(
      `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}`,
      { responseType: 'text' }  // ← Important !
    ).subscribe({
      next: (res: string): void => {
        this.snackBar.open(res, 'Fermer', { duration: 3000 });
        this.dialogRef.close({ deleted: true });
      },
      error: (err: any): void => {
        console.error('Erreur suppression fichier:', err);
        this.snackBar.open('Erreur lors de la suppression.', 'Fermer', { duration: 3000 });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
