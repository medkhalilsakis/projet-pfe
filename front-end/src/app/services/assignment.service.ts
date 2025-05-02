import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private base = 'http://localhost:8080/api/assignments';
  private projectsBase = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  // Pending
  getPendingProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/pending-projects`);
  }

  assignMultiple(projectId: number, supervisorId: number, testerIds: number[]): Observable<string> {
    return this.http.post<string>(
      `${this.base}/assign`,
      { projectId, superviseurId: supervisorId, testerIds }
    );
  }

  // Testing
  getTestingProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/testing-projects`);
  }

  assignOne(projectId: number, testeurId: number, supervisorId: number): Observable<string> {
    return this.http.post<string>(
      `${this.base}/assign`,
      { projectId, testeurId, superviseurId: supervisorId }
    );
  }

  updateTester(assignmentId: number, newTesterId: number): Observable<string> {
    return this.http.put<string>(
      `${this.base}/update`,
      { assignmentId, newTesterId }
    );
  }

  removeTester(assignmentId: number): Observable<string> {
    return this.http.delete<string>(`${this.base}/remove/${assignmentId}`);
  }

  // src/app/services/assignment.service.ts

pause(projectId: number, supervisorId: number, reason: string, files: FileList): Observable<string> {
    const form = new FormData();
    form.append('supervisorId', supervisorId.toString());
    form.append('reason', reason);
    if (files) {
      Array.from(files).forEach(f => form.append('files', f));
    }
    // Ajout de responseType:'text'
    return this.http.post(
      `${this.base}/pause/${projectId}`,
      form,
      { responseType: 'text' }
    );
  }
  
  closeProject(projectId: number, supervisorId: number, reason: string, files: FileList): Observable<string> {
    const form = new FormData();
    form.append('supervisorId', supervisorId.toString());
    form.append('reason', reason);
    if (files) {
      Array.from(files).forEach(f => form.append('files', f));
    }
    return this.http.post(
      `${this.base}/${projectId}/close`,
      form,
      { responseType: 'text' }
    );
  }
  

  // Closed
  getClosedProjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/closed-projects`);
  }

  resume(projectId: number, supervisorId: number, testerIds: number[]): Observable<string> {
    return this.http.post(
      `${this.base}/resume/${projectId}`,
      { superviseurId: supervisorId, testerIds },
      { responseType: 'text' }
    );
  }
  archive(projectId: number): Observable<string> {
    return this.http.post<string>(`${this.base}/archive/${projectId}`, null);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.projectsBase}/${projectId}`);
  }

  getTesters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/testers`);
  }
}
