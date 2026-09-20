import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado() && auth.esAdmin()) {
    return true;
  }

  // Si no es admin, redirigir al login
  router.navigate(['/login']);
  return false;
};