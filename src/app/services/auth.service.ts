import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { BehaviorSubject, catchError, Observable, tap } from "rxjs";

import { AuthRequest } from "../interfaces/auth-request";
import { SignupData } from "../interfaces/signup";
import { AuthResponse } from "../interfaces/auth-response";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey: string = 'auth_token';
    private userKey: string = 'user';
    private currentUser: AuthResponse | null = null;
    private selectedSectionsKey = 'selected_sections';

    public showLogin$ = new BehaviorSubject<boolean>(false);
    public showSignup$ = new BehaviorSubject<boolean>(false);
    public isLoggedIn$ = new BehaviorSubject<boolean>(false);
    public isMenuOpen$ = new BehaviorSubject<boolean>(false);
    public hasSelectedSections$ = new BehaviorSubject<boolean>(false);
    public currentUser$ = new BehaviorSubject<AuthResponse | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        const userData = sessionStorage.getItem(this.userKey);
        const token = sessionStorage.getItem(this.tokenKey);
        if (userData && token && !this.isTokenExpired(token)) {
            this.currentUser = JSON.parse(userData);
            this.currentUser$.next(this.currentUser);
            this.isLoggedIn$.next(true);
        } else {
            this.logout();
        }
    }

    login(credentials: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            tap(res => {
                this.setSession(res);
            })
        );
    }

    signup(credentials: SignupData): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, credentials).pipe(
            tap(res => {
                this.setSession(res);
            })
        );
    }

    logout() {
        sessionStorage.removeItem(this.tokenKey);
        sessionStorage.removeItem(this.userKey);
        this.currentUser = null;
        this.currentUser$.next(null);
        this.isLoggedIn$.next(false);
        this.router.navigate(['/'], { replaceUrl: true });
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
    }

    resetPassword(data: { token: string; newPassword: string; }) {
        return this.http.post(`${environment.apiUrl}/auth/reset-password`, data).pipe(
            tap(),
            catchError(err => {
                throw err;
            })
        );
    }

    getToken(): string | null {
        return sessionStorage.getItem(this.tokenKey);
    }

    getCurrentUser(): AuthResponse | null {
        if (!this.currentUser) {
            const userData = sessionStorage.getItem(this.userKey);
            if (userData) {
                this.currentUser = JSON.parse(userData);
                this.currentUser$.next(this.currentUser);
            }
        }

        return this.currentUser;
    }

    getUserInitials(): string | null {
        const user = this.getCurrentUser();
        if (!user) {
            return null;
        }

        const firstName = user.firstName?.charAt(0).toUpperCase() || '';
        const lastName = user.lastName?.charAt(0).toUpperCase() || '';

        return `${firstName}${lastName}` || null;
    }

    getSelectedSections(): number[] {
        const stored = sessionStorage.getItem(this.selectedSectionsKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return [];
            }
        }

        return [];
    }

    toggleMenu() {
        this.isMenuOpen$.next(!this.isMenuOpen$.value);
    }

    closeMenu() {
        this.isMenuOpen$.next(false);
    }

    openLogin() {
        this.showLogin$.next(true);
        this.showSignup$.next(false);
    }

    openSignup() {
        this.showSignup$.next(true);
        this.showLogin$.next(false);
    }

    closeForms() {
        this.showLogin$.next(false);
        this.showSignup$.next(false);
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        return !this.isTokenExpired(token);
    }

    setCurrentUser(user: AuthResponse | null) {
        if (!user) {
            this.currentUser = null;
            this.currentUser$.next(null);
            sessionStorage.removeItem(this.tokenKey);
            return;
        }

        this.currentUser = user;
        this.currentUser$.next(this.currentUser);
        sessionStorage.setItem(this.userKey, JSON.stringify(user));
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000;

            return Date.now() > exp;
        } catch {
            return true;
        }
    }

    private setSession(user: AuthResponse) {
        sessionStorage.setItem(this.tokenKey, user.token);
        sessionStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser = user;
        this.isLoggedIn$.next(true);
        this.currentUser$.next(user);
    }
}