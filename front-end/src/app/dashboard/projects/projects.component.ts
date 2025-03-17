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

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: number;
  // Vous pouvez ajouter d'autres champs si nécessaire
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  userId!: number;

  constructor(
    private http: HttpClient,
    private sessionStorage: SessionStorageService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.sessionStorage.getUser();
    if (user && user.id) {
      this.userId = user.id;
      this.loadProjects();
    } else {
      this.snackBar.open('Utilisateur non identifié', 'Fermer', { duration: 5000 });
      this.router.navigate(['/login']);
    }
  }

  loadProjects(): void {
    this.loading = true;
    // Appel à l'API pour récupérer les projets de l'utilisateur
    this.http.get<Project[]>(`http://localhost:8080/api/projects/user/${this.userId}`)
      .subscribe({
        next: (data: Project[]) => {
          this.projects = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erreur lors du chargement des projets', 'Fermer', { duration: 5000 });
          this.loading = false;
        }
      });
  }

  // Action pour afficher les détails du projet (fichiers et sous-dossiers)
  viewDetails(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  // Action pour accéder aux paramètres du projet
  openSettings(project: Project): void {
    this.router.navigate(['/projects', project.id, 'settings']);
  }

  // Action pour supprimer un projet
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

  // Retourne la couleur correspondant au statut du projet
  getStatusColor(status: number): string {
    switch(status) {
      case 0: return 'grey';   // Brouillon (non publié)
      case 1: return 'red';    // Clôturé/Suspendu
      case 2: return 'orange'; // En cours (phase de testing)
      case 3: return 'blue';   // En attente d'approbation finale
      case 4: return 'green';  // Accepté
      default: return 'black';
    }
  }
}
