import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssignmentService, FinishedProjectDetail, ProjectTesterAssignment } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { User, UserService } from '../../../services/users.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface Project {
  id: number;
  name: string;
  status: number;
  // etc.
}

@Component({
  selector: 'app-designation-testeur',
  templateUrl: './designation-testeur.component.html',
  styleUrls: ['./designation-testeur.component.css'],
  imports:[
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    FlexLayoutModule
  ],
  providers: [DatePipe]
})
export class DesignationTesteurComponent implements OnInit {
  pending: Project[] = [];
  inTest: Project[] = [];
  finished: Project[] = [];

  allTesteurs: User[] = [];
  selectedTesteursMap: { [projectId: number]: number[] } = {};
  finishedDetails: FinishedProjectDetail[] = [];
  
  superviseurId: number;

  // Après existing fields…
  assignmentsMap: { [projectId: number]: ProjectTesterAssignment[] } = {};

  /** pour chaque projet, nouveaux testeurs à ajouter */
  newTesteursMap: { [projectId: number]: number[] } = {};

  constructor(
    private svc: AssignmentService,
    private session: SessionStorageService,
    private userSvc: UserService,
    private snack: MatSnackBar,
    private datePipe: DatePipe
  ) {
    this.superviseurId = this.session.getUser().id;
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadTesteurs();
    this.loadFinishedDetails();
  }

  loadAll() {
    this.svc.getPending().subscribe(p => this.pending = p);
    this.svc.getInTest().subscribe(p => {
      this.inTest = p;
      // pour chaque projet, charger ses assignations
      p.forEach(proj => this.loadAssignments(proj.id));
    });
    this.svc.getFinished().subscribe(p => this.finished = p);
  }
  
  loadAssignments(projectId: number) {
    this.svc.getAssignments(projectId)
      .subscribe(list => this.assignmentsMap[projectId] = list);
  }
  
  
  removeTesteur(projectId: number, testeurId: number) {
    const current = this.assignmentsMap[projectId] || [];
    if (current.length <= 1) {
      this.snack.open('Il doit rester au moins un testeur', 'OK', { duration: 2000 });
      return;
    }
    // On recrée la liste des IDs sans celui supprimé
    const newIds = current
      .map(a => a.testeur.id)
      .filter(id => id !== testeurId);
  
    // Réassigner via same endpoint
    this.svc.assignTesters(projectId, newIds, this.superviseurId)
      .subscribe(() => {
        this.snack.open('Testeur retiré', 'OK', { duration: 2000 });
        this.loadAll();
      });
  }
  
  addTesteurs(projectId: number) {
    const toAdd = this.newTesteursMap[projectId] || [];
    if (toAdd.length === 0) {
      this.snack.open('Sélectionnez au moins un testeur à ajouter', 'OK', { duration: 2000 });
      return;
    }
    // fusionne avec les existants
    const existants = (this.assignmentsMap[projectId] || []).map(a => a.testeur.id);
    const merged = Array.from(new Set([...existants, ...toAdd]));
  
    this.svc.assignTesters(projectId, merged, this.superviseurId)
      .subscribe(() => {
        this.snack.open('Testeurs ajoutés', 'OK', { duration: 2000 });
        this.newTesteursMap[projectId] = [];
        this.loadAll();
      });
  }
  

  loadTesteurs() {
    this.userSvc.getUsersByRole(2)
      .subscribe({
        next: (users) => {
          this.allTesteurs = users;
        },
        error: (err) => {
          console.error('Erreur chargement testeurs', err);
          this.snack.open('Impossible de charger la liste des testeurs', 'OK', { duration: 3000 });
        }
      });
  }

  assign(projectId: number) {
    const list = this.selectedTesteursMap[projectId] || [];
    if (list.length < 1) {
      this.snack.open('Au moins un testeur requis', 'OK', { duration: 2000 });
      return;
    }
    this.svc.assignTesters(projectId, list, this.superviseurId)
      .subscribe(() => {
        this.snack.open('Testeurs désignés', 'OK', { duration: 2000 });
        this.loadAll();
        // (optionnel) reset de la sélection pour ce projet
        this.selectedTesteursMap[projectId] = [];
      });
  }
  

isTesteurAssigned(projectId: number, testeurId?: number): boolean {
  if (testeurId == null) {
    return false; 
  }
  const as = this.assignmentsMap[projectId] || [];
  return as.some(a => a.testeur.id === testeurId);
}


  pauseProject(projectId: number) {
    this.pause(projectId);
  }
  closeProject(projectId: number) {
    this.close(projectId);
  }

  pause(projectId: number) {
    this.svc.changePhase(projectId, 'pause').subscribe(() => this.loadAll());
  }

  close(projectId: number) {
    this.svc.changePhase(projectId, 'close').subscribe(() => this.loadAll());
  }

  restart(projectId: number) {
    this.svc.restartPhase(projectId).subscribe(() => this.loadAll());
  }

  loadFinishedDetails() {
    this.svc.getFinishedDetails()
      .subscribe(list => this.finishedDetails = list);
  }

  getActionDate(proj: any): string {
    let dateStr = 'Date non disponible';  // Valeur par défaut
  
    // Si le projet est mis en pause (status 55), afficher pausedAt
    if (proj.status === 55 && proj.pausedAt) {
      dateStr = this.datePipe.transform(proj.pausedAt, 'short') || 'Date non disponible';
    }
    // Si le projet est clôturé (status 99), afficher closureAt
    else if (proj.status === 99 && proj.closureAt) {
      dateStr = this.datePipe.transform(proj.closureAt, 'short') || 'Date non disponible';
    }
  
    return dateStr;
  }

  // Relancer un projet
  restartProject(projectId: number) {
    this.svc.restartTestPhase(projectId)
      .subscribe({
        next: () => {
          this.snack.open('Phase de test relancée', 'OK', { duration: 2000 });
          this.loadFinishedDetails();  // Recharger les projets terminés/pauses
        },
        error: (err) => {
          console.error('Erreur lors de la relance du projet', err);
          this.snack.open('Impossible de relancer le projet', 'OK', { duration: 3000 });
        }
      });
  }

  

  // méthode pour choisir l’icône selon le statut
  getStatusIcon(status: number): string {
    return status === 55 ? 'pause' : 'stop';
  }
}
