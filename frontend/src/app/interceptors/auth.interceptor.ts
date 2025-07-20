import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (request, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Get the token from the auth service
    const token = authService.getToken();

    // Clone the request and add the authorization header if token exists
    if (token) {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // Handle the request and catch any errors
    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            // If we get a 401 Unauthorized response, clear the token and redirect to login
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        })
    );
};
