import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class UserNewsService {
    constructor(private http: HttpClient) { }

    markAsRead(newsItemId: string): Observable<void> {
        return this.http.post<void>(`${environment.apiUrl}/news/mark-as-read/${newsItemId}`, {});
    }

    markLinkClicked(newsItemId: string): Observable<void> {
        return this.http.post<void>(`${environment.apiUrl}/news/mark-link-clicked/${newsItemId}`, {});
    }

    getReadNewsIds(): Observable<string[]> {
        return this.http.get<string[]>(`${environment.apiUrl}/news/read-news`);
    }
}