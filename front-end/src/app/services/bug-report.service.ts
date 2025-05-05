// src/app/testing/services/bug-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BugReport {
  id?: number;
  level: 'critical'|'major'|'minor';
  description: string;
  suggestions?: string;
  attachments?: FileList;
}

@Injectable({ providedIn: 'root' })
export class BugReportService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  report(projectId: number, br: BugReport): Observable<BugReport> {
    return this.http.post<BugReport>(`${this.base}/${projectId}/bugs`, br);
  }

  list(projectId: number): Observable<BugReport[]> {
    return this.http.get<BugReport[]>(`${this.base}/${projectId}/bugs`);
  }
}
