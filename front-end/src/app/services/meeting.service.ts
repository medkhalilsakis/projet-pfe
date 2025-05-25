// src/app/testing/services/meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';

@Injectable({ providedIn: 'root' })
export class MeetingService {
  /** Pour les réunions liées à un projet */
  private baseProject = 'http://localhost:8080/api/projects';

  /** Pour les réunions indépendantes de tout projet */
  private baseGlobal = 'http://localhost:8080/api/meetings';

  constructor(private http: HttpClient) {}

  /**
   * Planifie une réunion rattachée à un projet spécifique.
   */
  schedule(projectId: number, m: Meeting, userId: number): Observable<Meeting> {
    const url = `${this.baseProject}/${projectId}/meetings`;
    return this.postMeeting(url, m, userId);
  }

  /**
   * Planifie une réunion sans projet (projectId = null côté backend).
   */
  scheduleNoProject(m: Meeting, userId: number): Observable<Meeting> {
    const url = this.baseGlobal;
    return this.postMeeting(url, m, userId);
  }

  /**
   * Internal helper pour emballer le Meeting + userId dans un FormData
   */
  private postMeeting(url: string, m: Meeting, userId: number): Observable<Meeting> {
    const form = new FormData();

    // Construire le payload JSON
    const payload = {
      subject: m.subject,
      date: m.date,
      participantsIds: [...(m.participantsIds || []), userId],
      description: m.description,
      projectId: m.projectId ?? null
    };
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    form.append('data', blob);

    // pièces jointes
    if (m.attachments) {
      const files: File[] = m.attachments instanceof FileList
        ? Array.from(m.attachments as FileList)
        : (m.attachments as File[]);
      files.forEach(f => form.append('attachments', f, f.name));
    }

    return this.http.post<Meeting>(url, form);
  }

  /** Liste des réunions pour un projet */
  list(projectId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.baseProject}/${projectId}/meetings`);
  }

  /** Toutes réunions d’un utilisateur */
  getUserMeetings(userId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`http://localhost:8080/api/users/${userId}/meetings`);
  }


  getById(meetingId: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.baseGlobal}/${meetingId}`);
  }

  /** Récupérer une réunion rattachée à un projet */
  getByProject(projectId: number, meetingId: number): Observable<Meeting> {
    return this.http.get<Meeting>(
      `${this.baseProject}/${projectId}/meetings/${meetingId}`
    );
  }

  /** Mettre à jour une réunion (PATCH) */
  update(meetingId: number, changes: Partial<Meeting>): Observable<Meeting> {
    // Adapte l’URL selon que la réunion a ou non un projectId
    const urlGlobal = `${this.baseGlobal}/${meetingId}`;
    return this.http.patch<Meeting>(urlGlobal, changes);
  }

  /** Supprimer (annuler) une réunion */
  delete(meetingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseGlobal}/${meetingId}`);
  }
}
