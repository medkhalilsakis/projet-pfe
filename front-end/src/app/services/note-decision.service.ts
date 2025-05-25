import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NoteDecision } from '../models/notes.model';

@Injectable({ providedIn: 'root' })
export class NoteDecisionService {
  private readonly baseUrl = 'http://localhost:8080/api/notes-decisions';

  constructor(private http: HttpClient) {}

  create(formData: FormData) {
  return this.http.post<NoteDecision>(
    this.baseUrl,
    formData
  );
}
update(id: number, formData: FormData) {
  return this.http.put<NoteDecision>(
    `${this.baseUrl}/${id}`,
    formData
  );
}

  findAll(): Observable<NoteDecision[]> {
    return this.http.get<NoteDecision[]>(this.baseUrl);
  }

  findById(id: number): Observable<NoteDecision> {
    return this.http.get<NoteDecision>(`${this.baseUrl}/${id}`);
  }
}