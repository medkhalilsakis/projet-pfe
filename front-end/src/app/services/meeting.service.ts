// src/app/testing/services/meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Meeting } from '../models/meeting.model';



@Injectable({ providedIn: 'root' })
export class MeetingService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  schedule(projectId: number, m: any, userId: number): Observable<Meeting> {
    const url = `${this.base}/${projectId}/meetings`;
    const form = new FormData();

    // 1) Emballer le JSON dans un blob
    const blob = new Blob([ JSON.stringify({
      subject:      m.subject,
      date:         m.date,
      participantsIds: [...m.participantsIds, userId],
      description:  m.description
    })], { type: 'application/json' });
    form.append('data', blob);

    // 2) Normaliser attachments en tableau de File
    const filesArray: File[] = [];
    if (m.attachments) {
      if (m.attachments instanceof FileList) {
        for (let i = 0; i < m.attachments.length; i++) {
          const f = m.attachments.item(i);
          if (f) filesArray.push(f);
        }
      } else {
        filesArray.push(...m.attachments);
      }
    }

    // 3) Ajouter chaque fichier au FormData
    filesArray.forEach(file => form.append('attachments', file, file.name));

    // 4) Envoyer le multipart/form-data
    return this.http.post<Meeting>(url, form);
  }

  list(projectId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.base}/${projectId}/meetings`);
  }
    getUserMeetings(userId: number): Observable<any[]> {
    return this.http.get<Meeting[]>(`http://localhost:8080/api/users/${userId}/meetings`);
  }
}
