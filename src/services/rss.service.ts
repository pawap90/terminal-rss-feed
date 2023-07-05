import Parser from 'rss-parser';
import { CacheService } from './cache.service.js';

export type Feed = {
    title?: string;
    url: string;
    entries: Entry[];
};

export type Entry = Partial<{
    title: string;
    creator: string;
    categories: string[];
    date: Date;
    url: string;
    content: string;
}>;

const parser: Parser = new Parser();

const cacheService = new CacheService();
const CACHE_KEY = 'feed';

export async function getFeed(url: string): Promise<Feed> {

    const cacheResult = await cacheService.get<Feed>(CACHE_KEY);

    if (cacheResult.success) 
        return cacheResult.record.data;

    const feedResult = await parser.parseURL(url);
    const feed = {
        title: feedResult.title,
        url: url,
        entries: feedResult.items.map((item) => {
            return {
                title: item.title,
                creator: item.creator,
                categories: item.categories,
                date: item.isoDate ? new Date(item.isoDate) : undefined,
                url: item.link,
                content: item.content
            };
        })
    };

    await cacheService.set(CACHE_KEY, feed);

    return feed;
}
