// src/app/testing/services/test-case-upload.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadedTestCase {
  id: number;
  originalFilename: string;
  filePath: string;
  mimeType: string;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class TestCaseUploadService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  upload(projectId: number, file: File, userId: number): Observable<UploadedTestCase> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('userId', userId.toString());
    return this.http.post<UploadedTestCase>(`${this.base}/${projectId}/test-cases/upload`, fd);
  }

  list(projectId: number): Observable<UploadedTestCase[]> {
    return this.http.get<UploadedTestCase[]>(`${this.base}/${projectId}/test-cases/uploads`);
  }
}
