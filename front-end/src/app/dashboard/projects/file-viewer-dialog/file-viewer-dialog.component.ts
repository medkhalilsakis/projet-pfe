// src/app/dashboard/project-files/file-viewer-dialog.component.ts
import {
  Component, Inject, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    CodemirrorModule
  ],
  templateUrl: './file-viewer-dialog.component.html',
  styleUrls: ['./file-viewer-dialog.component.css']
})
export class FileViewerDialogComponent implements OnInit {
  isText = true;
  content = '';
  blobUrl!: SafeResourceUrl;

  editorOptions = {
    lineNumbers: true,
    theme: 'material',       // assurez-vous d'importer ce thème dans styles.css
    mode: 'javascript',      // vous pourrez le changer dynamiquement
    foldGutter: true,
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<FileViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      file: { id: number; name: string; mimeType: string },
      projectId: number
    }
  ) {}

  ngOnInit(): void {
    // Détection type texte vs binaire
    this.isText = /^text\/|application\/json|[+\/]xml$/.test(this.data.file.mimeType)
               || /\.(js|ts|html|css|json|md|xml)$/i.test(this.data.file.name);

    // Ajuster le mode selon l'extension
    this.editorOptions.mode = this.detectLanguage(this.data.file.name);

    const url = `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`;
    if (this.isText) {
      this.http.get(url, { responseType: 'text' })
        .subscribe(
          txt => this.content = txt,
          () => this.snackBar.open('Erreur chargement', 'Fermer', { duration: 3000 })
        );
    } else {
      this.http.get(url, { responseType: 'blob' })
        .subscribe(
          blob => {
            const blobUrl = URL.createObjectURL(blob);
            this.blobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          },
          () => this.snackBar.open('Erreur chargement binaire', 'Fermer', { duration: 3000 })
        );
    }
  }

  detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': return 'text/typescript';
      case 'js': return 'text/javascript';
      case 'html': return 'text/html';
      case 'css': return 'text/css';
      case 'json': return 'application/json';
      case 'xml': return 'application/xml';
      case 'md': return 'text/markdown';
      default: return 'text/plain';
    }
  }

  save(): void {
    if (!this.isText) return;
    const url = `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}/content`;
    this.http.put(url, this.content, {
      responseType: 'text',
      headers: { 'Content-Type': 'text/plain' }
    }).subscribe(
      () => this.snackBar.open('Sauvegardé', 'Fermer', { duration: 2000 }),
      () => this.snackBar.open('Erreur sauvegarde', 'Fermer', { duration: 2000 })
    );
  }

  delete(): void {
    if (!confirm('Supprimer définitivement ?')) return;
    const url = `http://localhost:8080/api/projects/${this.data.projectId}/files/${this.data.file.id}`;
    this.http.delete(url, { responseType: 'text' })
      .subscribe(
        msg => {
          this.snackBar.open(msg, 'Fermer', { duration: 2000 });
          this.dialogRef.close({ deleted: true });
        },
        () => this.snackBar.open('Erreur suppression', 'Fermer', { duration: 2000 })
      );
  }

  close(): void {
    this.dialogRef.close();
  }
}
