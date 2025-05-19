import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { PauseRequest } from '../models/pause-request.model';



@Injectable({ providedIn: 'root' })
export class PauseRequestService {
  private readonly baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  requestPause(projectId: number, requesterId: number, reason: string): Observable<PauseRequest> {
    const url = `${this.baseUrl}/${projectId}/pause-requests`;
    const payload = { requesterId, reason };
    return this.http.post<PauseRequest>(url, payload);
  }

  list(projectId: number): Observable<PauseRequest[]> {
    const url = `${this.baseUrl}/${projectId}/pause-requests`;
    return this.http.get<PauseRequest[]>(url);
  }
      listPausedProjectsByUser(userId: number): Observable<PauseRequest[]> {
    const url = `http://localhost:8080/api/projects/user/${userId}/pause-requests`;
    return this.http.get<PauseRequest[]>(url);
  }



  updateStatus(
    projectId: number,
    requestId: number,
    newStatus: 'APPROVED' | 'REJECTED',
    supervisorId: number
  ): Observable<PauseRequest> {
    console.log("wselt lenna ey w ahawa el new status ")
    console.log("new status"+newStatus)
    const url = `${this.baseUrl}/${projectId}/pause-requests/${requestId}`;
    const payload = { status: newStatus, supervisorId :supervisorId };
    return this.http.put<PauseRequest>(url, payload).pipe(
    catchError(error => {
      console.error('Update failed:', error);
      throw error; // Or handle gracefully
    })
  );
}
}