import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

import { LoadingService } from '../../services/loading.service';
import { GlobeService } from '../../services/globe.service';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements AfterViewInit {
    @ViewChild('globeCanvas') globeCanvas!: ElementRef<HTMLDivElement>;

    constructor(private loadingService: LoadingService,
                private globeService: GlobeService) { }

    async ngAfterViewInit() {
        if (!this.globeCanvas) {
            return;
        }

        await this.globeService.initScene(this.globeCanvas.nativeElement);
    }

    get isLoading() {
        return this.loadingService.isLoading();
    }
}
