import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';

// Interface représentant un fichier/dossier
export interface FileNode {
  id: number;
  name: string;
  type: 'FILE' | 'FOLDER';
  fileSize?: number;
  updatedAt?: string;
}

@Component({
  selector: 'app-project-files',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './project-files.component.html',
  styleUrls: ['./project-files.component.css']
})
export class ProjectFilesComponent implements OnInit {
  files: FileNode[] = [];
  // Breadcrumb pour naviguer dans les dossiers
  breadcrumbs: { id: number | null, name: string }[] = [];
  cols: number = 4;
  projectId!: number;

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
    // Initialiser le breadcrumb avec le dossier racine (le nom du projet)
    this.breadcrumbs = [{ id: null, name: this.data.project.name }];
    this.adjustCols();
    this.loadFiles(null);
  }

  @HostListener('window:resize')
  adjustCols(): void {
    const w = window.innerWidth;
    this.cols = w > 1200 ? 6 : w > 800 ? 4 : w > 600 ? 3 : 2;
  }

  // Charge les fichiers pour un dossier donné (si parentId est null, ce sont les éléments du dossier racine)
  loadFiles(parentId: number | null): void {
    let params = new HttpParams();
    if (parentId !== null) {
      params = params.set('parentId', parentId.toString());
    }
    this.http.get<FileNode[]>(`http://localhost:8080/api/projects/${this.projectId}/files`, { params })
      .subscribe({
        next: files => {
          // Tri simple : dossiers en premier, fichiers après, tri par nom
          this.files = files.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'FOLDER' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
        },
        error: err => {
          console.error(err);
          this.snackBar.open('Erreur lors du chargement des fichiers', 'Fermer', { duration: 3000 });
        }
      });
  }

  // Lorsqu'un élément est cliqué
  onItemClick(item: FileNode): void {
    if (item.type === 'FOLDER') {
      // Ajouter le dossier au breadcrumb et charger son contenu
      this.breadcrumbs.push({ id: item.id, name: item.name });
      this.loadFiles(item.id);
    } else {
      // Pour un fichier : ouvrir le viewer (exemple d'appel de dialogue)
      // Vous pouvez personnaliser cet appel pour ouvrir une visionneuse ou un éditeur
      this.snackBar.open(`Ouverture du fichier ${item.name}`, 'Fermer', { duration: 2000 });
    }
  }

  // Navigation par breadcrumb : sélectionner un dossier dans le fil d’Ariane
  navigateTo(crumb: { id: number | null, name: string }): void {
    const idx = this.breadcrumbs.findIndex(c => c.id === crumb.id && c.name === crumb.name);
    if (idx !== -1) {
      // Conserver seulement les éléments jusqu'au dossier sélectionné
      this.breadcrumbs = this.breadcrumbs.slice(0, idx + 1);
      this.loadFiles(crumb.id);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
