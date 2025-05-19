import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-project-in-progress',
  imports: [  CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './project-in-progress.component.html',
  styleUrl: './project-in-progress.component.css'
})
export class ProjectInProgressComponent {

  assignments: ProjectTesterAssignment[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(
    private session: SessionStorageService,
    private assignmentService: AssignmentService,
    private router: Router
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
  
     this.assignmentService.getMyAssignmentsPerStatus(user.id, "en_cours").subscribe({
    next: assigns => {
      this.assignments = assigns;
      // Trigger synchronization and handle completion
      this.syncAllStatus().subscribe({
        next: () => {
          // Re-fetch assignments to get updated statuses
          this.assignmentService.getMyAssignmentsPerStatus(user.id, "en_cours").subscribe({
            next: updatedAssigns => {
              this.assignments = updatedAssigns;
              this.loading = false;
            },
            error: err => {
              console.error('Error reloading assignments:', err);
              this.errorMessage = 'Failed to reload assignments after sync.';
              this.loading = false;
            }
          });
        },
        error: syncErr => {
          console.error('Error during sync:', syncErr);
          this.errorMessage = 'Failed to synchronize assignment statuses.';
          this.loading = false;
        }
      });
    },
    error: err => {
      console.error(err);
      this.errorMessage = 'Failed to load your assignments.';
      this.loading = false;
    }
  });
}

syncAllStatus() {
  if (this.assignments.length === 0) {
    return of([]); // Return empty observable if no assignments
  }
  const calls = this.assignments.map(a =>
    this.assignmentService.syncStatus(a.id).pipe(
      catchError(_ => of(null)) // Handle individual errors to prevent forkJoin from failing
    )
  );
  return forkJoin(calls);
}

  /** Ouvre le détail de la désignation (fichier de test ou détail) */
  openAssignment(a: ProjectTesterAssignment) {
    if (!a.project) return;
    this.session.saveCurrentProject(a.project.id);
    this.router.navigate(['/dashboard/projects-test', a.project.id]);
  }
  
}
