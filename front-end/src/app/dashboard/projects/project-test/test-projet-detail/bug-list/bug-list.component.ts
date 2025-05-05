import { Component, Input } from '@angular/core';
import { BugReport } from '../../../../../services/bug-report.service';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bug-list',
  templateUrl: './bug-list.component.html',
  styleUrls: ['./bug-list.component.css'],
  imports:[
    CommonModule,
    MatListModule,
    MatIconModule
  ]
})
export class BugListComponent {
  @Input() bugs: BugReport[] = [];
}
