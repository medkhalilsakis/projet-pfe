// src/app/components/complaints/complaints.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ComplaintService } from '../../services/complaint.service';
import { ProjectService } from '../../services/project.service';
import { SessionStorageService } from '../../services/session-storage.service';
import {PauseRequestService} from '../../services/pause-request.service'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-complaints',
  templateUrl: './complaints.component.html',
  styleUrls: ['./complaints.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    RouterModule
  ]
})
export class ComplaintsComponent implements OnInit {
  complaintForm!: FormGroup;
  pausedProjects: any[] = [];
  complaints: any[] = [];
  currentUser: any;
  isSupervisor = false;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private complaintService: ComplaintService,
    private sessionService: SessionStorageService,
    private pauseRequestService :PauseRequestService,
  private http: HttpClient,
      private router: Router

  ) {}

  ngOnInit(): void {
    this.currentUser = this.sessionService.getUser();
    this.isSupervisor = this.currentUser?.role?.id === 3;

    this.complaintForm = this.fb.group({
      pausedProjectId: ['', Validators.required],
      reason: ['', Validators.required],
      details: ['', Validators.required]
    });

    if (this.isSupervisor) {
      this.loadAllComplaints();
    } else {
      this.fetchProjects();
    }
  }

  /* Supervisor view: list all complaints */
  private loadAllComplaints(): void {
    this.complaintService.getAllComplaints().subscribe(data => {
    this.complaints = data
      .sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );      console.log(data)
    });
  }

  /* Developer view: show form and list own complaints */
  fetchProjects(): void {
  this.http.get<any[]>(`http://localhost:8080/api/projects/pause-projects/${this.currentUser.id}`)
    .subscribe(data => {
      this.pausedProjects = data;
      this.loadOwnComplaints();
    });
}
 

  private loadOwnComplaints(): void {
    this.complaintService.getComplaintsByProjectId(this.currentUser.id)
      .subscribe(data => {
this.complaints = data
        .sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });
      console.log(this.complaints)

  }

  onSubmit(): void {
    if (this.complaintForm.valid) {
      const payload = {
        ...this.complaintForm.value,
        complainerId: this.currentUser.id
      };
      this.complaintService.createComplaint(payload).subscribe(() => {
        alert('Réclamation envoyée avec succès.');
        this.complaintForm.reset();
        this.loadOwnComplaints();
      });
    }
  }
    rootToProject(projectId: number) {
    console.log('navigating to project', projectId);
    this.router.navigate(['/dashboard/projects', projectId]);
  }
}