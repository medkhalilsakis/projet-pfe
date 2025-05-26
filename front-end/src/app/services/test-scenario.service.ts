// src/app/services/test-scenario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestScenario } from '../models/test-scenario.model';

@Injectable({ providedIn: 'root' })
export class TestScenarioService {
  private readonly baseUrl = 'http://localhost:8080/api/test-scenarios';

  constructor(private http: HttpClient) {}

  /** Récupère tous les scénarios */
  getAll(): Observable<TestScenario[]> {
    return this.http.get<TestScenario[]>(this.baseUrl);
  }

  /** Récupère un scénario par son id */
  getById(id: number): Observable<TestScenario> {
    return this.http.get<TestScenario>(`${this.baseUrl}/${id}`);
  }

  /** Vérifie s’il existe un scénario pour un projet */
  existsForProject(projectId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists/${projectId}`);
  }

  /** Récupère le scénario pour un projet (avec pièces jointes et étapes) */
  getByProjectId(projectId: number): Observable<TestScenario> {
    return this.http.get<TestScenario>(`${this.baseUrl}/for-project/${projectId}`);
  }

  /**
   * Crée ou met à jour un scénario, avec optionnellement un fichier joint.
   * Si `id` est fourni, on fait un PUT, sinon un POST.
   */
  save(
    scenario: TestScenario,
    file?: File
  ): Observable<TestScenario> {
    // Construit le payload multipart/form-data
    const formData = new FormData();
    // On met les données du DTO sous forme de JSON dans un champ 'data'
    formData.append('data', new Blob([JSON.stringify(scenario)], {
      type: 'application/json'
    }));
    // On ajoute le fichier si fourni
    if (file) {
      formData.append('file', file, file.name);
    }

    if (scenario.id) {
      // Mise à jour
      return this.http.put<TestScenario>(
        `${this.baseUrl}/${scenario.id}`,
        formData
      );
    } else {
      // Création
      return this.http.post<TestScenario>(
        this.baseUrl,
        formData
      );
    }
  }

  /** Supprime un scénario */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
