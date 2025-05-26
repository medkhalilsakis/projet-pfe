import { Injectable }               from '@angular/core';
import { HttpClient }               from '@angular/common/http';
import { Observable }               from 'rxjs';
import { InitiationPhase } from '../models/initiation-phase/initiation-phase.model';

@Injectable({
  providedIn: 'root'
})
export class InitiationPhaseService {

  private readonly baseUrl = 'http://localhost:8080/api/initiation-phases';

  constructor(private http: HttpClient) { }

  /** Récupère toutes les phases d’initiation */
  getAll(): Observable<InitiationPhase[]> {
    return this.http.get<InitiationPhase[]>(this.baseUrl);
  }

  /** Récupère une phase par son id */
  getById(id: number): Observable<InitiationPhase> {
    return this.http.get<InitiationPhase>(`${this.baseUrl}/${id}`);
  }

  /** Crée une nouvelle phase */
  create(phase: InitiationPhase): Observable<void> {
  return this.http.post<void>(
    this.baseUrl,
    phase,
    { responseType: 'text' as 'json' }  // workaround pour 204 sans JSON
  );
}

getByTacheId(tacheId: number): Observable<InitiationPhase> {
    return this.http.get<InitiationPhase>(
      `${this.baseUrl}/by-tache/${tacheId}`
    );
  }

  /** Met à jour une phase existante */
  update(id: number, phase: InitiationPhase): Observable<InitiationPhase> {
    return this.http.put<InitiationPhase>(`${this.baseUrl}/${id}`, phase);
  }

  /** Supprime une phase */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  existsForTache(tacheId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/exists/${tacheId}`
    );
  }
}
