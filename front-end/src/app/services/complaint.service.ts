// src/app/services/complaint.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private baseUrl = 'http://localhost:8080/api/complaints';

  constructor(private http: HttpClient) {}

  // POST: Create a new complaint
  createComplaint(complaint: {
    pausedProjectId: number;
    reason: string;
    details: string;
    complainerId : number
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, complaint);
  }

  // GET: Fetch all complaints
  getAllComplaints(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // GET: Fetch a complaint by its ID
  getComplaintById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // GET: Fetch all complaints related to a specific project
  getComplaintsByProjectId(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/project/${projectId}`);
  }
}
