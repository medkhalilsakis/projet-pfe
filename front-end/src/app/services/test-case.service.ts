// src/app/testing/services/test-case.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestCase } from '../models/test-case.model';


@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  list(projectId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.base}/${projectId}/test-cases`);
  }

  // test-case.service.ts
  create(projectId: number, tc: TestCase): Observable<TestCase> {
    return this.http.post<TestCase>(
      `${this.base}/${projectId}/test-cases`,
      tc,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      }
    );
  }

  exists(projectId: number, caseNumber: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.base}/${projectId}/test-cases/exists`,
      { params: { caseNumber } }
    );
  }


update(projectId: number, tc: TestCase): Observable<TestCase> {
  return this.http.put<TestCase>(
    `${this.base}/${projectId}/test-cases/${tc.id}`,
    tc,
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}


  delete(projectId: number, tcId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${projectId}/test-cases/${tcId}`);
  }
}
