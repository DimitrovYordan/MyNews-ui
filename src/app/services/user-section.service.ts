import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserSectionService {
    constructor(private http: HttpClient) { }

    getUserSections(): Observable<number[]> {
        return this.http.get<number[]>(`${environment.apiUrl}/userpreferences/sections`);
    }

    saveUserSections(sectionIds: number[]): Observable<void> {
        return this.http.post<void>(`${environment.apiUrl}/userpreferences/sections`, sectionIds);
    }
}