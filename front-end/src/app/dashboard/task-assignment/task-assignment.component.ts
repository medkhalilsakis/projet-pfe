// src/app/task-assignment/task-assignment.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageEvent, MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import { EditTaskDialogComponent } from './edit-task-dialog/edit-task-dialog.component';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SessionStorageService } from '../../services/session-storage.service';
import { UserService } from '../../services/users.service';
import { InitiationPhaseService } from '../../services/initiation-phase.service';

interface Tache {
  id: number;
  name: string;
  status: 'a_developper'|'en_test'|'suspendu'|'clôturé'|'terminé';
  assignedTo: { id: number; prenom: string; nom: string; }[];
  assignedBy: { id: number; prenom: string; nom: string; };
  publishedAt: string;
  outils: string;
  deadline: string;
}


@Component({
  selector: 'app-task-assignment',
  standalone: true,
  templateUrl: './task-assignment.component.html',
  styleUrls: ['./task-assignment.component.css'],
  imports: [
    CommonModule, FormsModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCardModule, MatChipsModule, MatRippleModule,
    MatPaginatorModule,
    MatDialogModule,
    FlexLayoutModule
  ]
})
export class TaskAssignmentComponent implements OnInit {
  private phaseExists: Record<number, boolean> = {};
  tâches: Tache[] = [];
  filtered: Tache[] = [];
  pageSlice: Tache[] = [];
  search = '';
  statusFilter = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = 9;
  pageIndex = 0;
  currentUser :any
  role:any
  statuses = [
    { value: '',             label: 'Tous' },
    { value: 'a_developper', label: 'À développer' },
    { value: 'en_cours',      label: 'En cours' },
    { value: 'suspendu',     label: 'Suspendu' },
    { value: 'cloturé',      label: 'Cloturé' },
    { value: 'terminé',      label: 'Terminé' }
  ];

  readonly API = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    private sessionStorage:SessionStorageService,
    private initPhaseSvc: InitiationPhaseService,
    private userService: UserService
  ) {}
  
  ngOnInit() {
    this.currentUser=this.sessionStorage.getUser()
    this.role=this.currentUser.role;
    if (this.role.id===3){
      this.loadAndSync();
    }
    if (this.role.id===1){
      this.loadUserTasksAndSync();
    }


  }
  isSupervisor(): boolean {
    return this.role.id === 3;
  }

   isDev(){
    if (this.role===1){
      return true
    }
    return false
  }
   private loadUserTasksAndSync() {
    let params = new HttpParams();
    params = params.set('assignedTo', this.currentUser.id);
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http.get<Tache[]>(`${this.API}/taches`, { params })
      .subscribe(list => {
        this.tâches = list;
        this.syncAllStatuses()
          .subscribe({
            next: () => {
              this.applyFilters();
            },
            error: err => {
              console.error('Erreur de sync des statuts', err);
              this.applyFilters();
            }
          });
      });
  }


  /** 1) Charge la liste, 2) synchronise statuts, 3) applique filtres */
  private loadAndSync() {
    let params = new HttpParams();
    if (this.search)       params = params.set('q', this.search.trim());
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http.get<Tache[]>(`${this.API}/taches`, { params })
      .subscribe(list => {
        this.tâches = list;
        this.syncAllStatuses()
          .subscribe({
            next: () => {
              this.applyFilters();
              this.cachePhaseFlags(list);
            },
            error: err => {
              console.error('Erreur de sync des statuts', err);
              this.applyFilters();
            }
          });
      });
  }

  /** Appelle /syncStatus pour chaque tâche, met à jour en mémoire */
  private syncAllStatuses() {
    const calls = this.tâches.map(t =>
      this.http.put<{ status: string }>(
        `${this.API}/taches/${t.id}/syncStatus`,
        null
      ).pipe(
        catchError(_ => of(null))  // si erreur sur une, on continue
      )
    );
    return forkJoin(calls).pipe(
      // pour chaque réponse éventuelle, mettre à jour tâches[i].status
      // mais ici notre endpoint ne renvoie rien, alors on se contente de rafraîchir via GET si besoin
    );
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

  selectTask(t: Tache) {
    this.viewTask(t);
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
    ref.afterClosed().subscribe(created => { if (created) this.loadAndSync(); });
  }

  viewTask(t: Tache) {
    this.router.navigate(['/dashboard/tâches', t.id]);
  }

  InitiationPhase(t: Tache) {
    this.router.navigate(['/dashboard/InitTache', t.id]);
  }
  private cachePhaseFlags(list: Tache[]): void {
    const calls = list.map(t =>
      this.initPhaseSvc.existsForTache(t.id)
        .pipe(
          catchError(() => of(false))
        )
    );
    forkJoin(calls).subscribe(flags => {
      list.forEach((t, idx) => {
        this.phaseExists[t.id] = flags[idx];
      });
      this.applyFilters();
    });
  }

  /** Méthode utilisée en template pour savoir si la phase existe */
  hasPhase(t: Tache): boolean {
    return !!this.phaseExists[t.id];
  }

  editTask(t: Tache) {
    const ref = this.dialog.open(EditTaskDialogComponent, {
      width: '600px', data: { id: t.id }
    });
    ref.afterClosed().subscribe(updated => { if (updated) this.loadAndSync(); });
  }

  deleteTask(t: Tache) {
    if (!confirm(`Supprimer la tâche "${t.name}" ?`)) return;
    this.http.delete(`${this.API}/taches/${t.id}`)
      .subscribe(() => this.loadAndSync());
  }

  getAssignedNames(t: Tache): string {
    return t.assignedTo.map(u => `${u.prenom} ${u.nom}`).join(', ');
  }

  getStatusLabel(status: Tache['status']): string {
    return this.statuses.find(x => x.value === status)?.label || status;
  }
}
