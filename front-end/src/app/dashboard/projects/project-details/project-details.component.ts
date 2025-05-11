import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../models/project.model';
import { ProjectInvitedUser } from '../../../models/invited-user.model';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { ProjectService } from '../../../services/project.service';
import { PauseRequestService } from '../../../services/pause-request.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { AssignmentService } from '../../../services/assignment.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProjectChatComponent } from '../project-chat/project-chat.component';
import { PauseRequest } from '../../../models/pause-request.model';
import { map } from 'rxjs/operators';
import { User } from '../../../models/user.model';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    ProjectChatComponent,
    FlexLayoutModule
  ]
})
export class ProjectDetailsComponent implements OnInit {
  actionsList = [
  {
    icon: 'file_download',
    label: 'Télécharger',
    handler: () => this.downloadContent(),
    colorClass: 'file_download'    // ← ici
  },
  {
    icon: 'settings',
    label: 'Modifier',
    handler: () => this.openSettings(),
    colorClass: 'settings'         // ← et là
  },
  {
    icon: 'delete',
    label: 'Supprimer',
    handler: () => this.deleteProject(),
    colorClass: 'delete'
  },
  {
    icon: 'archive',
    label: 'Archiver',
    handler: () => this.archiveProject(),
    colorClass: 'archive'
  },
  {
    icon: 'pause_circle',
    label: 'Mettre en pause',
    handler: () => this.pauseProject(),
    colorClass: 'pause_circle'
  },
  {
    icon: 'stop_circle',
    label: 'Clôturer',
    handler: () => this.closeProject(),
    colorClass: 'stop_circle'
  }
];

closeProject() {
throw new Error('Method not implemented.');
}
pauseProject() {
throw new Error('Method not implemented.');
}
archiveProject() {
throw new Error('Method not implemented.');
}
deleteProject() {
throw new Error('Method not implemented.');
}
openSettings() {
throw new Error('Method not implemented.');
}
downloadContent() {
throw new Error('Method not implemented.');
}
  project!: Project;
  projectId!: number;

  // Bloc invitations
  invitedUsers: ProjectInvitedUser[] = [];

  // Bloc testeurs
  testers: ProjectTesterAssignment[] = [];
  isSupervisor = false;

  // Bloc pauses
  pauseRequests: PauseRequest[] = [];

  expanded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private assignmentService: AssignmentService,
    private pauseRequestService: PauseRequestService,
    private session: SessionStorageService
  ) {}

  ngOnInit(): void {
    // 1) Récupérer l'ID depuis la route
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    // 2) Charger le projet
    this.projectService.getProjectById(this.projectId)
      .subscribe(p => {
        this.project = p;
        // une fois le projet chargé, on peut charger les dépendances
        this.loadInvitedUsers();
      });

    // 4) Testeurs (uniquement si superviseur)
    const user = this.session.getUser();
    this.isSupervisor = user?.role?.id === 3;
    if (this.isSupervisor) {
      this.loadTesters();
    }

    // 5) Demandes de pause
    this.loadPauseRequests();
  }

  /* Bloc invitations */
  private loadInvitedUsers(): void {
    this.projectService.getInvitedUsers(this.projectId)
      .pipe(
        map(rawList =>
          rawList.map(raw => {
            const u: User = {
              id: raw.userId,
              prenom: raw.prenom,
              nom: raw.nom,
              username: '',      // champs obligatoires du modèle, laissez vide si non dispo
              email: '',
              dateEmbauche: '',
              salaire: 0,
              ncin: '',
              genre: '',
            };
            const invite: ProjectInvitedUser = {
              id: raw.id,
              project: this.project!,   // on ré-utilise le projet chargé en amont
              user: u,
              status: raw.status,
              invitedAt: raw.invitedAt
            };
            return invite;
          })
        )
      )
      .subscribe(invites => {
        this.invitedUsers = invites;
      });
  }
  
removeInvite(userId: number): void {
  this.projectService.cancelInvite(this.projectId, userId)
    .subscribe({
      next: () => this.loadInvitedUsers(),
      error: err => console.error('Erreur lors de la suppression', err)
    });
}
  openInviteDialog(): void {
    // à implémenter
  }

  /* Bloc testeurs */
  private loadTesters(): void {
    this.assignmentService.getAssignments(this.projectId)
      .subscribe(list => this.testers = list);
  }
  goToDesignation(): void {
    this.router.navigate(
      ['/dashboard/projects', this.projectId, 'designation-testeurs']
    );
  }

  /* Bloc pauses */
  private loadPauseRequests(): void {
    this.pauseRequestService.list(this.projectId)
      .subscribe(requests => this.pauseRequests = requests);
  }

  /* Bloc explorer */
  goToExplorer(): void {
    this.router.navigate(
      ['/dashboard/projects', this.projectId, 'explorer']
    );
  }

  /* Bloc chat */
  // projectId est déjà en champ, passé au component <app-project-chat>

  /* Bloc overview */
  statusLabel(): string {
    switch (this.project.status) {
      case -1: return 'Projet archivé';
      case  0: return 'Brouillon : projet non publié';
      case  1: return 'En attente de désignation du testeur';
      case  2: return 'En phase de test';
      case  3: return 'En phase d\'acceptation';
      case  4: return 'Projet approuvé et mis en ligne';
      case 55: return 'Projet mis en pause';
      case 99: return 'Projet clôturé';
      default: return 'Inconnu';
    }
  }

  get shortDesc(): string {
    if (!this.project.description) return '';
    const words = this.project.description.split(/\s+/);
    return words.length <= 100
      ? this.project.description
      : words.slice(0, 100).join(' ');
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  /** Renvoie true si la description dépasse 100 mots */
get hasLongDesc(): boolean {
  const desc = this.project?.description;
  if (!desc) return false;
  return desc.split(/\s+/).length > 100;
}

// project-details.component.ts

/** Retourne true si le status est Brouillon ou En attente */
isRed(): boolean {
  if (this.project.status == null) return false;
  return this.project.status == -1 || this.project.status == 0 || this.project.status == 1 || this.project.status == 55 || this.project.status == 99;
}

/** Retourne true si le status est En test ou Acceptation */
isYellow(): boolean {
  if (this.project.status == null) return false;
  return this.project.status == 2 || this.project.status == 3;
}

/** Retourne true si le status est En ligne (4+) */
isGreen(): boolean {
  if (this.project.status == null) return false;
  return this.project.status == 4;
}


}