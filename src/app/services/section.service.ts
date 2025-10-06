import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { Section } from "../interfaces/section";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class SectionService {
    allSections: Section[] = [];

    constructor(private http: HttpClient) {
        this.getSections().subscribe(sections => this.allSections = sections);
    }

    getSections(): Observable<Section[]> {
        return this.http.get<Section[]>(`${environment.apiUrl}/sections`);
    }
}