import { Pipe, PipeTransform } from "@angular/core";

import { NewsItem } from "../interfaces/news-item";
import { GroupedNews } from "../interfaces/grouped-news";
import { SectionsNamesUtilsService } from "./sections-names-utils.service";

@Pipe({
    name: 'groupBy',
    standalone: true
})
export class GroupByPipe implements PipeTransform {

    constructor(private sectionNameService: SectionsNamesUtilsService) { }

    transform(items: NewsItem[] = [], field: keyof NewsItem): GroupedNews[] {
        const map = new Map<string, NewsItem[]>();

        items.forEach(item => {
            const raw = (item[field] ?? '') as unknown as string;
            const key = this.sectionNameService.getDomain(raw);

            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(item);
        });

        return Array.from(map.entries()).map(([key, groupItems]) => {
            const unread = groupItems.filter(i => !i.isRead);
            const read = groupItems.filter(i => i.isRead);

            return {
                key,
                unread,
                read,
                isOpen: false,
                openItemId: null
            } as GroupedNews;
        });
    }
}
