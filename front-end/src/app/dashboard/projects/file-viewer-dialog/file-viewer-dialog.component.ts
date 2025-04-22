import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-viewer-dialog',
  templateUrl: './file-viewer-dialog.component.html',
  styleUrls: ['./file-viewer-dialog.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class FileViewerDialogComponent implements OnInit {
  @ViewChild('gutter') gutter!: ElementRef<HTMLElement>;
  @ViewChild('codeArea') codeArea!: ElementRef<HTMLTextAreaElement>;

  isText = true;
  content = '';
  blobUrl!: SafeResourceUrl;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<FileViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { file: { id: number; name: string; mimeType: string }; projectId: number }
  ) {}

  ngOnInit(): void {
    this.isText =
      this.data.file.mimeType.startsWith('text/') ||
      this.data.file.mimeType === 'application/json' ||
      this.data.file.mimeType.endsWith('+xml');

    if (this.isText) {
      this.http
        .get(
          `/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`,
          { responseType: 'text' }
        )
        .subscribe(
          (txt) => {
            this.content = txt;
            setTimeout(() => this.updateLineNumbers(), 0);
          },
          () => this.snackBar.open('Erreur chargement', 'Fermer', { duration: 3000 })
        );
    } else {
      this.http
        .get(
          `/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`,
          { responseType: 'blob' }
        )
        .subscribe(
          (blob) => {
            const url = URL.createObjectURL(blob);
            this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          },
          () => this.snackBar.open('Erreur chargement binaire', 'Fermer', { duration: 3000 })
        );
    }
  }

  save(): void {
    if (!this.isText) return;
    this.http
      .put(
        `/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`,
        this.content,
        { responseType: 'text', headers: { 'Content-Type': 'text/plain' } }
      )
      .subscribe(
        () => this.snackBar.open('Sauvegardé', 'Fermer', { duration: 2000 }),
        () => this.snackBar.open('Erreur sauvegarde', 'Fermer', { duration: 2000 })
      );
  }

  delete(): void {
    if (!confirm('Supprimer définitivement ?')) return;
    this.http
      .delete(`/api/projects/${this.data.projectId}/files/${this.data.file.id}`, {
        responseType: 'text'
      })
      .subscribe(
        (msg) => {
          this.snackBar.open(msg, 'Fermer', { duration: 2000 });
          this.dialogRef.close({ deleted: true });
        },
        () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 2000 })
      );
  }

  close(): void {
    this.dialogRef.close();
  }

  /** Met à jour la gutter avec les numéros de ligne */
  private updateLineNumbers(): void {
    const lines = this.content.split('\n').length;
    const gutterEl = this.gutter.nativeElement;
    gutterEl.innerHTML = Array
      .from({ length: lines }, (_, i) => `<span>${i + 1}</span>`)
      .join('');
  }

  /** Synchronise le scroll entre textarea et gutter */
  syncScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.gutter.nativeElement.scrollTop = textarea.scrollTop;
  }
}
