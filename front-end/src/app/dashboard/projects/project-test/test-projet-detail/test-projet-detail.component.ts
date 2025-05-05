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
import { BugListComponent } from './bug-list/bug-list.component';


@Component({
  selector: 'app-test-projet-detail',
  templateUrl: './test-projet-detail.component.html',
  styleUrls: ['./test-projet-detail.component.css'],
  imports:[
    CommonModule,
    TestCaseTableComponent,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatAccordion,
    MatExpansionModule,
    BugListComponent
  ]
})
export class TestProjetDetailComponent implements OnInit {
  projectId!: number;
  testCases: TestCase[] = [];
  uploads: UploadedTestCase[] = [];
  bugs: BugReport[] = [];
  meetings: Meeting[] = [];

  constructor(
    private tcService: TestCaseService,
    private uploadService: TestCaseUploadService,
    private bugService: BugReportService,
    private meetingService: MeetingService,
    private session: SessionStorageService,
    private dialog: MatDialog
  ) {
    this.projectId = this.session.getCurrentProject();
  }

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll() {
    this.tcService.list(this.projectId).subscribe(list => this.testCases = list);
    this.uploadService.list(this.projectId).subscribe(list => this.uploads = list);
    this.bugService.list(this.projectId).subscribe(list => this.bugs = list);
    this.meetingService.list(this.projectId).subscribe(list => this.meetings = list);
  }

  // 1) Create/Edit Test Case
  openTestCaseDialog(tc?: TestCase) {
    const dlg = this.dialog.open(TestCaseDialogComponent, { data: tc });
    dlg.afterClosed().subscribe(saved => { if (saved) this.loadAll(); });
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
    const dlg = this.dialog.open(MeetingDialogComponent, {
      data: { allUsers: [] /* ou call service user */ }
    });
    dlg.afterClosed().subscribe((m: Meeting) => {
      if (m) this.meetingService.schedule(this.projectId, m).subscribe(() => this.loadAll());
    });
  }

  // 5) TestCaseTable actions
  editTestCase(tc: TestCase) { this.openTestCaseDialog(tc); }
  deleteTestCase(tc: TestCase) {
    this.tcService.delete(this.projectId, tc.id!).subscribe(() => this.loadAll());
  }
  viewTestCase(tc: TestCase) { /* naviguer vers viewer */ }
}
