import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-task-assignment',
  templateUrl: './task-assignment.component.html',
  styleUrls: ['./task-assignment.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatGridListModule
  ]
})
export class TaskAssignmentComponent implements OnInit {
    tâches: Tache[] = [];
    filtered: Tache[] = [];
    search = '';
    statusFilter = '';
  
    constructor(
      private http: HttpClient,
      private dialog: MatDialog
    ) {}
  
    ngOnInit() {
      this.load();
    }
  
    load() {
      let params = new HttpParams();
      if (this.search)      params = params.set('q', this.search);
      if (this.statusFilter)params = params.set('status', this.statusFilter);
      this.http.get<Tache[]>('http://localhost:8080/api/taches', { params })
        .subscribe(list => {
          this.tâches = list;
          this.filtered = list;
        });
    }
  
    onSearchChange() { this.load(); }
    onStatusChange() { this.load(); }
  
    openNew() {
      const ref = this.dialog.open(NewTaskDialogComponent, {
        width: '500px',
        data: null
      });
      ref.afterClosed().subscribe(res => {
        if (res) this.load();
      });
    }
  }

export interface Tache {
  id: number;
  name: string;
  status: string;
  assignedTo: { nom: string; prenom: string };
  deadline: string;
}