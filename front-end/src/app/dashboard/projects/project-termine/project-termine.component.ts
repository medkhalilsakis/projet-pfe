import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-project-termine',
  imports: [ CommonModule,
    FormsModule,
    ReactiveFormsModule],
  templateUrl: './project-termine.component.html',
  styleUrl: './project-termine.component.css'
})
export class ProjectTermineComponent {

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

    // Combine multiple status requests
    const statusRequests = [
      this.assignmentService.getMyAssignmentsPerStatus(user.id, "termine"),
      this.assignmentService.getMyAssignmentsPerStatus(user.id, "en_pause"),
      this.assignmentService.getMyAssignmentsPerStatus(user.id, "cloture")
    ];

    forkJoin(statusRequests).subscribe({
      next: (results) => {
        // Merge all assignments from different statuses
        this.assignments = results.flat();
        
        // Sync all statuses
        this.syncAllStatus().subscribe({
          next: () => {
            // Refresh data after sync
            forkJoin(statusRequests).subscribe({
              next: (updatedResults) => {
                this.assignments = updatedResults.flat();
                this.loading = false;
              },
              error: (reloadErr) => {
                console.error('Reload error:', reloadErr);
                this.errorMessage = 'Failed to refresh data';
                this.loading = false;
              }
            });
          },
          error: (syncErr: any) => {
            console.error('Sync error:', syncErr);
            this.errorMessage = 'Synchronization failed';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load assignments';
        this.loading = false;
      }
    });
  }

  syncAllStatus() {
    if (this.assignments.length === 0) {
      return of([]);
    }
    
    const calls = this.assignments.map(a =>
      this.assignmentService.syncStatus(a.id).pipe(
        catchError((_: any) => of(null))
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
