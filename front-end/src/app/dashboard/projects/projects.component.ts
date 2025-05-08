import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';
import { ProjectService } from '../../services/project.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProjectChatComponent } from './project-chat/project-chat.component';
import { ParametresProjetComponent } from './parametres-projet/parametres-projet.component';
import { ProjectStatusDialogComponent } from './project-status-dialog/project-status-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: number;
  // Autres champs si nécessaire
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatLabel,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatOptionModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  readonly API = 'http://localhost:8080/api';

  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  userId!: number;
  userRole!: number; // 1, 2 ou 3
  searchQuery: string = '';

  sortField: 'name' | 'createdAt' | 'status' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  statusFilter: number | '' = '';

  pauseReasons: Record<number,string>   = {};
  closureReasons: Record<number,string> = {};

  readonly STATUS_OPTIONS: { value: number; label: string }[] = [
    { value:  1, label: 'En attente' },
    { value:  2, label: 'En test' },
    { value:  3, label: 'En acceptation' },
    { value:  4, label: 'En ligne' },
    { value: 55, label: 'En pause' },
    { value: 99, label: 'Clôturé' },
  ];

  
  // Pour afficher les détails d'un projet
  selectedProject: Project | null = null;

  private STATUS_QUERY_MAP: Record<string, number> = {
    draft:   0,
    pending: 1,
    test:    2,
    accept:  3,
    done:    4,
    pause:   55,
    archived:-1
  };

  constructor(
    private http: HttpClient,
    private sessionStorage: SessionStorageService,
    private projectSvc: ProjectService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (user && user.id) {
      this.route.queryParams.subscribe(params => {
        const key = params['status'] as string | undefined;
        this.statusFilter = key && this.STATUS_QUERY_MAP[key] != null
        ? this.STATUS_QUERY_MAP[key]
        : '';
        this.userId = user.id;
        this.userRole = user.role;  // On suppose que le rôle est stocké sous "role"
        this.loadProjects();
      });
    } else {
      this.snackBar.open('Utilisateur non identifié', 'Fermer', { duration: 5000 });
      this.router.navigate(['/login']);
    }
  }
  

  loadProjects(): void {
    this.loading = true;
    let endpoint = '';
    const user = this.sessionStorage.getUser();
    this.userRole = user.role.id;
  
    // 1) Choix de l’endpoint selon le rôle
    if (this.userRole === 3) {
      endpoint = `${this.API}/projects`;
    } else if (this.userRole === 2) {
      endpoint = `${this.API}/projects/tester/${this.userId}`;
    } else if (this.userRole === 1) {
      endpoint = `${this.API}/projects/user/${this.userId}`;
    }
    console.log('Endpoint utilisé :', endpoint);
  
    // 2) Récupération des projets
    this.http.get<Project[]>(endpoint).subscribe({
      next: projects => {
        // Tri initial par date de création (descendant)
        this.projects = projects.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
  
        // Appliquer filtres / tri
        this.applyFiltersAndSorting();
        this.loading = false;
  
        // 3) Pour chaque projet en pause ou clôturé, récupérer la raison
        this.projects.forEach(p => {
          if (p.status === 55) {
            // Projet mis en pause
            this.projectSvc.getLastPause(p.id)
              .subscribe({
                next: data => this.pauseReasons[p.id] = data.reason,
                error: ()   => {/* pas de pause enregistrée, on ignore */}
              });
          }
          if (p.status === 99) {
            // Projet clôturé
            this.projectSvc.getLastClosure(p.id)
              .subscribe({
                next: data => this.closureReasons[p.id] = data.reason,
                error: ()   => {/* pas de clôture enregistrée, on ignore */}
              });
          }
        });
      },
      error: () => {
        this.snackBar.open('Erreur lors du chargement des projets', 'Fermer', { duration: 5000 });
        this.loading = false;
      }
    });
  }
  applyFiltersAndSorting(): void {
    const q = this.searchQuery.trim().toLowerCase();
  
    // Si on n’a pas de filtre explicite (statusFilter === ''), on veut
    // **par défaut** les statuts 1,2,3 et 55 (vue d’ensemble)
    const DEFAULT_STATUSES = [1, 2, 3, 55];
  
    this.filteredProjects = this.projects
      .filter(p =>
        // recherche par nom
        (!q || p.name.toLowerCase().includes(q))
        // filtre statut
        && (
             this.statusFilter === ''
               ? DEFAULT_STATUSES.includes(p.status)
               : p.status === this.statusFilter
           )
      )
      // tri
      .sort((a, b) => {
        let cmp = 0;
        if (this.sortField === 'name') {
          cmp = a.name.localeCompare(b.name);
        } else if (this.sortField === 'createdAt') {
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (this.sortField === 'status') {
          cmp = a.status - b.status;
        }
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
  }
  

  onSearchChange() {
    this.applyFiltersAndSorting();
  }

  onStatusFilterChange(val: number | '') {
    this.statusFilter = val;
    this.applyFiltersAndSorting();
  }

  onSortFieldChange(field: 'name'|'createdAt'|'status') {
    this.sortField = field;
    this.applyFiltersAndSorting();
  }

  onSortDirectionChange(dir: 'asc'|'desc') {
    this.sortDirection = dir;
    this.applyFiltersAndSorting();
  }

  // Filtrer les projets localement par nom
  filterProjects(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProjects = this.projects;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProjects = this.projects.filter(proj => proj.name.toLowerCase().includes(query));
    }
  }

  viewDetails(project: Project): void {
    this.router.navigate(['/dashboard/projects', project.id, 'explorer']);
  }
  


  deleteProject(project: Project): void {
    if (confirm(`Voulez-vous vraiment supprimer le projet "${project.name}" ?`)) {
      this.http.delete(`http://localhost:8080/api/projects/${project.id}`)
        .subscribe({
          next: () => {
            this.snackBar.open('Projet supprimé avec succès', 'Fermer', { duration: 5000 });
            this.loadProjects();
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Erreur lors de la suppression du projet', 'Fermer', { duration: 5000 });
          }
        });
    }
  }

  viewProject(project: Project): void {
    this.router.navigate(['/dashboard/projects', project.id]);
  }

  chatDetails(project: Project): void {
    this.dialog.open(ProjectChatComponent, {
      width: '600px',
      data: { projectId: project.id }
    });
  }

  openSettings(project: Project): void{
    this.dialog.open(ParametresProjetComponent, {
      width: '600px',
      data: { projectId: project.id }
    });
  }

  getStatusColor(status: number): string {
    switch(status) {
      case 1: return 'red';   
      case 2: return 'yellow';    
      case 3: return 'green'; 
      default: return 'black';
    }
  }

  isRed(status: number): boolean {
    return [0, 1, 55, 99].includes(status);
  }
  isYellow(status: number): boolean {
    return [2, 3].includes(status);
  }
  isGreen(status: number): boolean {
    return status === 4;
  }
  getStatusLabel(status: number): string {
    switch(status) {
      case -1: return 'Projet archivé';
      case 0: return 'Brouillon : projet non publié';
      case 1: return 'En attente de désignation du testeur';
      case 2: return 'En phase de test';
      case 3: return 'En phase d\'acceptation';
      case 4: return 'Projet approuvé et mis en ligne';
      case 55: return 'Projet mis en pause';
      case 99: return 'Projet cloturé';
      default: return 'Inconnu';
    }
  }

  viewStatus(project: Project): void {
    this.dialog.open(ProjectStatusDialogComponent, {
      width: '600px',
      data: { project }
    });
  }
}
