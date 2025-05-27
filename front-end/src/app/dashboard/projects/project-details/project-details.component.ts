import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../models/project.model';
import { ProjectInvitedUser } from '../../../models/invited-user.model';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { ProjectService } from '../../../services/project.service';
import { PauseRequestService } from '../../../services/pause-request.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { AssignmentService } from '../../../services/assignment.service';
import {UserService}from  '../../../services/users.service'
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProjectChatComponent } from '../project-chat/project-chat.component';
import { PauseRequest } from '../../../models/pause-request.model';
import { map } from 'rxjs/operators';
import { User } from '../../../models/user.model';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ParametresProjetComponent } from '../parametres-projet/parametres-projet.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Console } from 'console';
import { forkJoin, of } from 'rxjs'; // Assure-toi d'importer ça
import { ComplaintService } from '../../../services/complaint.service';
import{AddInvitationDialogComponent} from"../add-invitation-dialog/add-invitation-dialog.component"

 

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
relaunchProject() {
throw new Error('Method not implemented.');
}
  reclamationList: any[] = [];                           // ← add this

  currentUser : any ;
  canDelete = false;
  canArchive = false;        // ← declare it

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
    handler: () => this.openSettings(this.project),
    colorClass: 'settings'         // ← et là
  },
];
  
  project!: Project;
  projectId!: number;

  // Bloc invitations
  invitedUsers: ProjectInvitedUser[] = [];

  // Bloc testeurs
  testers: ProjectTesterAssignment[] = [];
  isSupervisor = false;

  isOwner = false;
  // Bloc pauses
  pauseRequests: any = [];
  pendingPauseRequests : any[] =[]
  expanded = false;
  snackBar: any;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService,  
    private projectService: ProjectService,
    private assignmentService: AssignmentService,
    private userService : UserService,
    private pauseRequestService: PauseRequestService,
    private dialog: MatDialog,
    private session: SessionStorageService,
  ) {
    this.currentUser=this.session.getUser();
  }
  canResume(){
    return (this.isSupervisor && this.project.status==55);
  }
  canPublish(){
    return ((this.project.user.id===this.currentUser.id)  && (this.project.status===0))
  }

canSeeInvitedList(): boolean {
  const isSupervisor = this.currentUser?.role?.id === 3;
  this.isOwner = this.currentUser?.id === this.project?.user?.id;

  const isTester = this.testers?.some(tester => this.currentUser?.id === tester.id);

  const isInviteAccepted = this.invitedUsers?.some(invite => 
    this.currentUser?.id === invite.user.id && invite.status === 'accepted'
  );

  return isSupervisor || this.isOwner || isTester || isInviteAccepted;
}
 isInvitationPending(){
  const isInvitePending = this.invitedUsers?.some(invite => 
    this.currentUser?.id === invite.user.id && invite.status === 'pending'
  );
  return isInvitePending
}
acceptInviteRequest() {
  this.projectService
    .decideInvitation(this.currentUser.id, 'accepted', this.projectId)
    .subscribe(() => this.loadInvitedUsers());
}

denyInviteRequest() {
  this.projectService
    .decideInvitation(this.currentUser.id, 'rejected', this.projectId)
    .subscribe(() => this.loadInvitedUsers());
}

resumeProject(){
  this.projectService.updateProjectStatus(this.project.id,2,this.currentUser.id).subscribe(a=>console.log(a));
  this.loadProject()
}


publishProject() {
  this.projectService.updateProjectStatus(this.project.id,1,this.currentUser.id).subscribe(a=>console.log(a));
  this.loadProject()
  this.router.navigate(['/dashboard/projects']);
}
closeProject() {
  this.projectService.updateProjectStatus(this.project.id,99,this.currentUser.id).subscribe(a=>console.log(a));
  this.loadProject()
  this.router.navigate(['/dashboard/projects']);
}

pauseProject() {
    this.projectService.updateProjectStatus(this.project.id,55,this.currentUser.id).subscribe(a=>console.log(a));
    this.loadProject()
    this.router.navigate(['/dashboard/projects']);
}

archiveProject() {
   this.projectService.updateProjectStatus(this.project.id,-1,this.currentUser.id).subscribe(a=>console.log(a));
  this.loadProject()

   this.router.navigate(['/dashboard/projects', { status: 'archived' }]);

}
deleteProject() {
  this.projectService.deleteProject(this.project.id).subscribe();
      this.router.navigate(['/dashboard/projects']);
}
openSettings(project: Project): void{
    this.dialog.open(ParametresProjetComponent, {
      width: '600px',
      data: { projectId: project.id }
    });
    this.loadProject()
}
downloadContent() {
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

  acceptPauseRequest(requestId: number) {
  this.pauseRequestService
    .updateStatus(this.projectId, requestId, 'APPROVED', this.currentUser.id)
    .subscribe({
      next: updatedReq => {
        this.loadProject()
        // e.g. remove it from the list, show a toast, etc.
        this.pendingPauseRequests = this.pendingPauseRequests.filter(r => r.id !== requestId);
        this.statusLabel()
      },
      error: err => {
        console.error('Failed to update pause status', err);
        // maybe show an error message to the user
      }
    });
}


denyPauseRequest(requestId: number) {
  this.pauseRequestService
    .updateStatus(this.projectId, requestId, 'REJECTED', this.currentUser.id)
    .subscribe({
      next: updatedReq => {
        this.loadProject()
        // remove it from the pending list
        this.pendingPauseRequests = this.pendingPauseRequests.filter(r => r.id !== requestId);
      },
      error: err => {
        console.error('Failed to reject pause request', err);
        // optionally show a toast/snackbar to the user
      }
    });
}

  

  ngOnInit(): void {
    // 1) Récupérer l'ID depuis la route
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProject()
  }
    // 2) Charger le projet
   loadProject(){
    this.projectService.getProjectById(this.projectId)
      .subscribe(p => {
        this.project = p;
        const isSupervisor = this.currentUser?.role?.id === 3;
        const isOwner= this.currentUser?.id === this.project.user.id;
        // only supervisors OR owners in certain statuses:
        this.canDelete = isSupervisor
          || (isOwner && (this.project.status === 1 || this.project.status === 2));

        // maybe you only want to archive if it’s “online” (4) or “closed” (99):
        this.canArchive = ((isSupervisor|| isOwner) && (this.project.status === 4 || this.project.status === 99));


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

    this.loadReclamations();

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
    const dlg = this.dialog.open(AddInvitationDialogComponent, {
    width: '90%',
    maxWidth: '800px',
    data: {
      projectId: this.projectId,
    }
  });
  dlg.afterClosed().subscribe(formData => {
  if (formData && formData.users && formData.users.length) {
    formData.users.forEach((userId: number) => {
      this.projectService.inviteUser(
        this.projectId, 
        userId,
        'pending')
          .subscribe({
            next: () => this.loadInvitedUsers(),
          
          error: () => {
            this.snackBar.open("Erreur à l'ajout", 'Fermer', { duration: 3000 });
          }

        });
      return;
    })
  }});
}
private loadReclamations(): void {
    this.complaintService.getComplaintsByProjectId(this.projectId)
      .subscribe(comps => {
        // For each complaint, fetch its complainer user
        const enriched$ = comps.map(c =>
          this.userService.getUserById(c.complainerId).pipe(
            map(user => ({ ...c, complainter: user }))
          )
        );

        forkJoin(enriched$).subscribe(full => {
          this.reclamationList = full;
        });
      });
  }


  /* Bloc testeurs */
  private loadTesters(): void {
    this.assignmentService.getAssignments(this.projectId)
      .subscribe(list => this.testers = list);
  }
  goToDesignation(): void {
    this.router.navigate(['/dashboard/designation']
    );
  }

  /* Bloc pauses */
  private loadPauseRequests(): void {
  this.pauseRequestService.list(this.projectId).subscribe(requests => {
    console.log(requests)
    
    const userRequests$ = requests.map(pause =>
      this.userService.getUserById(pause.requesterId).pipe(
        map(user => ({ ...pause, requester: user }))
      )
    );

    forkJoin(userRequests$).subscribe(fullRequests => {
      this.pendingPauseRequests = fullRequests.filter(req => req.status === 'PENDING');
      console.log(this.pendingPauseRequests)
      this.pauseRequests = fullRequests;
    });
  });
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