import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule
} from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FileNode } from '../../../models/file-node.model';

interface FlatNode {
  id: number;
  name: string;
  type: 'FILE' | 'FOLDER';
  level: number;
  expandable: boolean;
}

@Component({
  selector: 'app-project-explorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    CodemirrorModule
  ],
  templateUrl: './project-explorer.component.html',
  styleUrls: ['./project-explorer.component.css']
})
export class ProjectExplorerComponent implements OnInit {
  @ViewChild('folderDialog') folderDialog!: TemplateRef<any>;
  @ViewChild('uploadDialog') uploadDialog!: TemplateRef<any>;

  projectId!: number;
  loading = false;

  /** Cible d’ajout (parentId); null → racine **/
  selectedTargetNode: FlatNode | null = null;

  /** Configuration MatTree **/
  private transformer = (node: FileNode, level: number): FlatNode => ({
    id: node.id,
    name: node.name,
    type: node.type,
    level,
    expandable: !!node.children && node.children.length > 0
  });
  treeControl = new FlatTreeControl<FlatNode>(
    n => n.level,
    n => n.expandable
  );
  treeFlattener = new MatTreeFlattener<FileNode, FlatNode>(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => (node as any).children
  );
  treeDataSource = new MatTreeFlatDataSource(
    this.treeControl,
    this.treeFlattener
  );

  /** Éditeur **/
  selectedFileId: number | null = null;
  selectedFileName: string | null = null;
  selectedFileContent: string | null = null;
  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'javascript'
  };

  /** Dialogue création **/
  newFolderName = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.projectId = +this.route.snapshot.paramMap.get('id')!;
    this.loadTree();
  }

  loadTree(): void {
    this.loading = true;
    this.projectService
      .getFilesTree(this.projectId)
      .subscribe(tree => {
        this.treeDataSource.data = tree;
        this.loading = false;
      });
  }

  /** Tree helpers **/
  hasChild = (_: number, node: FlatNode) => node.expandable;
  isFolder = (_: number, node: FlatNode) => node.type === 'FOLDER';
  isFile   = (_: number, node: FlatNode) => node.type === 'FILE';

  /** Racine / reset **/
  resetToRoot(): void {
    this.treeControl.collapseAll();
    this.selectedTargetNode = null;
  }

  openFolder(node: FlatNode): void {
    this.treeControl.toggle(node);
  }

  /** Sélection emplacement création dossier **/
  setTargetNode(node: FlatNode | null): void {
    this.selectedTargetNode = node;
    this.dialog.open(this.folderDialog);
  }

  /** Créer dossier sous selectedTargetNode (ou racine) **/
  createFolder(): void {
    const parentId = this.selectedTargetNode?.id;
    this.projectService
      .createFolder(
        this.projectId,
        this.newFolderName,
        parentId ?? undefined
      )
      .subscribe(() => {
        this.dialog.closeAll();
        this.newFolderName = '';
        this.loadTree();
      });
  }

  /** Upload : ouvrir dialogue **/
  openUploadDialog(node: FlatNode | null): void {
    this.selectedTargetNode = node;
    this.dialog.open(this.uploadDialog);
  }
  onUploadSelected(evt: Event): void {
    const files = (evt.target as HTMLInputElement).files;
    if (!files) return;
    this.projectService
      .uploadFiles(
        this.projectId,
        Array.from(files),
        this.selectedTargetNode?.id ?? undefined
      )
      .subscribe(() => {
        this.dialog.closeAll();
        this.loadTree();
      });
  }

  /** Lecture / édition **/
  openFile(node: FlatNode): void {
    this.selectedFileId   = node.id;
    this.selectedFileName = this.getBaseName(node.name);
    this.projectService
      .readFile(this.projectId, node.id)
      .subscribe(txt => (this.selectedFileContent = txt));
  }
  saveFile(): void {
    if (
      this.selectedFileId == null ||
      this.selectedFileContent == null
    )
      return;
    this.projectService
      .saveFile(
        this.projectId,
        this.selectedFileId,
        this.selectedFileContent
      )
      .subscribe(() => this.loadTree());
  }

  /** Suppression **/
  deleteNode(node: FlatNode): void {
    if (
      !confirm(`Supprimer "${this.getBaseName(node.name)}" ?`)
    )
      return;
    this.projectService
      .deleteFile(this.projectId, node.id)
      .subscribe(() => this.loadTree());
  }

  /** Helpers **/
  getBaseName(path: string): string {
    const parts = path.split(/[/\\]+/);
    return parts[parts.length - 1] || path;
  }

  isTextFile(node: FlatNode): boolean {
    return /\.(txt|js|ts|html|css|json|md)$/i.test(
      node.name
    );
  }


  downloadProjectZip(): void {
    this.projectService.downloadProjectContent(this.projectId)
      .subscribe({
        next: (blob: Blob) => {
          // Avec file-saver (si installé) :
          // saveAs(blob, `projet-${this.projectId}.zip`);

          // Sans dépendance, on crée un lien temporaire :
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `projet-${this.projectId}.zip`;
          a.click();
          URL.revokeObjectURL(url);
        },
        error: err => {
          console.error('Erreur téléchargement ZIP', err);
        }
      });
  }
}
