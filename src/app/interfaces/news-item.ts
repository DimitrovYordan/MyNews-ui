import { NewsTranslation } from "./news-translation";

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    link: string;
    publishedAt: string;
    sectionId: number;
    sectionName?: string;
    sourceUrl: string;
    sourceName?: string;
    isNew: boolean;
    isRead?: boolean;
    translations?: NewsTranslation[];
}