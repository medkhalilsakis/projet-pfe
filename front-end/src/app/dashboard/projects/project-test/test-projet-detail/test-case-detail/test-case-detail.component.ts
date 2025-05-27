// src/app/modules/test-cases/test-case-detail/test-case-detail.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TestCase } from '../../../../../models/test-case.model';

@Component({
  selector: 'app-test-case-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatCardModule
  ],
  templateUrl: './test-case-detail.component.html',
  styleUrls: ['./test-case-detail.component.css']
})
export class TestCaseDetailComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public tc: TestCase,
    private dialogRef: MatDialogRef<TestCaseDetailComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
