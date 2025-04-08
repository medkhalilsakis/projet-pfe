import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table'; // Importation du module MatTable
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

interface Project {
  id: number;
  name: string;
  description: string;
  status: number;
  user: { nom: string; prenom: string; };
  createdAt: string;
  assignments?: Assignment[];
}

interface Assignment {
  id: number;
  numeroTesteur: number;
  testeur: { id: number; name: string; };
  statutTest: string;
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
    MatTabsModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule
  ]
})
export class DesignationTesteurComponent implements OnInit {
  // Listes des projets par statut
  pendingProjects: Project[] = [];
  testingProjects: Project[] = [];
  closedProjects: Project[] = [];
  testers: Tester[] = [];

  // Pour les projets en attente
  selectedTesterForPending: { [projectId: number]: number } = {};

  // Pour les projets en testing : pour ajouter un second testeur (si nécessaire)
  selectedTesterForTesting: { [projectId: number]: number } = {};
  // Pour modifier une affectation existante
  selectedTesterForAssignment: { [assignmentId: number]: number } = {};

  // Pour les projets clôturés : sélection multiple des testeurs à réaffecter
  selectedTestersForClosed: { [projectId: number]: number[] } = {};

  constructor(
    private http: HttpClient,
    private snack: MatSnackBar,
    private session: SessionStorageService
  ) { }

  ngOnInit(): void {
    this.loadProjects();
    this.loadTesters();
  }

  loadProjects(): void {
    // Chargement des projets en attente (status = 1)
    this.http.get<Project[]>('http://localhost:8080/api/assignments/pending-projects')
      .subscribe({
        next: data => this.pendingProjects = data,
        error: () => this.snack.open("Erreur lors du chargement des projets en attente", "Fermer", { duration: 3000 })
      });

    // Chargement des projets en testing (status = 2)
    this.http.get<Project[]>('http://localhost:8080/api/assignments/testing-projects')
      .subscribe({
        next: data => this.testingProjects = data,
        error: () => this.snack.open("Erreur lors du chargement des projets en testing", "Fermer", { duration: 3000 })
      });

    // Pour les projets clôturés (status = 3) – ici nous récupérons tous les projets via l'API projets et filtrons
    this.http.get<Project[]>('http://localhost:8080/api/projects')
      .subscribe({
        next: data => this.closedProjects = data.filter(p => p.status === 3),
        error: () => this.snack.open("Erreur lors du chargement des projets clôturés", "Fermer", { duration: 3000 })
      });
  }

  loadTesters(): void {
    this.http.get<Tester[]>('http://localhost:8080/api/assignments/testers')
      .subscribe({
        next: data => this.testers = data,
        error: () => this.snack.open("Erreur lors du chargement des testeurs", "Fermer", { duration: 3000 })
      });
  }

  canAssign(t: Tester): boolean {
    return t.inProgressCount < 2;
  }

  /* =========================
     Actions pour projets en attente (status = 1)
  ========================== */
  assignPending(projectId: number): void {
    const testeurId = this.selectedTesterForPending[projectId];
    const superviseurId = this.session.getUser().id;
    if (!testeurId) {
      this.snack.open("Sélectionnez un testeur pour assigner.", "Fermer", { duration: 3000 });
      return;
    }
    this.http.post('http://localhost:8080/api/assignments/assign', { projectId, testeurId, superviseurId }, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.snack.open(res, "Fermer", { duration: 3000 });
          this.loadProjects();
          this.loadTesters();
        },
        error: err => {
          // Vérifiez la propriété "err.error" qui devrait contenir le message retourné par le backend
          const errorMessage = err.error || "Erreur inconnue lors de l'assignation.";
          this.snack.open(errorMessage, "Fermer", { duration: 3000 });
        }
      });
  }
  
  

  /* =========================
     Actions pour projets en testing (status = 2)
  ========================== */
  // Ajoute un second testeur si le projet n'en possède qu'un
  addTesterToTesting(project: Project): void {
    const testeurId = this.selectedTesterForTesting[project.id];
    const superviseurId = this.session.getUser().id;
    if (!testeurId) {
      this.snack.open("Sélectionnez un testeur à ajouter.", "Fermer", { duration: 3000 });
      return;
    }
    this.http.post('http://localhost:8080/api/assignments/assign', { projectId: project.id, testeurId, superviseurId }, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.snack.open(res, "Fermer", { duration: 3000 });
          this.loadProjects();
          this.loadTesters();
        },
        error: () => this.snack.open("Erreur lors de l'ajout du testeur.", "Fermer", { duration: 3000 })
      });
  }

  // Modification d'une affectation existante
  updateAssignment(assignmentId: number): void {
    const newTesterId = this.selectedTesterForAssignment[assignmentId];
    if (!newTesterId) {
      this.snack.open("Sélectionnez un nouveau testeur pour modification.", "Fermer", { duration: 3000 });
      return;
    }
    this.http.put('http://localhost:8080/api/assignments/update', { assignmentId, newTesterId }, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.snack.open(res, "Fermer", { duration: 3000 });
          this.loadProjects();
          this.loadTesters();
        },
        error: () => this.snack.open("Erreur lors de la modification.", "Fermer", { duration: 3000 })
      });
  }

  // Suppression d'une affectation
  removeAssignment(assignmentId: number): void {
    this.http.delete(`http://localhost:8080/api/assignments/remove/${assignmentId}`, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.snack.open(res, "Fermer", { duration: 3000 });
          this.loadProjects();
          this.loadTesters();
        },
        error: () => this.snack.open("Erreur lors de la suppression de l'affectation.", "Fermer", { duration: 3000 })
      });
  }

  // Clôturer la phase de testing (pour un projet en cours, status = 2)
  closeTestingPhase(projectId: number): void {
    if (confirm("Êtes-vous sûr de vouloir clôturer la phase de testing ? Tous les testeurs seront retirés et le projet sera clôturé.")) {
      this.http.post(`http://localhost:8080/api/assignments/interrupt/${projectId}`, {}, { responseType: 'text' })
        .subscribe({
          next: (res: string) => {
            this.snack.open(res, "Fermer", { duration: 3000 });
            this.loadProjects();
          },
          error: () => this.snack.open("Erreur lors de la clôture du testing.", "Fermer", { duration: 3000 })
        });
    }
  }

  /* =========================
     Actions pour projets clôturés (status = 3)
     Reprise du testing : réassigner un ou plusieurs testeurs et remettre le projet en testing (status = 2)
  ========================== */
  resumeTestingPhase(projectId: number): void {
    const testerIds = this.selectedTestersForClosed[projectId];
    const superviseurId = this.session.getUser().id;
    if (!testerIds || testerIds.length === 0) {
      this.snack.open("Sélectionnez au moins un testeur pour relancer le testing.", "Fermer", { duration: 3000 });
      return;
    }
    this.http.post(`http://localhost:8080/api/assignments/resume/${projectId}`, { testerIds, superviseurId }, { responseType: 'text' })
      .subscribe({
        next: (res: string) => {
          this.snack.open(res, "Fermer", { duration: 3000 });
          this.loadProjects();
          this.loadTesters();
        },
        error: () => this.snack.open("Erreur lors de la reprise du testing.", "Fermer", { duration: 3000 })
      });
  }
}
