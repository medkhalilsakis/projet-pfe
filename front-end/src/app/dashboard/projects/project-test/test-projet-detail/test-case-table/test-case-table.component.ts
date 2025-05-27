import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { TestCase } from '../../../../../models/test-case.model';
import { TestCaseDetailComponent } from '../test-case-detail/test-case-detail.component';

@Component({
  selector: 'app-test-case-table',
  templateUrl: './test-case-table.component.html',
  styleUrls: ['./test-case-table.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatNativeDateModule
  ]
})
export class TestCaseTableComponent {
  @Input() data: TestCase[] = [];
  @Output() edit = new EventEmitter<TestCase>();
  @Output() delete = new EventEmitter<TestCase>();
  @Output() view = new EventEmitter<TestCase>();

  displayedColumns = ['caseNumber','title','date','actions'];

}
