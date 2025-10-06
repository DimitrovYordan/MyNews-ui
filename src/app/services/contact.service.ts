import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";

import { ContactMessage } from "../interfaces/contact-message";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    constructor(private http: HttpClient) { }

    sendMessage(msg: ContactMessage): Observable<any> {
        return this.http.post(`${environment.apiUrl}/contact`, msg);
    }
}