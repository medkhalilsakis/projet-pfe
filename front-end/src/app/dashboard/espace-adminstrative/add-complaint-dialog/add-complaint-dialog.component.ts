import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }    from '@angular/material/select';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatIconModule }      from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComplaintService } from '../../../services/complaint.service';
import { ProjectService } from '../../../services/project.service';
import { SessionStorageService } from '../../../services/session-storage.service';



interface Project { id: number; name: string; }

@Component({
  selector: 'app-add-complaint',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './add-complaint-dialog.component.html',
  styleUrls: ['./add-complaint-dialog.component.css']
})
export class AddComplaintDialogComponent implements OnInit {
  complaintForm!: FormGroup;
  projects: Project[] = [];
  loading = false;
  errorMessage: string | null = null;

  private complainerId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private complaintService: ComplaintService,
    private projectService: ProjectService,
    private session: SessionStorageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // 1) Lire l'ID utilisateur dans les query params
    const userParam = this.route.snapshot.queryParamMap.get('User');
    const userId = userParam ? Number(userParam) : null;
    if (!userId) {
      this.errorMessage = 'Utilisateur non défini.';
      return;
    }
    this.complainerId = userId;

    // 2) Construire le formulaire
    this.complaintForm = this.fb.group({
      projectId:       [null, Validators.required],
      reason:          ['', [Validators.required, Validators.minLength(5)]],
      details:         ['', [Validators.required, Validators.minLength(10)]],
      complainerId:    [this.complainerId, Validators.required]
    });

    // 3) Charger la liste des projets pour le select
    this.projectService.getAllProjects().subscribe({
      next: projs => this.projects = projs,
      error: err => {
        console.error('Erreur chargement projets', err);
        this.errorMessage = 'Impossible de charger les projets.';
      }
    });
  }

  onSubmit(): void {
    if (this.complaintForm.invalid) {
      return;
    }
    this.loading = true;
    // Préparer le payload adapté au service
    const payload = {
      pausedProjectId: this.complaintForm.value.projectId,
      reason:          this.complaintForm.value.reason,
      details:         this.complaintForm.value.details,
      complainerId:    this.complaintForm.value.complainerId
    };
    this.complaintService.createComplaint(payload).subscribe({
      next: () => {
        this.snackBar.open('Réclamation envoyée.', 'OK', { duration: 3000 });
        // Retour au dashboard
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        console.error('Erreur création réclamation', err);
        this.snackBar.open('Échec de l’envoi.', 'FERMER', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
