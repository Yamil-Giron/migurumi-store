import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../servicios/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return next(req);

  const token = auth.getToken();

  const esRutaAuth = req.url.includes('/auth/login') || req.url.includes('/auth/registro');
  const esCloudinary = req.url.startsWith('https://api.cloudinary.com') || 
                       req.url.startsWith('https://upload-widget.cloudinary.com');

  if (token && !esRutaAuth && !esCloudinary) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};