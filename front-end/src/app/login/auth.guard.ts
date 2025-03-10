// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStorageService } from '../services/session-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const sessionService = inject(SessionStorageService);
  const router = inject(Router);
  
  const user = sessionService.getUser();
  if (!user || sessionService.isSessionExpired()) {
    sessionService.clearStorage();
    return router.parseUrl('/login');
  }
  
  const requiredRole = route.data['role'];
  if (requiredRole && user.role_id !== requiredRole) {
    return router.parseUrl('/unauthorized');
  }
  
  return true;
};