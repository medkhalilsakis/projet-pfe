import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { HttpClient, HttpParams, HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FileViewerDialogComponent } from '../file-viewer-dialog/file-viewer-dialog.component';

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
    HttpClientModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.project.name }}</h2>
    <mat-dialog-content>
      <nav class="breadcrumb">
        <ng-container *ngFor="let bc of breadcrumbs; let last = last">
          <a *ngIf="!last" (click)="navigateTo(bc)" class="crumb">{{ bc.name }}</a>
          <span *ngIf="last" class="crumb current">{{ bc.name }}</span>
          <mat-icon *ngIf="!last" class="sep">chevron_right</mat-icon>
        </ng-container>
      </nav>

      <mat-grid-list [cols]="cols" rowHeight="120px" gutterSize="16px">
        <mat-grid-tile *ngFor="let file of files" (click)="onItemClick(file)" class="tile">
          <mat-icon class="icon">{{ file.type === 'FOLDER' ? 'folder' : 'insert_drive_file' }}</mat-icon>
          <div class="name">{{ file.name }}</div>
        </mat-grid-tile>
      </mat-grid-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .breadcrumb {
      display: flex; align-items: center; flex-wrap: wrap;
      margin-bottom: 12px; font-size: 14px;
    }
    .crumb { cursor: pointer; color: #3f51b5; text-decoration: none; margin-right: 4px; }
    .crumb.current { color: rgba(0,0,0,0.87); font-weight: bold; }
    .sep { font-size: 16px; vertical-align: middle; margin-right: 4px; }
    .tile {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border: 1px solid #e0e0e0; border-radius: 4px;
      cursor: pointer; transition: background .2s;
    }
    .tile:hover { background: #f5f5f5; }
    .icon { font-size: 48px; color: #757575; }
    .name {
      margin-top: 8px; text-align: center;
      word-break: break-word;
    }
  `]
})
export class ProjectFilesComponent implements OnInit {
  files: FileNode[] = [];
  breadcrumbs: { id: number | null, name: string }[] = [];
  cols: number = 4;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ProjectFilesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project: any }
  ) {}

  ngOnInit(): void {
    this.breadcrumbs = [{ id: null, name: this.data.project.name }];
    this.adjustCols();
    this.loadFiles(null);
  }

  @HostListener('window:resize')
  adjustCols() {
    const w = window.innerWidth;
    this.cols = w > 1200 ? 6 : w > 800 ? 4 : w > 600 ? 3 : 2;
  }

  loadFiles(parentId: number | null): void {
    this.breadcrumbs[this.breadcrumbs.length - 1].id = parentId;
    let params = new HttpParams();
    if (parentId != null) params = params.set('parentId', parentId.toString());

    this.http.get<FileNode[]>(
      `http://localhost:8080/api/projects/${this.data.project.id}/files`,
      { params }
    ).subscribe({
      next: files => {
        this.files = files.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'FOLDER' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      },
      error: err => {
        console.error(err);
        this.snackBar.open('Erreur chargement fichiers', 'Fermer', { duration: 3000 });
      }
    });
  }

  onItemClick(file: FileNode): void {
    if (file.type === 'FOLDER') {
      this.breadcrumbs.push({ id: file.id, name: file.name });
      this.loadFiles(file.id);
    } else {
      const ref = this.dialog.open(FileViewerDialogComponent, {
        width: '800px',
        height: '600px',
        data: { projectId: this.data.project.id, file }
      });
      ref.afterClosed().subscribe(result => {
        if (result?.deleted) {
          const current = this.breadcrumbs[this.breadcrumbs.length - 1].id;
          this.loadFiles(current);
        }
      });
    }
  }

  navigateTo(crumb: { id: number | null, name: string }) {
    const idx = this.breadcrumbs.findIndex(c => c.id === crumb.id && c.name === crumb.name);
    this.breadcrumbs = this.breadcrumbs.slice(0, idx + 1);
    this.loadFiles(crumb.id);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
