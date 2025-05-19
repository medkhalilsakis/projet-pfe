// src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileNode } from '../models/file-node.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  getStats(id: number) {
    throw new Error('Method not implemented.');
  }
  getPauseRequests(id: number) {
    throw new Error('Method not implemented.');
  }
  getTesters(id: number) {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'http://localhost:8080/api/projects';

  constructor(private http: HttpClient) {}

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
    return this.http.post(
      `${this.baseUrl}/commit?projectId=${projectId}`,
      payload
    );
  }
  ModifyProject(
    userId:number,
    projectId: number,
    payload: {
      name: string;
      type: string;
      description?: string;
      visibilite: string;
      status: string;
    }
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/modify/${userId}?projectId=${projectId}`,
      payload
    );
  }

  getAllProjects(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getProjectsByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`);
  }

  getProjectById(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${projectId}`);
  }

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

  getFilesTree(projectId: number): Observable<FileNode[]> {
    return this.http.get<FileNode[]>(
      `${this.baseUrl}/${projectId}/files/tree`
    );
  }

  readFile(
    projectId: number,
    fileId: number
  ): Observable<string> {
    return this.http.get(
      `${this.baseUrl}/${projectId}/files/${fileId}/content`,
      { responseType: 'text' }
    );
  }

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

  deleteFile(
    projectId: number,
    fileId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${projectId}/files/${fileId}`,
      { responseType: 'text' as 'json' }
    );
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${projectId}`);
  }

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

  downloadProjectContent(projectId: number): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/${projectId}/files/export`,
      { responseType: 'blob' }
    );
  }

  /**
   * Invitations utilisateurs
   */
  getInvitedUsers(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/${projectId}/invite`
    );
  }

  inviteUser(
    projectId: number,
    userId: number,
    status: string = 'pending'
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/${projectId}/invite`,
      { userId: userId.toString(), status }
    );
  }

  updateProjectStatus(projectId: number,status :number,userId : number):Observable<any>
  {
    return this.http.put(`${this.baseUrl}/${projectId}/status`,{status,userId })
  }

  cancelInvite(
    projectId: number,
    userId: number
  ): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${projectId}/invite/${userId}`,
      { responseType: 'text' as 'json' }
    );
  }

  getLastPause(projectId: number): Observable<{ reason: string }> {
    return this.http.get<{ reason: string }>(
      `${this.baseUrl}/${projectId}/pause`
    );
  }

  getLastClosure(projectId: number): Observable<{ reason: string }> {
    return this.http.get<{ reason: string }>(
      `${this.baseUrl}/${projectId}/closure`
    );
  }
  decideInvitation(
    userId: number,
    status: 'accepted' | 'rejected',
    projectId: number
  ): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${projectId}/invite/${userId}`,
      { status }
    );
  }
  getInvitedProjects(userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/invited/user/${userId}`
  );
}
getAcceptedInvitedProjects(userId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/invited/user/accepted/${userId}`
  );
}
}
