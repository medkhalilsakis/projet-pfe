// src/app/testing/services/meeting.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meeting {
  id?: number;
  subject: string;
  date: string;
  participants: string[];
  description?: string;
  attachments?: string[];
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  schedule(projectId: number, m: Meeting): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.base}/${projectId}/meetings`, m);
  }

  list(projectId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.base}/${projectId}/meetings`);
  }
}
