import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AssignmentService, ProjectTesterAssignment } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  
    this.assignmentService.getMyAssignments(user.id).subscribe({
      next: assigns => {
        this.assignments = assigns;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.errorMessage = 'Impossible de charger vos assignations.';
        this.loading = false;
      }
    });
  }
  

  /** Ouvre le détail de la désignation (fichier de test ou détail) */
  openAssignment(a: ProjectTesterAssignment) {
    if (!a.project) return;
    this.session.saveCurrentProject(a.project.id);
    this.router.navigate(['/dashboard/projects-test', a.project.id]);
  }
  
}
