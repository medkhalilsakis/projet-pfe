// src/app/testing/components/test-projet-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BugReport, BugReportService } from '../../../../services/bug-report.service';
import { Meeting, MeetingService } from '../../../../services/meeting.service';
import { SessionStorageService } from '../../../../services/session-storage.service';
import { UploadedTestCase, TestCaseUploadService } from '../../../../services/test-case-upload.service';
import { TestCase, TestCaseService } from '../../../../services/test-case.service';
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
import { User, UserService } from '../../../../services/users.service';
import { TestProgressService } from '../../../../services/test-progress.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardMdImage, MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { BugDetailDialogComponent } from './bug-detail-dialog/bug-detail-dialog.component';


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
  ]
})
export class TestProjetDetailComponent implements OnInit {
editMeeting(_t54: Meeting) {
throw new Error('Method not implemented.');
}
deleteMeeting(_t54: Meeting) {
throw new Error('Method not implemented.');
}

  projectId!: number;
  testCases: TestCase[] = [];
  uploads: UploadedTestCase[] = [];
  bugs: BugReport[] = [];
  meetings: Meeting[] = [];


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

  constructor(
    private tcService: TestCaseService,
    private uploadService: TestCaseUploadService,
    private progressSvc: TestProgressService,
    private bugService: BugReportService,
    private meetingService: MeetingService,
    private userService: UserService,
    private session: SessionStorageService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
  ) {
    this.projectId = this.session.getCurrentProject();
    this.currentUserId = this.session.getUser().id;
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadProgress();
  }

  private loadAll() {
    this.tcService.list(this.projectId).subscribe(list => this.testCases = list);
    this.uploadService.list(this.projectId).subscribe(list => this.uploads = list);
    this.meetingService.list(this.projectId).subscribe(list => this.meetings = list);
    this.bugService.list(this.projectId).subscribe(list => this.bugs = list);
  }

  // 1) Create/Edit Test Case
  // test-projet-detail.component.ts
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
          data: { allUsers }
        });

        dlg.afterClosed().subscribe((m: Meeting) => {
          if (m) {
            // 4) Envoyer au service et recharger
            this.meetingService.schedule(this.projectId, m)
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
    this.progressSvc.approvePhase(this.projectId, this.currentUserId)
      .subscribe(() => {
        this.snack.open('Phase de test approuvée', 'OK', { duration: 2000 });
      });
  }
  
  rejectPhase() {
    // appel service backend pour rejeter
    this.progressSvc.rejectPhase(this.projectId, this.currentUserId)
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
  
}
