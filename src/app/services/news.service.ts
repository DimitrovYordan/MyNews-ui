import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { NewsItem } from "../interfaces/news-item";
import { SectionWithNews } from "../interfaces/section-with-news";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    constructor(private http: HttpClient) { }

    getAllNews(): Observable<NewsItem[]> {
        return this.http.get<NewsItem[]>(`${environment.apiUrl}/news`);
    }

    getNewsBySections(sectionIds: number[]): Observable<SectionWithNews[]> {
        return this.http.post<SectionWithNews[]>(`${environment.apiUrl}/news/by-sections`, sectionIds, {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}