import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private readonly SECRET_KEY = '99bdf79dd2d6308bcc9e858c0b0a512f9357367ebcbb18d9aa14c9d1da80516a';
  private readonly USER_KEY = 'auth-user';
  private readonly SESSION_TIMEOUT = 3600; // en secondes

  // Méthode pour mettre à jour ou sauvegarder l'utilisateur dans le session storage.
  setUser(user: any): void {
    user.loginTime = Math.floor(Date.now() / 1000);
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(user), this.SECRET_KEY).toString();
    sessionStorage.setItem(this.USER_KEY, encryptedData);
  }

  getUser(): any {
    const encryptedData = sessionStorage.getItem(this.USER_KEY);
    if (!encryptedData) return null;

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (e) {
      this.clearStorage();
      return null;
    }
  }

  isSessionExpired(): boolean {
    const user = this.getUser();
    if (!user?.loginTime) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return (currentTime - user.loginTime) > this.SESSION_TIMEOUT;
  }

  clearStorage(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }

  // Sauvegarde l'ID du projet courant dans l'objet utilisateur stocké en session
  saveCurrentProject(projectId: any): void {
    const user = this.getUser();
    if (user) {
      user.currentProjectId = projectId;
      this.setUser(user);
    }
  }

  // Récupère l'ID du projet courant depuis l'objet utilisateur stocké en session
  getCurrentProject(): any {
    const user = this.getUser();
    return user ? user.currentProjectId : null;
  }
}
