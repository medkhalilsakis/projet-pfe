// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface User {
  id?: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password?: string;
  dateEmbauche: string;
  salaire: number;
  role_id: number;
  ncin: string;
  genre: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  // Récupérer tous les utilisateurs depuis /api/users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  // Optionnel : Méthode de recherche (filtrage côté client)
  searchUsers(searchText: string): Observable<User[]> {
    return this.getAllUsers();
  }

  /** Vérifie si le username existe déjà */
  checkUsername(username: string): Observable<boolean> {
    if (!username) return of(false);
    return this.http.get(`${this.base}/username/${username}`, { observe: 'response' })
      .pipe(
        map((res: HttpResponse<any>) => res.status === 200),
        catchError(err => err.status === 404
          ? of(false)
          : throwError(() => err)
        )
      );
  }

  /** Crée un nouvel utilisateur */
  createUser(data: User): Observable<User> {
    return this.http.post<User>(`${this.base}/signup`, data);
  }
}
