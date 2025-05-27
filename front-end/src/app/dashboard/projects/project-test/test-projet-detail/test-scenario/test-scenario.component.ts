import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScenarioService } from '../../../../../services/test-scenario.service';
import { TestScenario } from '../../../../../models/test-scenario.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-test-scenario',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './test-scenario.component.html',
  styleUrls: ['./test-scenario.component.css']
})
export class TestScenarioComponent implements OnInit {
  scenario?: TestScenario;
  loading = true;
  error = '';

  constructor(
    private svc: TestScenarioService,
    private dialogRef: MatDialogRef<TestScenarioComponent>,
    @Inject(MAT_DIALOG_DATA) public projectId: number
  ) {}

  ngOnInit(): void {
    this.svc.getByProjectId(this.projectId)
      .pipe(
        catchError(err => {
          this.error = 'Aucun scénario trouvé ou erreur réseau.';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(s => {
        this.scenario = s || undefined;
        this.loading = false;
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  downloadAttachment(): void {
    if (!this.scenario?.attachmentPath) return;
    window.open(this.scenario.attachmentPath, '_blank');
  }
}
