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
    ProjectChatComponent
  ]
})
export class ProjectDetailsComponent implements OnInit {
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

    // 3) Invitations (sera rechargé après projet)
    // this.loadInvitedUsers();

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
      .subscribe(list => this.invitedUsers = list);
  }
  removeInvite(inviteId: number): void {
    this.projectService.cancelInvite(this.projectId, inviteId)
      .subscribe(() => this.loadInvitedUsers());
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
  get statusLabel(): string {
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

}