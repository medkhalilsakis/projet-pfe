import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../../services/session-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';


interface Project {
  id: number;
  name: string;
  description: string;
  user: { nom: string; prenom: string; };
  createdAt: string;
}

interface Tester {
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
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule
  ]
})
export class DesignationTesteurComponent implements OnInit {
  projects: Project[] = [];
  testers: Tester[] = [];
  selectedTester: Record<number, number> = {};

  constructor(
    private http: HttpClient,
    private session: SessionStorageService,
    private snack: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProjects();
    this.loadTesters();
  }

  loadProjects() {
    this.http.get<Project[]>('http://localhost:8080/api/assignments/pending-projects')
      .subscribe(data => this.projects = data);
  }

  loadTesters() {
    this.http.get<Tester[]>('http://localhost:8080/api/assignments/testers')
      .subscribe(data => this.testers = data);
  }

  canAssign(t: Tester): boolean {
    return t.inProgressCount < 2;
  }

  assign(projectId: number) {
    const testeurId = this.selectedTester[projectId];
    const superviseurId = this.session.getUser().id;  // récupéré du SessionStorage
    if (!testeurId) {
      this.snack.open('Sélectionnez un testeur', 'Fermer', { duration:3000 });
      return;
    }
    this.http.post('http://localhost:8080/api/assignments/assign', {
      projectId,
      testeurId,
      superviseurId    // ← on envoie ici
    }).subscribe({
      next: () => {
        this.snack.open('Assignation réussie', 'Fermer', { duration:3000 });
        this.loadProjects();
        this.loadTesters();
      },
      error: () => this.snack.open('Erreur assignation', 'Fermer', { duration:3000 })
    });
  }
  
}
