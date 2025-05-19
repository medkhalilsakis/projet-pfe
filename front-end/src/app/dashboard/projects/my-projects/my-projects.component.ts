import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SessionStorageService } from '../../../services/session-storage.service';
import { ProjectService } from '../../../services/project.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ParametresProjetComponent } from '../parametres-projet/parametres-projet.component';
import { ProjectChatComponent } from '../project-chat/project-chat.component';
import { ProjectStatusDialogComponent } from '../project-status-dialog/project-status-dialog.component';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

interface Project {
  id: number;
  name: string;
  type?: string;
  description?: string;
  visibilite: string;
  createdAt: string;
  updatedAt: string;
  status?: number;

  // ajoutez d’autres champs si besoin
}

@Component({
  selector: 'app-my-projects',
  templateUrl: './my-projects.component.html',
  styleUrls: ['./my-projects.component.css'],
  imports:[CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
  MatDialogModule,
  RouterModule,
    FormsModule,
    MatLabel,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatOptionModule]
})
export class MyProjectsComponent implements OnInit {
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
  errorMessage: string | null = null;

  constructor(
    private sessionStorage: SessionStorageService,
    private projectService: ProjectService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;                  // ← set it here
    const roleId = user.role.id;
    if (roleId === 2) {
      this.router.navigate(['/forbidden']);
      return;
    }
    this.projectService.getProjectsByUser(this.userId)
      .subscribe({
        next: (projects: Project[]) => {
          // ① normalize so description & status are defined
          this.projects = projects
            .map(p => ({
              ...p,
              description: p.description ?? '',
              status: p.status ?? 0
            }))
            .sort((a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
            );

          // ② merge accepted invites
          this.projectService.getAcceptedInvitedProjects(this.userId)
            .subscribe({
              next: invited => {
                invited.forEach(p => {
                  const normalized = {
                    ...p,
                    description: p.description ?? '',
                    status: p.status ?? 0
                  };
                  if (!this.projects.some(x => x.id === normalized.id)) {
                    this.projects.push(normalized);
                  }
                });
                this.filteredProjects = [...this.projects];
                this.loading = false;
              },
              error: err => {
                console.error('Impossible de charger les projets invités', err);
                this.filteredProjects = [...this.projects];
                this.loading = false;
              }
            });
        },
        error: err => {
          console.error('Erreur lors du chargement des projets', err);
          this.errorMessage = 'Impossible de charger vos projets.';
          this.loading = false;
        }
      });
  }  chatDetails(project: Project): void {
      this.dialog.open(ProjectChatComponent, {
        width: '600px',
        data: { projectId: project.id }
      });
    }

viewStatus(project: Project): void {
    this.dialog.open(ProjectStatusDialogComponent, {
      width: '600px',
      data: { project }
    });
  }

  deleteProject(project: Project): void {
    // Vérifier que le projet peut être supprimé (status = 0 ou 1)
    if (project.status !== 0 && project.status !== 1) {
      console.error("Impossible de supprimer ce projet, car son statut n'est pas valide.");
      return;
    }
  
    // Confirmation de suppression (optionnel)
    const confirmation = confirm('Êtes-vous sûr de vouloir supprimer ce projet ?');
    if (!confirmation) return;
  
    // Appel du service pour supprimer le projet et ses fichiers
    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        // Supprimer le projet de la liste après la suppression réussie
        this.projects = this.projects.filter(p => p.id !== project.id);
        console.log('Projet supprimé avec succès.');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du projet :', err);
      }
    });
  }
  
toggleVisibility(project: Project): void {
  // On inverse la visibilité en français
  const newVisibility = project.visibilite === 'public' ? 'privée' : 'public';
  
  // Vérification de l'ID utilisateur depuis le service de session
  const userId = this.sessionStorage.getUser().id;
  if (!userId) {
    console.error("L'ID utilisateur est manquant.");
    return;
  }

    // Vérification explicite si le `status` est valide
    if (project.status === undefined) {
      console.error("Le statut du projet est invalide.");
      return;
    }

  // Envoie la nouvelle visibilité et le statut correspondant au backend
  this.projectService.updateVisibility(project.id, userId, newVisibility, project.status)
    .subscribe(
      () => {
        project.visibilite = newVisibility;
        // Met à jour le statut en fonction de la visibilité choisie
        project.status = newVisibility === 'public' ? 1 : 0;
      },
      error => {
        console.error("Erreur lors de la mise à jour de la visibilité :", error);
      }
    );
}
  viewDetails(project: Project): void {
    this.router.navigate(['/dashboard/projects', project.id, 'explorer']);
  }

openSettings(project: Project): void{
    this.dialog.open(ParametresProjetComponent, {
      width: '600px',
      data: { projectId: project.id }
    });
  }

  
  /**
   * Navigue vers la page de détails d'un projet
   */
  openProject(project: Project) {
    // par exemple on sauvegarde l'ID et on redirige
    this.sessionStorage.saveCurrentProject(project.id);
    this.router.navigate(['/projects', project.id]);
  }

  
  viewProject(project: Project): void {
    this.router.navigate(['/dashboard/projects', project.id]);
  }


  getStatusLabel(status: number): string {
    switch(status) {
      case 0: return 'Brouillon : projet non publié';
      case 1: return 'En attente de désignation du testeur';
      case 2: return 'En phase de test';
      case 3: return 'En phase d\'acceptation';
      case 4: return 'Projet approuvé et mis en ligne';
      case 55: return 'Projet mis en pause';
      case 99: return 'Projet clôturé';
      default: return 'Inconnu';
    }
  }

  // Récupérer la couleur du statut pour l'indicateur (feu de circulation)
  getStatusColor(status: number): string {
    switch(status) {
      case 0:
      case 1:
      case 55:
      case 99: return 'red';  // Rouge pour 0, 1, 55, 99
      case 2:
      case 3: return 'yellow';  // Jaune pour 2 et 3
      case 4: return 'green';  // Vert pour 4
      default: return 'gray';  // Gris pour les autres statuts
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
  applyFiltersAndSorting(): void {
  const q = this.searchQuery.trim().toLowerCase();

  // If no explicit filter, default to [1,2,3,55]
  const DEFAULT_STATUSES = [1, 2, 3, 55];

  this.filteredProjects = this.projects
    .filter(p =>
      // name search
      (!q || p.name.toLowerCase().includes(q))
      // status filter (use `!` to assert p.status is defined)
      && (
           this.statusFilter === ''
             ? DEFAULT_STATUSES.includes(p.status!)
             : p.status! === this.statusFilter
         )
    )
    .sort((a, b) => {
      let cmp = 0;
      if (this.sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (this.sortField === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (this.sortField === 'status') {
        // assert both statuses are defined
        cmp = a.status! - b.status!;
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

}
