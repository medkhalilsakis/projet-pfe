// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PresenceService, PresenceUpdate } from './presence.service';
import { User } from '../models/user.model';
import { PauseRequestService } from './pause-request.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private base = 'http://localhost:8080/api/users';
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient, private presenceService: PresenceService) {
    this.loadUsers();
    this.presenceService.presence$.subscribe(update => {
      if (update) {
        this.updateUserPresence(update);
      }
    });
  }

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

  private loadUsers() {
    this.http.get<User[]>(this.base).pipe(
      map(users => users.map(u => ({
        ...u,
        avatarUrl: `${this.base}/${u.id}/profile-image/raw`,
        online: u.online,
        lastSeen: u.lastSeen ? new Date(u.lastSeen) : undefined
      })))
    ).subscribe(users => {
      this.usersSubject.next(users);
    });
  }

  private updateUserPresence(update: any) {
    const users = this.usersSubject.getValue();
    const userIndex = users.findIndex(u => u.id === update.userId);
    if (userIndex >= 0) {
      const updatedUsers = [...users];
      updatedUsers[userIndex] = {
        ...updatedUsers[userIndex],
        online: update.online,
        lastSeen: update.lastSeen ? new Date(update.lastSeen) : undefined
      };
      this.usersSubject.next(updatedUsers);
    }
  }
  

  getUsersByRole(roleId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/role/${roleId}`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

}


