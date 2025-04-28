// src/app/dashboard/project-details/project-details.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { forkJoin } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';

interface Project {
  id: number;
  name: string;
  type: string;
  description: string;
  visibilite: string;
  status: number;
  createdAt: string;
  user: { prenom: string; nom: string; };
}

interface InvitedUser {
  id: number;
  prenom: string;
  nom: string;
  status: string;
}

interface ProjectFileNode {
  id: number;
  name: string;
  type: 'FILE' | 'FOLDER';
  children?: ProjectFileNode[];
}

interface ProjectStatsDTO {
  total: number;
  counts: { [ext: string]: number };
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTreeModule,
    MatChipsModule
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  private api = 'http://localhost:8080/api/projects';
  project!: Project;
  invitedUsers: InvitedUser[] = [];
  stats!: ProjectStatsDTO;

  // --- Pour la tree-view ---
  private transformer = (node: ProjectFileNode, level: number) => ({
    expandable: !!node.children && node.children.length > 0,
    name: node.name,
    level
  });

  treeControl = new FlatTreeControl<{ expandable: boolean; name: string; level: number }>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener<ProjectFileNode,
                                       { expandable: boolean; name: string; level: number }>(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: { expandable: boolean }) => node.expandable;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.params['id']);
    forkJoin({
      proj: this.http.get<Project>(`${this.api}/${id}`),
      invs: this.http.get<InvitedUser[]>(`${this.api}/${id}/invite`),
      tree: this.http.get<ProjectFileNode[]>(`${this.api}/${id}/files/tree`),
      stats: this.http.get<ProjectStatsDTO>(`${this.api}/${id}/stats`)
    }).subscribe(({ proj, invs, tree, stats }) => {
      this.project = proj;
      this.invitedUsers = invs;
      this.dataSource.data = tree;
      this.stats = stats;
    });
  }
  isRed(status: number): boolean {
  return status >= 0 && status <= 1;
}

isYellow(status: number): boolean {
  return status >= 2 && status <= 3;
}

isGreen(status: number): boolean {
  return status > 3;
}


  openDescription() {
    this.dialog.open(DescriptionDialog, {
      data: this.project.description,
      width: '400px'
    });
  }

  /** Pour formater le statut */
  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Brouillon';
      case 1: return 'En attente';
      case 2: return 'En test';
      case 3: return 'Acceptation';
      case 4: return 'En ligne';
      default: return 'Inconnu';
    }
  }
}

/** Dialog pour la description complète */
@Component({
  selector: 'dialog-description',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Description complète</h2>
    <mat-dialog-content>{{ data }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `
})
export class DescriptionDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}
}
