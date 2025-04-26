// src/app/services/profile-image.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileImageService {
  private imageUrlSubject = new BehaviorSubject<string|null>(null);
  readonly imageUrl$ = this.imageUrlSubject.asObservable();

  /** Met à jour l’URL de l’avatar */
  setImageUrl(url: string|null) {
    this.imageUrlSubject.next(url);
  }
}
