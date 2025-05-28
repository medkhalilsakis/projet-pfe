// src/app/testing/components/test-projet-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BugReportService } from '../../../../services/bug-report.service';
import { MeetingService } from '../../../../services/meeting.service';
import { SessionStorageService } from '../../../../services/session-storage.service';
import { UploadedTestCase, TestCaseUploadService } from '../../../../services/test-case-upload.service';
import { TestCaseService } from '../../../../services/test-case.service';
import { BugReportDialogComponent } from './bug-report-dialog/bug-report-dialog.component';
import { MeetingDialogComponent } from './meeting-dialog/meeting-dialog.component';
import { TestCaseDialogComponent } from './test-case-dialog/test-case-dialog.component';
import { CommonModule } from '@angular/common';
import { TestCaseTableComponent } from './test-case-table/test-case-table.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { saveAs } from 'file-saver';
import { UserService } from '../../../../services/users.service';
import { TestProgressService } from '../../../../services/test-progress.service';
import { PauseRequestService } from '../../../../services/pause-request.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BugDetailDialogComponent } from './bug-detail-dialog/bug-detail-dialog.component';
import { PauseRequestDialogComponent } from './pause-request-dialog/pause-request-dialog.component';
import { AssignmentService } from '../../../../services/assignment.service';
import { ProjectService } from '../../../../services/project.service';
import { User } from '../../../../models/user.model';
import { ProjectTesterAssignment } from '../../../../models/assignment.model';
import { TestCase } from '../../../../models/test-case.model';
import { BugReport } from '../../../../models/bug-report.model';
import { Meeting } from '../../../../models/meeting.model';
import { PauseRequest } from '../../../../models/pause-request.model';
  import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { HttpClient } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Router } from '@angular/router';
import { TestScenarioComponent } from './test-scenario/test-scenario.component';
import { TestCaseDetailComponent } from './test-case-detail/test-case-detail.component';


@Component({
  selector: 'app-test-projet-detail',
  templateUrl: './test-projet-detail.component.html',
  styleUrls: ['./test-projet-detail.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TestCaseTableComponent,
    MatDividerModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatAccordion,
    MatCardModule,
    MatCheckboxModule,
    MatTreeModule,
    MatExpansionModule,
    NgxExtendedPdfViewerModule,
    FlexLayoutModule
  ]
})
export class TestProjetDetailComponent implements OnInit {
  
  projectId!: number;
  project: any;
  invitedUsers: User[] = [];

  assignedTesters: User[] = [];

  testCases: TestCase[] = [];
  uploads: UploadedTestCase[] = [];
  bugs: BugReport[] = [];
  meetings: Meeting[] = [];

  pauseRequests: Array<PauseRequest & { requesterName?: string }> = [];

  projectTesterAssignment!: any;
  canLaunchTest: boolean = false;
  canSubmitDecision: boolean = false;
  participants: string[] = [];
  testCaseAttachment : any =[];
  isPaused: boolean = false;
  api='http://localhost:8080';

  testTypes = [
    'Test unitaire','Test d\'intégration','Test fonctionnel',
    'Test de régression','Test de performance','Test de charge',
    'Test de stress','Test d\'acceptation utilisateur','Test de sécurité',
    'Test de compatibilité','Test d’interface utilisateur','Test de fumée'
  ];
  selectedTypes: Set<string> = new Set();
  
  testLevels = [
    'Test de niveau unitaire','Test de niveau module',
    'Test de niveau système','Test d\'acceptation',
    'Test de niveau d\'intégration','Test de validation','Test de vérification'
  ];
  levelStatus: Record<string,boolean> = {};

  currentUserId!: number;

  rapportTestPath: string | null = null;

  constructor(
    private tcService: TestCaseService,
    private uploadService: TestCaseUploadService,
    private progressSvc: TestProgressService,
    private bugService: BugReportService,
    private router: Router,
    private meetingService: MeetingService,
    private userService: UserService,
    private assignmentService: AssignmentService,
    private projectService: ProjectService,
    private session: SessionStorageService,
    private pauseReqSvc: PauseRequestService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private http:HttpClient
  ) {
    this.projectId = this.session.getCurrentProject();
    this.currentUserId = this.session.getUser().id;
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadProjectDetails();
    this.loadProgress();
    this.loadPauseRequests();
    this.checkProjectPaused();
    this.loadprojectTesterAssignment();
    console.log(this.project)

  }
 downloadTestCases() {
  console.log(this.projectTesterAssignment)
  const att = this.projectTesterAssignment.testAssignmentAttachment;

  const url = `${this.api}/api/tester-assignments/attachments/${att.id}`;
  const filename = att.fileName || 'test-cases.pdf';

  this.http.get(url, { responseType: 'blob' }).subscribe(
    (response: Blob) => {
      const blob = new Blob([response], { type: response.type });
      const downloadURL = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadURL);
    },
    (error) => {
      console.error('Download error:', error);
    }
  );

}


loadprojectTesterAssignment(){
  console.log(this.currentUserId)
  console.log(this.projectId)
  this.assignmentService.getProjectTesterAssignment(this.currentUserId,this.projectId).subscribe(
    (data: any) =>{
 this.projectTesterAssignment=data
 this.testCaseAttachment= this.projectTesterAssignment.testAssignmentAttachment;
  console.log(this.testCaseAttachment)
    }
  )
}


private loadAll() {
  this.tcService.list(this.projectId).subscribe(list => this.testCases = list);
  this.uploadService.list(this.projectId).subscribe(list => this.uploads = list);
  this.bugService.list(this.projectId).subscribe(list => this.bugs = list);

  this.meetingService.list(this.projectId).pipe(
  switchMap((meetings) => {
    const enrichedMeetings$ = meetings.map(meeting => {
      if (!meeting.participantsIds || meeting.participantsIds.length === 0) {
        return of({ ...meeting, participants: [], participantNames: [] });
      }

      // Create an observable that fetches all participant users for this meeting
      const participantRequests = meeting.participantsIds.map(id =>
        this.userService.getUserById(id)
      );

      return forkJoin(participantRequests).pipe(
        map(users => {
          const participantNames = users.map(user => `${user.nom} ${user.prenom}`);
          return {
        ...meeting,
        participants: users,
        participantNames // Store names directly on the meeting
};
        })
      );
    });

    return forkJoin(enrichedMeetings$);
  })
).subscribe((enrichedMeetings: any[]) => {
  this.meetings = enrichedMeetings;
});

}



  launchTest() {
    // Mettre à jour le statut du test à "en_cours"
    this.assignmentService.changePhase(this.projectId, 'en_cours').subscribe({
      next: () => {
        //this.projectTesterAssignment.statutTest = 'en_cours';
        this.canLaunchTest = false;  // Désactiver le bouton après lancement
        this.snack.open('Le test a été lancé avec succès', 'OK', { duration: 2000 });
      },
      error: (err) => {
        console.error('Erreur lors du lancement du test', err);
        this.snack.open('Erreur lors du lancement du test', 'OK', { duration: 2000 });
      }
    });
  }

  private loadPauseRequests() {
    this.pauseReqSvc.list(this.projectId)
      .subscribe(reqs => {
        // Typage explicite en utilisant PauseRequestWithRequesterName[]
        this.pauseRequests = reqs.map(pr => ({ ...pr, requesterName: '' }));
  
        // Pour chaque demande, on va chercher le nom du testeur
        reqs.forEach(pr => {
          this.userService.getUserById(pr.requesterId)
            .subscribe(user => {
              pr.requesterName = `${user.prenom} ${user.nom}`;
            }, _err => {
              pr.requesterName = `#${pr.requesterId}`;
            });
        });
      });
  }


  private loadProjectDetails() {
    this.projectService.getProjectById(this.projectId).subscribe((project: any) => {
      this.project = project;
      // Exclure l'utilisateur connecté des testeurs assignés
      this.assignmentService.getTesteursExcept(this.projectId, this.session.getUser().id).subscribe((testers: User[]) => {
        this.assignedTesters = testers;
      });

      // Récupérer les utilisateurs invités (acceptés uniquement)
      this.projectService.getInvitedUsers(this.projectId).subscribe((invites: any[]) => {
        this.invitedUsers = invites.filter((inv: any) => inv.status === 'accepted');
      });
    });
  }


openTestCaseDialog(tc?: TestCase) {
  const dlg = this.dialog.open(TestCaseDialogComponent, {
    width: '90%',
    maxWidth: '800px',
    data: {
      projectId: this.projectId,
      testCase:  tc || null
    }
  });

  dlg.afterClosed().subscribe((result: TestCase | undefined) => {
    if (!result) return;   // l'utilisateur a annulé

    if (result.id) {
      // cas existant → update
      this.tcService.update(this.projectId, result)
        .subscribe({
          next: () => this.loadAll(),
          error: err => console.error('Erreur update TC', err)
        });
    } else {
      // nouveau cas → create
      this.tcService.create(this.projectId, result)
        .subscribe({
          next: () => this.loadAll(),
          error: err => console.error('Erreur create TC', err)
        });
    }
  });
}


  // 2) Upload Test Case
  uploadTestCases() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xml,.json,.csv,.txt,.docx,.pdf';
    input.onchange = () => {
      const file = input.files![0];
      const user = this.session.getUser();
      this.uploadService.upload(this.projectId, file, user.id)
        .subscribe(() => this.loadAll());
    };
    input.click();
  }

  // 3) Bug
  openBugDialog() {
    const dlg = this.dialog.open(BugReportDialogComponent);
    dlg.afterClosed().subscribe((br: BugReport) => {
      if (br) {
        this.bugService.report(this.projectId, br).subscribe(() => this.loadAll());
      }
    });
  }

  // 4) Meeting
  openMeetingDialog() {
    // 1) On récupère tous les users (filtrés par rôle si besoin)
    this.userService.getUsersByRole(2)  // 2 = testeur, ou getAllUsers()
      .subscribe((users: User[]) => {
        const me = this.session.getUser();
        // 2) Exclure l’utilisateur courant
        const allUsers = users.filter(u => u.id !== me?.id);

        // 3) Ouvrir le dialog en passant la liste
        const dlg = this.dialog.open(MeetingDialogComponent, {
          width: '600px',
          height:'90vh',
          data: { allUsers }
        });

        dlg.afterClosed().subscribe((m: Meeting) => {
          if (m) {
            // 4) Envoyer au service et recharger
            this.meetingService.schedule(this.projectId, m,this.currentUserId)
              .subscribe({
                next: () => this.loadAll(),
                error: err => console.error('Erreur scheduling meeting', err)
              });
          }
        });
      }, err => {
        console.error('Impossible de charger la liste des utilisateurs', err);
      });
  }

  // 5) TestCaseTable actions
  editTestCase(tc: TestCase) { this.openTestCaseDialog(tc); }
  deleteTestCase(tc: TestCase) {
    this.tcService.delete(this.projectId, tc.id!).subscribe(() => this.loadAll());
  }
  viewTestCase(tc: TestCase) { /* naviguer vers viewer */ }

  downloadUploaded(up: UploadedTestCase) {
    const url = this.uploadService.downloadUrl(this.projectId, up.id);
    window.open(url, '_blank');
  }

  // 5c) Supprimer un cas uploadé
  deleteUploaded(up: UploadedTestCase) {
    if (!confirm(`Supprimer "${up.originalFilename}" ?`)) return;
    this.uploadService.delete(this.projectId, up.id)
      .subscribe(() => this.loadAll());
  }

  downloadAllZip() {
    this.uploadService.downloadAllZip(this.projectId)
      .subscribe(blob => {
        // Vous pouvez nommer dynamiquement
        const zipName = `test-cases-${this.projectId}.zip`;
        saveAs(blob, zipName);
      }, err => {
        console.error('Erreur téléchargement ZIP', err);
      });
  }


  
  private loadProgress() {
    // on passe userId
    this.progressSvc.getTypes(this.projectId, this.currentUserId)
      .subscribe(list => this.selectedTypes = new Set(list));

    this.progressSvc.getLevels(this.projectId, this.currentUserId)
      .subscribe(map => this.levelStatus = map);
  }

  saveTypes() {
    const arr = Array.from(this.selectedTypes);
    this.progressSvc.saveTypes(this.projectId, this.currentUserId, arr)
      .subscribe(() => {
        this.snack.open('Types de test enregistrés','OK',{duration:2000});
      });
  }

  toggleLevel(level: string) {
    const newVal = !this.levelStatus[level];
    this.progressSvc.updateLevel(
      this.projectId,
      this.currentUserId,
      level,
      newVal
    ).subscribe(() => {
      this.levelStatus[level] = newVal;
    });
  }

  approvePhase() {
    // appel service backend pour approuver
    this.assignmentService.approvePhase(this.projectId, this.currentUserId)
      .subscribe(() => {
        this.snack.open('Phase de test approuvée', 'OK', { duration: 2000 });
      });
  }
  
  rejectPhase() {
    // appel service backend pour rejeter
    this.assignmentService.rejectPhase(this.projectId, this.currentUserId)
      .subscribe(() => {
        this.snack.open('Phase de test refusée', 'OK', { duration: 2000 });
      });
  }

  viewBug(b: BugReport) {
    this.dialog.open(BugDetailDialogComponent, {
      width: '500px',
      data: { bug: b }         // ← vous passez data.bug = b
    });
  }

  openPauseRequest() {
    // On peut ouvrir un dialog pour confirmer ou saisir un motif
    const dlg = this.dialog.open(PauseRequestDialogComponent, {
      width: '400px',
      data: { projectId: this.projectId }
    });

    dlg.afterClosed().subscribe(result => {
      if (!result) {
        return; // annulation
      }
      // result peut contenir { reason: string }
      this.pauseReqSvc.requestPause(
        this.projectId,
        this.currentUserId,
        result.reason
      )
        .subscribe({
          next: () => {
            this.snack.open('Demande de suspension envoyée', 'OK', { duration: 2000 });
          },
          error: err => {
            console.error('Erreur lors de la demande de suspension', err);
            this.snack.open('Échec de la demande', 'OK', { duration: 2000 });
          }
        });
    });
  }
  

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadReport(file);
    }
  }
  
  uploadReport(file: File) {
    const formData = new FormData();
    formData.append('report', file);
  
    // Appel à l'API pour uploader le rapport
    this.assignmentService.uploadReport(this.projectTesterAssignment.id, formData).subscribe({
      next: (response) => {
        this.rapportTestPath = response;  // Mettre à jour le chemin du rapport téléchargé
        this.snack.open('Rapport téléchargé avec succès', 'OK', { duration: 2000 });
        this.canSubmitDecision = true;  // Permet de soumettre la décision maintenant que le rapport est téléchargé
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement du rapport', err);
        this.snack.open('Erreur lors du téléchargement du rapport', 'OK', { duration: 2000 });
      }
    });
  }
  
  private checkProjectPaused() {
    this.projectService.getProjectById(this.projectId)
      .subscribe(proj => {
        // Si statut projet = 55 (en_pause)
        if (proj.status === 55) {
          this.pauseReqSvc.list(this.projectId)
            .subscribe(reqs => {
              // Recherche d’au moins une demande approuvée
              const approved = reqs.find(r => r.status === 'APPROVED');
              if (approved) {
                this.isPaused = true;
                // Avertissement snack
                this.snack.open(
                  '⚠️ La phase de test a été suspendue par le superviseur.',
                  'OK',
                  { panelClass: 'snack-warning', duration: 5000 }
                );
              }
            });
        }
      });
  }
  exploreProject() {
    this.router.navigate(['/dashboard/projects/', this.project.id,'explorer']);
  }
  
  exportProject() {
    this.projectService.downloadProjectContent(this.projectId).subscribe((blob: Blob) => {
      saveAs(blob, `${this.project.name}-content.zip`);
    });
  }

  viewDetails(_t104: PauseRequest&{ requesterName?: string; }) {
    throw new Error('Method not implemented.');
    }
    editMeeting(_t54: Meeting) {
    throw new Error('Method not implemented.');
    }
    deleteMeeting(_t54: Meeting) {
    throw new Error('Method not implemented.');
    }    

    
    ViewScenario(): void {
    const dialogRef = this.dialog.open(TestScenarioComponent, {
      width: '500px',
      data: this.projectId
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Le popup a été fermé');
    });
  }

  openDetail(tc: TestCase) {
        this.dialog.open(TestCaseDetailComponent, {
          width: '600px',
          data: tc
        });
      }
}
