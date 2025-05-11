// src/app/testing/services/bug-report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BugReport } from '../models/bug-report.model';



@Injectable({ providedIn: 'root' })
export class BugReportService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  report(
    projectId: number,
    br: BugReport & { attachmentsInput?: FileList }
  ): Observable<BugReport> {
    const url = `${this.base}/${projectId}/bugs`;
    const form = new FormData();
  
    form.append('level', br.level);
    form.append('description', br.description);
    if (br.suggestions) form.append('suggestions', br.suggestions);
  
    if (br.attachmentsInput) {
      Array.from(br.attachmentsInput).forEach(file =>
        form.append('attachments', file, file.name)
      );
    }
  
    return this.http.post<BugReport>(url, form);
  }
  
  

  list(projectId: number): Observable<BugReport[]> {
    return this.http.get<BugReport[]>(`${this.base}/${projectId}/bugs`);
  }
}
