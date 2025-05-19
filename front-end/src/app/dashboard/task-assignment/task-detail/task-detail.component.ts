import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient }        from '@angular/common/http';
import { MatDialog, MatDialogModule }         from '@angular/material/dialog';
import { CommonModule }      from '@angular/common';
import { MatChipsModule }    from '@angular/material/chips';
import { MatIconModule }     from '@angular/material/icon';
import { MatListModule }     from '@angular/material/list';
import { FlexLayoutModule }  from '@angular/flex-layout';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ProjectService } from '../../../services/project.service';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Project } from '../../../models/project.model';

import { SessionStorageService } from '../../../services/session-storage.service';
import { UserService } from '../../../services/users.service';



interface TacheDetailDTO {
  id: number;
  name: string;
  description?: string;
  outils?: string;
  status: string;
  deadline: string;
  publishedAt: string;
  assignedTo: { id: number; prenom: string; nom: string }[];
  attachments: { id: number; fileName: string; fileType: string }[];
  projectId?: number;           // récupéré si DTO expose
}

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    FlexLayoutModule,
    NgxExtendedPdfViewerModule,
    MatDialogModule
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {

  task!: TacheDetailDTO;
  pdfAttachments: any[] = [];
  imageAttachments: any[] = [];
  videoAttachments: any[] = [];
  otherAttachments: any[] = [];

  project?: Project;
  projectName?: string;
  currentUser :any
  role:any
  readonly API = 'http://localhost:8080/api';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private projectSvc: ProjectService,
    private router: Router,
    private dialog: MatDialog,
    private sessionStorage:SessionStorageService,

  ) {}
isSupervisor(){
    if (this.role===3){
      return true
    }
    return false
  }
   isDev(){
    if (this.role===1){
      return true
    }
    return false
  }
  ngOnInit() {
    this.currentUser=this.sessionStorage.getUser()
    this.role=this.currentUser.role;
    this.loadTask();
  }

  private loadTask() {
    const id = this.route.snapshot.params['id'];
    this.http.get<TacheDetailDTO>(`${this.API}/taches/${id}`)
      .subscribe(t => {
        this.task = t;

        // tri des attachments
        this.pdfAttachments   = t.attachments.filter(a => a.fileType === 'application/pdf');
        this.imageAttachments = t.attachments.filter(a => a.fileType?.startsWith('image/'));
        this.videoAttachments = t.attachments.filter(a => a.fileType?.startsWith('video/'));
        this.otherAttachments = t.attachments.filter(a =>
          !this.pdfAttachments.includes(a)
          && !this.imageAttachments.includes(a)
          && !this.videoAttachments.includes(a)
        );

        // si tâche liée à un projet, récupérer son nom
        if (t.projectId) {
          // on récupère tout le Projet
          this.projectSvc.getProjectById(t.projectId)
            .subscribe(proj => {
              this.project = proj;
              this.projectName = proj.name;
            });
        }
      });
  }

  getStatusLabel(status: string) {
    const map: Record<string,string> = {
      a_developper: 'À développer',
      en_cours:     'En cours',
      suspendu:     'Suspendu',
      cloturé:      'Clôturé',
      terminé:      'Terminé'
    };
    return map[status] || status;
  }

  getOutilsList(): string[] {
    return this.task.outils
      ? this.task.outils.split(',').map(s => s.trim()).filter(s => !!s)
      : [];
  }

  editTask() {
    const ref = this.dialog.open(EditTaskDialogComponent, {
      width: '600px',
      data: { id: this.task.id }
    });
    ref.afterClosed().subscribe(updated => {
      if (updated) this.loadTask();
    });
  }

  downloadAll() {
    window.open(`${this.API}/taches/${this.task.id}/attachments/zip`, '_blank');
  }

  goToProject() {
    if (this.task.projectId) {
      this.router.navigate(['/dashboard/projects', this.task.projectId]);
    }
  }
}
