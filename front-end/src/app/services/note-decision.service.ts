import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoteDecision } from '../models/notes.model';

@Injectable({ providedIn: 'root' })
export class NoteDecisionService {
  private readonly baseUrl = 'http://localhost:8080/api/notes-decisions';

  constructor(private http: HttpClient) {}

  /** Récupère toutes les notes & décisions */
  findAll(): Observable<NoteDecision[]> {
    return this.http.get<NoteDecision[]>(this.baseUrl);
  }

  /** Récupère une note/décision par ID */
  findById(id: number): Observable<NoteDecision> {
    return this.http.get<NoteDecision>(`${this.baseUrl}/${id}`);
  }

  /** Crée une nouvelle note ou décision */
  create(note: NoteDecision): Observable<NoteDecision> {
    return this.http.post<NoteDecision>(this.baseUrl, note);
  }

  /** Met à jour une note ou décision existante */
  update(id: number, note: NoteDecision): Observable<NoteDecision> {
    return this.http.put<NoteDecision>(`${this.baseUrl}/${id}`, note);
  }

  /** Supprime une note ou décision par ID */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
