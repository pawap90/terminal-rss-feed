import { getFeedMetadata } from './rss.service.js';
import { CacheService } from './cache.service.js';

export type UserFeed = {
    id: number;
    url: string;
    title: string;
    color?: string;
};

const cacheService = new CacheService();

const CACHE_KEY = 'user-feeds';

export async function getUserFeeds() {
    const cacheResult = await cacheService.get<UserFeed[]>(CACHE_KEY);
    return cacheResult.success ? cacheResult.record.data : [];
}

export async function saveUserFeed(url: string, title?: string, color?: string): Promise<void> {
    if (title == undefined) {
        const metadata = await getFeedMetadata(url);
        title = metadata.title ?? 'TITLE NOT FOUND';
    }

    const feeds = await getUserFeeds();

    feeds.push({ id: feeds.length + 1, url, title, color });

    await cacheService.set(CACHE_KEY, feeds);
}

export async function removeUserFeed(id: number) {
    const feeds = await getUserFeeds();

    const updatedFeeds = feeds.filter((feed) => feed.id != id);

    await cacheService.set(CACHE_KEY, updatedFeeds);
}
