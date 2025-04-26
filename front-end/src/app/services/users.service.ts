import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  username: string;
  email: string;
  // Ajoutez d'autres propriétés au besoin
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  // Récupérer tous les utilisateurs depuis /api/users
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  // Optionnel : Méthode de recherche (filtrage côté client)
  searchUsers(searchText: string): Observable<User[]> {
    return this.getAllUsers();
  }
}
