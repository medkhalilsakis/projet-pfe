// src/app/services/assignment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface représentant un projet minimal pour la désignation.
 * Vous pouvez l’enrichir avec d’autres champs (name, description, etc.).
 */
export interface ProjectLight {
  id: number;
  name: string;
  status: number;
}

/**
 * Interface pour un enregistrement d’assignation (ProjectTesterAssignment).
 */
export interface ProjectTesterAssignment {
  id: number;
  project: ProjectLight;
  testeur: { id: number; nom: string; prenom: string };
  superviseur: { id: number; nom: string; prenom: string };
  dateDesignation: string;    // ex: "2025-05-04"
  numeroTesteur: number;
  casTestPath?: string;
  statutTest: string;         // ex: "non_commence", "en_cours", etc.
}

// src/app/models/finished-detail.ts
export interface FinishedProjectDetail {
  projectId: number;
  name: string;
  status: number;               // 55 = pause, 99 = clôture
  actionDate: string;           // ISO string
  supervisorName: string;
  testerNames: string[];
}


@Injectable({
  providedIn: 'root'
})
export class AssignmentService {

  private baseUrl = 'http://localhost:8080/api/tester-assignments';

  constructor(private http: HttpClient) { }

  /** Récupère les projets en attente de désignation (status = 1) */
  getPending(): Observable<ProjectLight[]> {
    return this.http.get<ProjectLight[]>(`${this.baseUrl}/pending`);
  }

  /** Récupère les projets en cours de test (status = 2) */
  getInTest(): Observable<ProjectLight[]> {
    return this.http.get<ProjectLight[]>(`${this.baseUrl}/in-test`);
  }

  /** Récupère les projets mis en pause (55) ou clôturés (99) */
  getFinished(): Observable<ProjectLight[]> {
    return this.http.get<ProjectLight[]>(`${this.baseUrl}/finished`);
  }

  /**
   * Récupère les assignations actuelles d’un projet
   * @param projectId ID du projet
   */
  getAssignments(projectId: number): Observable<ProjectTesterAssignment[]> {
    return this.http.get<ProjectTesterAssignment[]>(
      `${this.baseUrl}/${projectId}/assignments`
    );
  }

  /**
   * Désigne une nouvelle liste de testeurs et lance la phase de test.
   * @param projectId      ID du projet
   * @param testeurIds     Tableau d’IDs des testeurs à assigner
   * @param superviseurId  ID du superviseur qui désigne
   */
  assignTesters(
    projectId: number,
    testeurIds: number[],
    superviseurId: number
  ): Observable<void> {
    // on passe superviseurId en query params
    const params = new HttpParams().set('superviseurId', superviseurId.toString());
    return this.http.post<void>(
      `${this.baseUrl}/${projectId}/assign`,
      testeurIds,
      { params }
    );
  }

  /**
   * Met en pause ou clôture la phase de test.
   * @param projectId ID du projet
   * @param action    'pause' ou 'close'
   */
  changePhase(
    projectId: number,
    action: 'pause'|'close'
  ): Observable<void> {
    const params = new HttpParams().set('action', action);
    return this.http.post<void>(
      `${this.baseUrl}/${projectId}/phase`,
      null,
      { params }
    );
  }

  /**
   * Relance la phase de test (remet status en 2)
   * @param projectId ID du projet
   */
  restartPhase(projectId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${projectId}/restart`,
      null
    );
  }

  
  getFinishedDetails(): Observable<FinishedProjectDetail[]> {
    return this.http.get<FinishedProjectDetail[]>(`${this.baseUrl}/finished-detail`);
  }

  // Relancer un projet
  restartTestPhase(projectId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${projectId}/restart`, null);
  }

}
