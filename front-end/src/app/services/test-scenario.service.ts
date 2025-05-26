import { Injectable } from '@angular/core';
import { HttpClient }     from '@angular/common/http';
import { Observable }     from 'rxjs';
import { TestScenario }   from '../models/test-scenario.model';

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

  /** Crée un nouveau scénario */
  create(scenario: TestScenario): Observable<TestScenario> {
    return this.http.post<TestScenario>(this.baseUrl, scenario);
  }

  /** Met à jour un scénario existant */
  update(id: number, scenario: TestScenario): Observable<TestScenario> {
    return this.http.put<TestScenario>(`${this.baseUrl}/${id}`, scenario);
  }

  /** Supprime un scénario */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  existsForProject(projectId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/exists/${projectId}`);
  }

}
