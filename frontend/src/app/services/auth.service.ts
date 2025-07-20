import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly API_URL = 'http://localhost:3000/api/auth';
    private readonly TOKEN_KEY = 'auth_token';

    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(private http: HttpClient) {}

    /**
     * User signup
     */
    signup(signupData: SignupRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.API_URL}/register`, signupData, {
                headers: this.getHttpHeaders()
            })
            .pipe(
                // Note: Register API doesn't return token, only user data
                catchError(this.handleError)
            );
    }

    /**
     * User login
     */
    login(loginData: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.API_URL}/login`, loginData, {
                headers: this.getHttpHeaders()
            })
            .pipe(
                tap((response) => {
                    if (response.token) {
                        this.setToken(response.token);
                    }
                }),
                catchError(this.handleError)
            );
    }

    /**
     * Logout user
     */
    logout(): void {
        this.clearToken();
    }

    /**
     * Check if token exists in localStorage
     */
    hasToken(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get authentication token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Set authentication token
     */
    private setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        this.isAuthenticatedSubject.next(true);
    }

    /**
     * Clear authentication token
     */
    private clearToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.isAuthenticatedSubject.next(false);
    }

    /**
     * Get HTTP headers for requests
     */
    private getHttpHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json'
        });
    }

    /**
     * Get authenticated HTTP headers
     */
    getAuthenticatedHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Handle HTTP errors
     */
    private handleError = (error: any): Observable<never> => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.status === 401) {
                errorMessage = 'Invalid credentials';
                this.clearToken();
            } else if (error.status === 400) {
                errorMessage = error.error?.message || 'Bad request';
            } else if (error.status === 500) {
                errorMessage = 'Server error. Please try again later.';
            } else {
                errorMessage = error.error?.message || `Error Code: ${error.status}`;
            }
        }

        console.error('Auth Service Error:', error);
        return throwError(() => errorMessage);
    };
}
