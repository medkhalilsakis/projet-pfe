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
  RouterModule]
})
export class MyProjectsComponent implements OnInit {

  projects: Project[] = [];
  loading = true;
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
      // pas connecté → renvoyer vers login
      this.router.navigate(['/login']);
      return;
    }

    const roleId = user.role.id;
    // Si c'est un testeur (2), on bloque l'accès
    if (roleId === 2) {
      this.router.navigate(['/forbidden']);
      return;
    }

    // Sinon, on charge ses projets
    this.projectService.getProjectsByUser(user.id)
      .subscribe({
        next: (projects: Project[]) => {
          this.projects = projects;
          this.loading = false;
        },
        error: err => {
          console.error(err);
          this.errorMessage = 'Impossible de charger vos projets.';
          this.loading = false;
        }
      });
  }

  chatDetails(project: Project): void {
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
}
