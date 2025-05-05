// src/app/testing/services/test-case.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TestCase {
  id?: number;
  caseNumber: string;
  title: string;
  subsystem?: string;
  description?: string;
  executionDate: string;
  preconditions?: string;
  postconditions?: string;
  steps: {
    stepDesc: string;
    action: string;
    expected: string;
    success: boolean;
    comment?: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class TestCaseService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  list(projectId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.base}/${projectId}/test-cases`);
  }

  create(projectId: number, tc: TestCase): Observable<TestCase> {
    return this.http.post<TestCase>(`${this.base}/${projectId}/test-cases`, tc);
  }

  update(projectId: number, tc: TestCase): Observable<TestCase> {
    return this.http.put<TestCase>(`${this.base}/${projectId}/test-cases/${tc.id}`, tc);
  }

  delete(projectId: number, tcId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${projectId}/test-cases/${tcId}`);
  }
}
