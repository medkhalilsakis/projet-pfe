// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

  /**
   * Upload initial du projet.
   * @param files      Fichiers à uploader
   * @param decompress true pour décompression ZIP
   * @param userId     ID de l'utilisateur uploadant
   */
  uploadProject(
    files: File[],
    decompress: boolean,
    userId: number
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const params = new HttpParams()
      .set('decompress', decompress.toString())
      .set('userId', userId.toString());

    return this.http.post<any>(
      `${this.baseUrl}/upload`,
      formData,
      { params, reportProgress: true, observe: 'events' }
    );
  }

  /**
   * Commit final du projet.
   * @param projectId ID du projet
   * @param payload   Métadonnées de commit
   */
  commitProject(
    projectId: number,
    payload: {
      name: string;
      type: string;
      description?: string;
      visibilite: string;
      status: string;
    }
  ): Observable<any> {
    // Note : l'endpoint attend projectId en query param
    return this.http.post(
      `${this.baseUrl}/commit?projectId=${projectId}`,
      payload
    );
  }

  /**
   * Récupère la liste de tous les projets.
   */
  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  /**
   * Récupère la liste des projets d'un utilisateur.
   * @param userId ID de l'utilisateur
   */
  getProjectsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Liste fichiers/dossiers d’un projet.
   * @param projectId  ID du projet
   * @param parentId   ID du dossier parent (facultatif)
   */
  listFiles(
    projectId: number,
    parentId?: number
  ): Observable<FileNode[]> {
    let params = new HttpParams();
    if (parentId != null) {
      params = params.set('parentId', parentId.toString());
    }
    return this.http.get<FileNode[]>(
      `${this.baseUrl}/${projectId}/files`,
      { params }
    );
  }

  /**
   * Récupère l’arbre complet des fichiers.
   * @param projectId ID du projet
   */
  getFilesTree(projectId: number): Observable<FileNode[]> {
    return this.http.get<FileNode[]>(
      `${this.baseUrl}/${projectId}/files/tree`
    );
  }

  /**
   * Lit le contenu d’un fichier texte.
   * @param projectId ID du projet
   * @param fileId    ID du fichier
   */
  readFile(
    projectId: number,
    fileId: number
  ): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/${projectId}/files/${fileId}/content`,
      { responseType: 'text' }
    );
  }

  /**
   * Met à jour le contenu d’un fichier texte.
   * @param projectId ID du projet
   * @param fileId    ID du fichier
   * @param content   Nouveau contenu
   */
  saveFile(
    projectId: number,
    fileId: number,
    content: string
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${projectId}/files/${fileId}/content`,
      content,
      {
        headers: { 'Content-Type': 'text/plain' },
        responseType: 'text'
      }
    );
  }

  /**
   * Crée un nouveau dossier dans un projet.
   * @param projectId ID du projet
   * @param name      Nom du dossier
   * @param parentId  ID du dossier parent (facultatif)
   */
  createFolder(
    projectId: number,
    name: string,
    parentId?: number
  ): Observable<any> {
    const body: any = { name };
    if (parentId != null) {
      body.parentId = parentId.toString();
    }
    return this.http.post(
      `${this.baseUrl}/${projectId}/files/folder`,
      body
    );
  }

  /**
   * Upload de fichiers dans un dossier existant.
   * @param projectId ID du projet
   * @param files     Fichiers à uploader
   * @param parentId  ID du dossier parent (facultatif)
   */
  uploadFiles(
    projectId: number,
    files: File[],
    parentId?: number
  ): Observable<HttpEvent<any>> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    if (parentId != null) {
      formData.append('parentId', parentId.toString());
    }
    return this.http.post<any>(
      `${this.baseUrl}/${projectId}/files/upload`,
      formData,
      { reportProgress: true, observe: 'events' }
    );
  }

  /**
   * Supprime un fichier du projet.
   * @param projectId ID du projet
   * @param fileId    ID du fichier
   */
  deleteFile(
    projectId: number,
    fileId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${projectId}/files/${fileId}`,
      { responseType: 'text' }
    );
  }

  /**
   * Met à jour la visibilité d’un projet.
   * @param projectId   ID du projet
   * @param userId      ID de l'utilisateur
   * @param visibilite  'public' ou 'privée'
   * @param status      1 ou 0
   */
  updateVisibility(
    projectId: number,
    userId: number,
    visibilite: string,
    status: number
  ): Observable<any> {
    return this.http.put<string>(
      `${this.baseUrl}/${projectId}/visibility`,
      { userId: userId.toString(), visibilite, status: status.toString() },
      { responseType: 'text' as 'json' }
    );
  }

  // Vous pouvez ajouter ici d'autres méthodes (invitation, stats, fermeture, etc.).
}


// src/app/models/file-node.ts
export type ItemType = 'FILE' | 'FOLDER';

export interface FileNode {
  id: number;
  name: string;
  type: ItemType;
  filePath: string;
  children?: FileNode[];
}
