// src/app/task-assignment/task-assignment.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@Component({
  selector: 'app-task-assignment',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCardModule, MatChipsModule, MatRippleModule,
    MatPaginatorModule,
    MatDialogModule,
    FlexLayoutModule
  ],
  templateUrl: './task-assignment.component.html',
  styleUrls: ['./task-assignment.component.css']
})
export class TaskAssignmentComponent implements OnInit {
  tâches: Tache[] = [];
  filtered: Tache[] = [];
  pageSlice: Tache[] = [];
  search = '';
  statusFilter = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 9;
  pageIndex = 0;

  statuses = [
    { value: '',             label: 'Tous' },
    { value: 'a_developper', label: 'À développer' },
    { value: 'en_test',      label: 'En test' },
    { value: 'suspendu',     label: 'Suspendu' },
    { value: 'clôturé',      label: 'Clôturé' },
    { value: 'terminé',      label: 'Terminé' }
  ];

  readonly API = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  private load() {
    let params = new HttpParams();
    if (this.search)       params = params.set('q', this.search.trim());
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http.get<Tache[]>(`${this.API}/taches`, { params })
      .subscribe(list => {
        this.tâches = [...list].sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
        this.applyFilters();
      });
  }

  applyFilters() {
    this.filtered = this.tâches.filter(t =>
      (!this.statusFilter || t.status === this.statusFilter) &&
      (!this.search ||
        t.name.toLowerCase().includes(this.search.toLowerCase()) ||
        this.getAssignedNames(t).toLowerCase().includes(this.search.toLowerCase())
      )
    );
    this.paginator.firstPage();
    this.updatePageSlice();
  }

  onSearchChange() { this.applyFilters(); }
  onStatusChange() { this.applyFilters(); }

  onPageChange(event: PageEvent) {
    this.pageSize  = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePageSlice();
  }

  private updatePageSlice() {
    const start = this.pageIndex * this.pageSize;
    this.pageSlice = this.filtered.slice(start, start + this.pageSize);
  }

  openNew() {
    const ref = this.dialog.open(NewTaskDialogComponent, {
      width: '520px', panelClass: 'new-task-dialog'
    });
    ref.afterClosed().subscribe(created => { if (created) this.load(); });
  }

  viewTask(t: Tache) {
    this.router.navigate(['/dashboard/tâches', t.id]);
  }

  editTask(t: Tache) {
    const ref = this.dialog.open(EditTaskDialogComponent, {
      width: '600px', data: { id: t.id }
    });
    ref.afterClosed().subscribe(updated => { if (updated) this.load(); });
  }

  deleteTask(t: Tache) {
    if (!confirm(`Supprimer la tâche "${t.name}" ?`)) return;
    this.http.delete(`${this.API}/taches/${t.id}`).subscribe(() => this.load());
  }

  selectTask(t: Tache) {
    this.viewTask(t);
  }

  getAssignedNames(t: Tache): string {
    return t.assignedTo.map(u => `${u.prenom} ${u.nom}`).join(', ');
  }

  getStatusLabel(status: Tache['status']): string {
    return this.statuses.find(x => x.value === status)?.label || status;
  }
}

export interface Tache {
  id: number;
  name: string;
  status: 'a_developper'|'en_test'|'suspendu'|'clôturé'|'terminé';
  assignedTo: { id: number; prenom: string; nom: string; }[];
  assignedBy: { id: number; prenom: string; nom: string; };
  publishedAt: string;
  outils: string;
  deadline: string;
}
