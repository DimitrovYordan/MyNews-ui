import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
    public isLoading = signal(false);

    private loadingCount = 0;

    show() {
        this.loadingCount++;
        this.isLoading.set(true);
    }

    hide() {
        this.loadingCount--;
        if (this.loadingCount <= 0) {
            this.isLoading.set(false);
            this.loadingCount = 0;
        }
    }
}
