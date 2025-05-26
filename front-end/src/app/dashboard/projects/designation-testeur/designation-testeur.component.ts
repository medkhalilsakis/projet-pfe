import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssignmentService } from '../../../services/assignment.service';
import { SessionStorageService } from '../../../services/session-storage.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../../services/users.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { User } from '../../../models/user.model';
import { ProjectTesterAssignment } from '../../../models/assignment.model';
import { FinishedProjectDetail } from '../../../models/finished-project-detail.model';
import { Project } from '../../../models/project.model';
import { TestScenarioComponent } from './test-scenario/test-scenario.component';
import { MatDialog } from '@angular/material/dialog';
import { TestScenarioService } from '../../../services/test-scenario.service';

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
  testCasesPdf!: File;
  allTesteurs: User[] = [];
  selectedTesteursMap: { [projectId: number]: number[] } = {};
  finishedDetails: FinishedProjectDetail[] = [];
  
  superviseurId: number;

  // Après existing fields…
  assignmentsMap: { [projectId: number]: ProjectTesterAssignment[] } = {};

  /** pour chaque projet, nouveaux testeurs à ajouter */
  newTesteursMap: { [projectId: number]: number[] } = {};

  scenarioExistsMap: { [projectId: number]: boolean } = {};

  constructor(
    private svc: AssignmentService,
    private session: SessionStorageService,
    private userSvc: UserService,
    private snack: MatSnackBar,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private scenarioSvc: TestScenarioService,
  ) {
    this.superviseurId = this.session.getUser().id;
  }

  ngOnInit(): void {
    this.loadAll();
    this.loadTesteurs();
    this.loadFinishedDetails();
  }

    private loadAll() {
    this.svc.getPending().subscribe(p => {
      this.pending = p;
      this.checkScenariosExistence(p);
    });
    this.svc.getInTest().subscribe(p => {
      this.inTest = p;
      this.checkScenariosExistence(p);
    });
    this.loadFinishedDetails();
  }

  private checkScenariosExistence(list: Project[]): void {
    list.forEach(proj => {
      this.scenarioSvc.existsForProject(proj.id)
        .subscribe(exists => this.scenarioExistsMap[proj.id] = exists);
    });
  }

  refreshAll() {
    this.loadAll();             // recharge pending & inTest
    this.loadFinishedDetails(); // recharge terminés/pause
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
  
    const newIds = current
      .map(a => a.testeur.id)
      .filter(id => id !== testeurId);
  
   
  }
  
  
  addTesteurs(projectId: number) {
    const toAdd = this.newTesteursMap[projectId] || [];
    if (toAdd.length === 0) {
      this.snack.open('Sélectionnez au moins un testeur à ajouter', 'OK', { duration: 2000 });
      return;
    }
  
    const existants = (this.assignmentsMap[projectId] || []).map(a => a.testeur.id);
    const merged = Array.from(new Set([...existants, ...toAdd]));
  
  
  }
   onTestCasesPdfChange(e: any) {
    this.testCasesPdf = e.target.files[0];
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
    if(!this.testCasesPdf){
      return;
    }
    const list = this.selectedTesteursMap[projectId] || [];
    if (list.length < 1) {
      this.snack.open('Au moins un testeur requis', 'OK', { duration: 2000 });
      return;
    }
    this.svc.assignTesters(projectId, list, this.superviseurId,this.testCasesPdf)
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
    this.refreshAll();
  }
  closeProject(projectId: number) {
    this.close(projectId);
    this.refreshAll();
  }


  loadFinishedDetails() {
    this.svc.getFinishedDetails()
      .subscribe(list => this.finishedDetails = list);
  }

  getActionDateText(proj: FinishedProjectDetail): string {
    if (proj.status === 55 && proj.pausedAt) {
      return `Mis en pause le ${this.datePipe.transform(proj.pausedAt, 'short')}`;
    }
    if (proj.status === 99 && proj.closureAt) {
      return `Clôturé le ${this.datePipe.transform(proj.closureAt, 'short')}`;
    }
    return proj.status === 55 
      ? 'Date de pause non disponible' 
      : 'Date de clôture non disponible';
  }
  

  // Relancer un projet
  pause(projectId: number) {
    this.svc.changePhase(projectId, 'en_pause').subscribe(() => this.refreshAll());
  }
  
  close(projectId: number) {
    this.svc.changePhase(projectId, 'cloture').subscribe(() => this.refreshAll());
  }
  
  restart(projectId: number) {
    this.svc.restartPhase(projectId).subscribe(() => this.refreshAll());
  }
  
  restartProject(projectId: number) {
    this.svc.restartTestPhase(projectId).subscribe({
      next: () => {
        this.snack.open('Phase de test relancée', 'OK', { duration: 2000 });
        this.refreshAll();
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

  ScenarioTest(projectId: number): void {
    const dialogRef = this.dialog.open(TestScenarioComponent, {
      width: '800px',
      data: { projectId: projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snack.open('Scénario de test enregistré', 'OK', { duration: 2500 });
        // si besoin de rafraîchir la liste ou autre
        this.refreshAll();
      }
    });
  }
}
