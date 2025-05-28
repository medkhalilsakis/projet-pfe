import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-project-test',
  templateUrl: './project-test.component.html',
  styleUrls: ['./project-test.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProjectTestComponent implements OnInit {

  assignments: ProjectTesterAssignment[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private session: SessionStorageService,
    private assignmentService: AssignmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.session.getUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    if (user.role.id !== 2) {
      this.router.navigate(['/forbidden']);
      return;
    }
  this.assignmentService.getMyAssignmentsPerStatus(user.id, "non_commence").subscribe({
  next: assigns => {
    this.assignments = assigns;
    
    // Start synchronization process
    this.syncAllStatus().subscribe({
      next: () => {
        // After sync completes, refresh the assignments list
        this.assignmentService.getMyAssignmentsPerStatus(user.id, "non_commence").subscribe({
          next: updatedAssigns => {
            this.assignments = updatedAssigns;
            this.loading = false;
          },
          error: reloadErr => {
            console.error('Error reloading assignments:', reloadErr);
            this.errorMessage = 'Failed to refresh assignments after sync';
            this.loading = false;
          }
        });
      },
      error: (syncErr: any) => {
        console.error('Sync error:', syncErr);
        this.errorMessage = 'Failed to synchronize statuses';
        this.loading = false;
      }
    });
  },
  error: err => {
    console.error(err);
    this.errorMessage = 'Impossible de charger vos assignations.';
    this.loading = false;
  }
});
}

syncAllStatus() {
  if (this.assignments.length === 0) {
    // Return an empty completed observable
    return of([]);
  }
  
  const calls = this.assignments.map(a =>
    this.assignmentService.syncStatus(a.id).pipe(
      catchError(_ => of(null))
  ));

  return forkJoin(calls);
}

  /** Ouvre le détail de la désignation (fichier de test ou détail) */
  openAssignment(a: ProjectTesterAssignment) {
    if (!a.project) return;
    this.session.saveCurrentProject(a.project.id);
    this.router.navigate(['/dashboard/projects-test', a.project.id]);
  }
  
}
