import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../../services/session-storage.service';
import { AssignmentService } from '../../../services/assignment.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

export interface Assignment {
  id: number;
  testeur: { id: number; prenom: string; nom: string };
  statutTest: string;
}
export interface Project {
  id: number;
  name: string;
  description: string;
  status: number;
  user: { prenom: string; nom: string };
  createdAt: string;
  assignments: Assignment[];
}
export interface Tester {
  id: number;
  name: string;
  inProgressCount: number;
}

@Component({
  selector: 'app-designation-testeur',
  templateUrl: './designation-testeur.component.html',
  styleUrls: ['./designation-testeur.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,


  ]
})
export class DesignationTesteurComponent implements OnInit {
  pendingProjects: Project[] = [];
  testingProjects: Project[] = [];
  closedProjects: Project[] = [];
  testers: Tester[] = [];

  // selections
  selectedPending: { [pid: number]: number[] } = {};
  selectedAdd: { [pid: number]: number } = {};
  selectedReplace: { [aid: number]: number } = {};
  selectedClosed: { [pid: number]: number[] } = {};

  // form visibility
  showPauseForm: { [pid: number]: boolean } = {};
  showCloseForm: { [pid: number]: boolean } = {};

  pauseForm: FormGroup;
  closeForm: FormGroup;

  supervisorId: number;

  constructor(
    private svc: AssignmentService,
    private snack: MatSnackBar,
    private session: SessionStorageService,
    private fb: FormBuilder
  ) {
    const user = this.session.getUser();
    this.supervisorId = user?.role.id === 3 ? user.id : 0;
    this.pauseForm = this.fb.group({ reason: ['', Validators.required], files: [null] });
    this.closeForm = this.fb.group({ reason: ['', Validators.required], files: [null] });
  }

  ngOnInit(): void {
    if (this.supervisorId === 0) return; // accès interdit
    this.loadAll();
  }

  loadAll(): void {
    this.svc.getPendingProjects().subscribe(list => this.pendingProjects = list);
    this.svc.getTestingProjects().subscribe(list => this.testingProjects = list);
    this.svc.getClosedProjects().subscribe(list => this.closedProjects = list);
    this.svc.getTesters().subscribe(list => this.testers = list);
  }

  /* ===== En attente ===== */
  assignPending(pid: number): void {
    const ids = this.selectedPending[pid] || [];
    if (!ids.length) { this.snack.open('Sélectionnez au moins un testeur', 'Fermer', { duration: 3000 }); return; }
    this.svc.assignMultiple(pid, this.supervisorId, ids).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); },
      err => this.snack.open(err, 'Fermer', { duration: 3000 })
    );
  }

  /* ===== En testing ===== */
  addTester(p: Project): void {
    const id = this.selectedAdd[p.id];
    if (!id) { this.snack.open('Sélectionnez un testeur à ajouter', 'Fermer', { duration: 3000 }); return; }
    this.svc.assignOne(p.id, id, this.supervisorId).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }

  replaceAssign(a: Assignment): void {
    const id = this.selectedReplace[a.id];
    if (!id) { this.snack.open('Sélectionnez un nouveau testeur', 'Fermer', { duration: 3000 }); return; }
    this.svc.updateTester(a.id, id).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }

  removeAssign(a: Assignment, p: Project): void {
    if ((p.assignments?.length || 0) <= 1) { this.snack.open('Au moins 1 testeur requis', 'Fermer', { duration: 3000 }); return; }
    this.svc.removeTester(a.id).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }

  togglePauseForm(pid: number): void {
    this.showPauseForm[pid] = !this.showPauseForm[pid];
    this.pauseForm.reset();
  }

  submitPause(p: Project): void {
    if (this.pauseForm.invalid) return;
    const { reason, files } = this.pauseForm.value;
    this.svc.pause(p.id, this.supervisorId, reason, files).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); this.showPauseForm[p.id] = false; }
    );
  }

  toggleCloseForm(pid: number): void {
    this.showCloseForm[pid] = !this.showCloseForm[pid];
    this.closeForm.reset();
  }

  submitClose(p: Project): void {
    if (this.closeForm.invalid) return;
    const { reason, files } = this.closeForm.value;
    this.svc.closeProject(p.id, this.supervisorId, reason, files).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); this.showCloseForm[p.id] = false; }
    );
  }

  /* ===== Clôturés / En pause ===== */
  resume(p: Project): void {
    const ids = this.selectedClosed[p.id] || [];
    if (!ids.length) { this.snack.open('Sélectionnez des testeurs', 'Fermer', { duration: 3000 }); return; }
    this.svc.resume(p.id, this.supervisorId, ids).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }

  archive(p: Project): void {
    this.svc.archive(p.id).subscribe(
      res => { this.snack.open(res, 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }

  delete(p: Project): void {
    if (!confirm('Supprimer définitivement ?')) return;
    this.svc.deleteProject(p.id).subscribe(
      () => { this.snack.open('Projet supprimé', 'Fermer', { duration: 3000 }); this.loadAll(); }
    );
  }
}