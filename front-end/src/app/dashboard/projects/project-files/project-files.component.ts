import {
  Component,
  Inject,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpEventType } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FileViewerDialogComponent } from '../file-viewer-dialog/file-viewer-dialog.component';

export type NodeType = 'FILE' | 'FOLDER';

export interface FileNode {
  id: number;
  name: string;
  type: NodeType;
}

@Component({
  selector: 'app-project-files',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.css']
})
export class ProjectFilesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  files: FileNode[] = [];
  allFiles: FileNode[] = [];
  searchTerm = '';
  breadcrumbs: { id: number | null; name: string }[] = [];
  currentFolderId: number | null = null;
  projectId!: number;

  uploading = false;
  progress = 0;


  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,   
    public dialogRef: MatDialogRef<ProjectFilesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: any }
  ) {
    this.projectId = data.project.id;
  }

  ngOnInit(): void {
    this.breadcrumbs = [{ id: null, name: this.data.project.name }];
    this.loadFiles(null);
  }

  /** Charge le contenu du dossier courant */
  loadFiles(parentId: number | null): void {
    this.currentFolderId = parentId;
    let params = new HttpParams();
    if (parentId !== null) {
      params = params.set('parentId', parentId.toString());
    }

    this.http
      .get<FileNode[]>(`http://localhost:8080/api/projects/${this.projectId}/files`, { params })
      .subscribe({
        next: list => {
          this.allFiles = list.sort((a, b) =>
            a.type !== b.type ? (a.type === 'FOLDER' ? -1 : 1) : a.name.localeCompare(b.name)
          );
          this.filterFiles();
        },
        error: () => this.snackBar.open(
          'Erreur lors du chargement des fichiers',
          'Fermer',
          { duration: 3000 }
        )
      });
  }

  /** Recherche en temps réel */
  filterFiles(): void {
    const q = this.searchTerm.trim().toLowerCase();
    this.files = q
      ? this.allFiles.filter(f => this.getDisplayName(f.name).toLowerCase().includes(q))
      : this.allFiles.slice();
  }

  /** Extrait le nom final (sans path) */
  getDisplayName(path: string): string {
    const parts = path.split(/[/\\]/);
    return parts[parts.length - 1] || path;
  }

  /** Double‑clic dossier/fichier */
  onItemClick(node: FileNode): void {
    if (node.type === 'FOLDER') {
      this.breadcrumbs.push({ id: node.id, name: this.getDisplayName(node.name) });
      this.searchTerm = '';
      this.loadFiles(node.id);
    } else {
      // Ouvre le FileViewerDialogComponent en plein écran/dialog
      const dlgRef = this.dialog.open(FileViewerDialogComponent, {
        width: '80vw',
        height: '80vh',
        data: {
          file: node,
          projectId: this.projectId
        }
      });

      // Quand on ferme la visionneuse, on recharge la liste si le fichier a été supprimé
      dlgRef.afterClosed().subscribe(result => {
        if (result?.deleted) {
          this.loadFiles(this.currentFolderId);
          this.snackBar.open('Liste de fichiers mise à jour', 'Fermer', { duration: 2000 });
        }
      });
    }
  }

  /** Navigation via fil d’Ariane */
  navigateTo(crumb: { id: number | null; name: string }): void {
    const idx = this.breadcrumbs.findIndex(c => c.id === crumb.id && c.name === crumb.name);
    if (idx >= 0) {
      this.breadcrumbs = this.breadcrumbs.slice(0, idx + 1);
      this.searchTerm = '';
      this.loadFiles(crumb.id);
    }
  }

  /** Création d’un nouveau dossier */
  openNewFolderDialog() {
    const name = prompt("Nom du nouveau dossier :");
    if (!name) return;
    const body: any = { name };
    if (this.currentFolderId != null) {
      body.parentId = this.currentFolderId.toString();
    }
    this.http.post<FileNode[]>(
      `http://localhost:8080/api/projects/${this.projectId}/files/folder`,
      body
    ).subscribe({
      next: () => this.loadFiles(this.currentFolderId),
      error: () => this.snackBar.open("Impossible de créer le dossier", "Fermer", { duration: 3000 })
    });
  }
  

  /** Sélection et upload de fichiers */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
  
    const form = new FormData();
    Array.from(input.files).forEach(f => form.append('files', f));
    if (this.currentFolderId != null) {
      form.append('parentId', this.currentFolderId.toString());
    }
  
    this.uploading = true;
    this.http.post<FileNode[]>(
      `http://localhost:8080/api/projects/${this.projectId}/files/upload`,
      form,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          // calcul du pourcentage
          const total = event.total ?? 1;
          this.progress = Math.round(100 * event.loaded / total);
        } else if (event.type === HttpEventType.Response) {
          // terminé
          this.uploading = false;
          this.loadFiles(this.currentFolderId);
        }
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Erreur upload fichiers', 'Fermer', { duration: 3000 });
      }
    });
  }
  

  /** Ferme la popup */
  onClose(): void {
    this.dialogRef.close();
  }
}
