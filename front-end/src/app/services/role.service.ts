// src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role { id: number; libelle: string; }

@Injectable({ providedIn: 'root' })
export class RoleService {
  private base = 'http://localhost:8080/api/roles';
  constructor(private http: HttpClient) {}
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.base);
  }
}
