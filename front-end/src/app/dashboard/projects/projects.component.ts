import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SessionStorageService } from '../../services/session-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
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
    MatProgressBarModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
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
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  userId!: number;
  userRole!: number; // 1, 2 ou 3
  searchQuery: string = '';
  
  // Pour afficher les détails d'un projet
  selectedProject: Project | null = null;

  constructor(
    private http: HttpClient,
    private sessionStorage: SessionStorageService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (user && user.id) {
      this.userId = user.id;
      this.userRole = user.role;  // On suppose que le rôle est stocké sous "role"
      this.loadProjects();
    } else {
      this.snackBar.open('Utilisateur non identifié', 'Fermer', { duration: 5000 });
      this.router.navigate(['/login']);
    }
  }
  

  loadProjects(): void {
    this.loading = true;
    let endpoint = '';
    let user = this.sessionStorage.getUser();
    this.userRole = user.role.id;
    // Sélection dynamique de l'endpoint en fonction du rôle
    if (this.userRole === 3) {
      // Superviseur : tous les projets
      endpoint = `http://localhost:8080/api/projects`;
    } else if (this.userRole === 2) {
      // Testeur : projets assignés au testeur
      endpoint = `http://localhost:8080/api/projects/tester/${this.userId}`;
    } else if (this.userRole === 1) {
      // Développeur : projets uploadés par lui-même
      endpoint = `http://localhost:8080/api/projects/user/${this.userId}`;
    }
    console.log('Endpoint utilisé :', endpoint);

    this.http.get<Project[]>(endpoint)
      .subscribe({
        next: (data: Project[]) => {
          this.projects = data;
          this.filteredProjects = data; // initialement, aucun filtre
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erreur lors du chargement des projets', 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
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

  getStatusColor(status: number): string {
    switch(status) {
      case 1: return 'red';   
      case 2: return 'yellow';    
      case 3: return 'green'; 
      default: return 'black';
    }
  }

  isRed(status: number): boolean {
    return [0, 1, 99].includes(status);
  }
  isYellow(status: number): boolean {
    return [2, 3, 55].includes(status);
  }
  isGreen(status: number): boolean {
    return status === 4;
  }
  getStatusLabel(status: number): string {
    switch(status) {
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
