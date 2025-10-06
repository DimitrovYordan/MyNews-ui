import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { AuthResponse } from "../interfaces/auth-response";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) { }

    getProfile(): Observable<AuthResponse> {
        return this.http.get<AuthResponse>(`${environment.apiUrl}/users/me`);
    }

    updateProfile(data: any): Observable<AuthResponse> {
        return this.http.put<AuthResponse>(`${environment.apiUrl}/users/update-profile`, data);
    }

    deleteAccount(): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${environment.apiUrl}/users/delete-profile`);
    }
}