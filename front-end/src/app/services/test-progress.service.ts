// src/app/services/test-progress.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TestProgressService {
  private base = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  getTypes(pid: number, userId: number): Observable<string[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<string[]>(
      `${this.base}/${pid}/progress/types`,
      { params }
    );
  }

  saveTypes(pid: number, userId: number, types: string[]): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<void>(
      `${this.base}/${pid}/progress/types`,
      types,
      { params }
    );
  }

  getLevels(pid: number, userId: number): Observable<Record<string,boolean>> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Record<string,boolean>>(
      `${this.base}/${pid}/progress/levels`,
      { params }
    );
  }

  updateLevel(pid: number, userId: number, level: string, completed: boolean): Observable<void> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('level', level)
      .set('completed', completed.toString());
    return this.http.post<void>(
      `${this.base}/${pid}/progress/levels`,
      null,
      { params }
    );
  }

approvePhase(pid: number, userId: number): Observable<void> {
  return this.http.post<void>(
    `${this.base}/${pid}/progress/approve`,
    null,
    { params: new HttpParams().set('userId', userId.toString()) }
  );
}

rejectPhase(pid: number, userId: number): Observable<void> {
  return this.http.post<void>(
    `${this.base}/${pid}/progress/reject`,
    null,
    { params: new HttpParams().set('userId', userId.toString()) }
  );
}

}
