import { BehaviorSubject } from "rxjs";

export class LanguageService {
    private currentLang$ = new BehaviorSubject<string>('EN');

    public language$ = this.currentLang$.asObservable();

    setLanguage(lang: string) {
        this.currentLang$.next(lang.toUpperCase());
    }

    getLanguage(): string {
        return this.currentLang$.getValue();
    }
}