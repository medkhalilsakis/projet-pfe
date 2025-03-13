import { HttpClient, HttpEvent, HttpParams, HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  /**
   * Upload du projet.
   * @param files Tableau de fichiers à uploader.
   * @param decompress Indique si le fichier doit être décompressé (pour ZIP/RAR).
   * @returns Observable des événements HTTP (pour le suivi de la progression).
   */
  uploadProject(files: File[], decompress: boolean): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const params = new HttpParams().set('decompress', decompress.toString());
    return this.http.post<any>(`${this.baseUrl}/upload`, formData, {
      params,
      reportProgress: true,
      observe: 'events'
    });
  }

  /**
   * Commit final du projet.
   */
  commitProject(): Observable<any> {
    return this.http.post(`${this.baseUrl}/commit`, {});
  }

  /**
   * Récupère la liste des projets (optionnel).
   */
  getProjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }
}
