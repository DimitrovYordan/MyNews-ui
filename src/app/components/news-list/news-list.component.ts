import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkAccordionModule } from "@angular/cdk/accordion";

import { NewsService } from "../../services/news.service";
import { UserNewsService } from "../../services/user-news.service";
import { UserSectionService } from "../../services/user-section.service";
import { SectionService } from "../../services/section.service";
import { NewsItem } from "../../interfaces/news-item";
import { SectionWithNews } from "../../interfaces/section-with-news";
import { GroupedNews } from "../../interfaces/grouped-news";
import { SectionsNamesUtilsService } from "../../shared/sections-names-utils.service";
import { LanguageService } from "../../services/language.service";

@Component({
    selector: 'app-news-list',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule, CdkAccordionModule],
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss'],
})
export class NewsListComponent implements OnInit {
    public sectionsWithNews: (SectionWithNews & { groupedNews: GroupedNews[] })[] = [];
    public news: NewsItem[] = [];
    public selectedSections: number[] = [];
    public errorMessage: string = '';
    public searchTerm: string = '';
    public isLoading: boolean = false;

    constructor(
        private newsService: NewsService,
        private userNewsService: UserNewsService,
        private userSectionService: UserSectionService,
        private sectionService: SectionService,
        public sectionName: SectionsNamesUtilsService,
        private languageService: LanguageService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.isLoading = true;
        this.userSectionService.getUserSections().subscribe(userSections => {
            this.selectedSections = userSections;

            if (this.selectedSections.length === 0) {
                this.errorMessage = 'No sections selected. Please select sections first.';
                this.isLoading = false;
                return;
            }

            this.fetchNews();
        });
    }

    goBack() {
        this.router.navigate(['/sections']);
    }

    dropSection(event: CdkDragDrop<any[]>) {
        moveItemInArray(this.sectionsWithNews, event.previousIndex, event.currentIndex);
    }

    toggleSource(sectionId: number, source: GroupedNews) {
        const isCurrentlyOpen = source.isOpen;

        this.sectionsWithNews.forEach((section) => {
            section.groupedNews.forEach((s) => {
                if (s.openItemId) {
                    const openItem = [...s.unread, ...s.read].find(x => x.id === s.openItemId);
                    if (openItem && !openItem.isRead) {
                        openItem.isRead = true;
                        s.unread = s.unread.filter(x => x.id !== openItem.id);
                        s.read = [openItem, ...s.read];

                        this.userNewsService.markAsRead(openItem.id).subscribe();
                    }
                    s.openItemId = null;
                }
                s.isOpen = false;
            });
        });

        if (!isCurrentlyOpen) {
            source.isOpen = true;
        }
    }

    toggleNewsItem(source: GroupedNews, item: NewsItem) {
        if (source.openItemId === item.id) {
            if (!item.isRead) {
                item.isRead = true;
                source.unread = source.unread.filter(x => x.id !== item.id);
                source.read = [item, ...source.read];

                this.userNewsService.markAsRead(item.id).subscribe();
            }

            source.openItemId = null;
            return;
        }

        if (source.openItemId) {
            const prevItem = [...source.unread, ...source.read].find(x => x.id === source.openItemId);
            if (prevItem && !prevItem.isRead) {
                prevItem.isRead = true;
                source.unread = source.unread.filter(x => x.id !== prevItem.id);
                source.read = [prevItem, ...source.read];

                this.userNewsService.markAsRead(prevItem.id).subscribe();
            }
        }

        source.openItemId = item.id;
    }

    onArticleLinkClick(event: MouseEvent, item: NewsItem) {
        event.preventDefault();

        if (!item.isRead) {
            item.isRead = true;
            const source = this.findSourceByItem(item);
            if (source) {
                source.unread = source.unread.filter(x => x.id !== item.id);
                source.read = [item, ...source.read];
            }
            this.userNewsService.markAsRead(item.id).subscribe({
                next: () => this.userNewsService.markLinkClicked(item.id).subscribe()
            });
        } else {
            this.userNewsService.markLinkClicked(item.id).subscribe();
        }

        window.open(item.link, '_blank');
    }

    onLanguageChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        if (select) {
            this.languageService.setLanguage(select.value);
        }
    }

    getTitle(news: NewsItem): string {
        const lang = this.languageService.getLanguage();
        const translation = news.translations?.find(t => t.languageCode === lang);

        return translation?.title || news.title;
    }

    getSummary(news: NewsItem): string {
        const lang = this.languageService.getLanguage();
        const translation = news.translations?.find(t => t.languageCode === lang);

        return translation?.summary || news.summary;
    }

    getFilteredItems(source: GroupedNews): { unread: NewsItem[], read: NewsItem[], count: number } {
        if (!this.searchTerm.trim()) {
            return { unread: source.unread, read: source.read, count: source.unread.length };
        }

        const lower = this.searchTerm.toLowerCase();
        const unread = source.unread.filter(item =>
            item.title.toLowerCase().includes(lower) ||
            item.summary.toLowerCase().includes(lower)
        );
        const read = source.read.filter(item =>
            item.title.toLowerCase().includes(lower) ||
            item.summary.toLowerCase().includes(lower)
        );

        const count = unread.length + read.length;

        return { unread, read, count };
    }

    private findSourceByItem(item: NewsItem): GroupedNews | undefined {
        for (const section of this.sectionsWithNews) {
            for (const source of section.groupedNews) {
                if ([...source.unread, ...source.read].some(x => x.id === item.id)) {
                    return source;
                }
            }
        }
        return undefined;
    }

    private fetchNews(): void {
        this.isLoading = true;

        this.newsService.getNewsBySections(this.selectedSections).subscribe({
            next: (data: SectionWithNews[]) => {
                const selectedMap = new Map<number, SectionWithNews>();
                data.forEach(section => selectedMap.set(section.sectionId, section));

                this.sectionsWithNews = this.selectedSections.map(sectionId => {
                    const sectionData = selectedMap.get(sectionId);
                    if (sectionData) {
                        const groupedMap = sectionData.news.reduce((acc, item) => {
                            if (!acc[item.sourceUrl]) acc[item.sourceUrl] = [];
                            acc[item.sourceUrl].push(item);
                            return acc;
                        }, {} as Record<string, NewsItem[]>);

                        const groupedNews: GroupedNews[] = Object.entries(groupedMap).map(([key, items]) => {
                            const unread = items.filter(i => !i.isRead);
                            const read = items.filter(i => i.isRead);
                            return { key, unread, read, isOpen: false, openItemId: null };
                        });

                        return { ...sectionData, groupedNews };
                    } else {
                        const sectionFromAll = this.sectionService.allSections?.find(s => s.id === sectionId);
                        const sectionNameFormatted = sectionFromAll
                            ? this.sectionName.formatSectionName(sectionFromAll.name)
                            : 'Unknown Section';

                        return {
                            sectionId,
                            sectionName: sectionNameFormatted,
                            news: [],
                            groupedNews: []
                        } as SectionWithNews & { groupedNews: GroupedNews[] };
                    }
                });

                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Failed to load news.';
                this.isLoading = false;
            }
        });
    }
}