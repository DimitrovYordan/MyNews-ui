import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SectionsNamesUtilsService {

    formatSectionName(name: string | null | undefined): string {
        if (!name) {
            return '';
        }

        return name.replace(/_/g, ' ');
    }

    getDomain(url: string): string {
        try {
            const hostname = new URL(url).hostname;

            return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
        } catch {
            return url;
        }
    }
}