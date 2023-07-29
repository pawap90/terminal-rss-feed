import { Cache } from "file-system-cache";

type CacheRecord<T> = {
    data: T;
    expiration?: Date;
};

type CacheResult<T> =
    | { success: true; record: CacheRecord<T> }
    | { success: false; expired: boolean; notFound: boolean };

export class CacheService {
    private cacheInstance = new Cache();

    /**
     * Retrieves data from the cache.
     * @param key The key to retrieve the data for.
     * @returns A CacheResult object.
     */
    async get<T>(key: string): Promise<CacheResult<T>> {
        const value = await this.cacheInstance.get(key);

        if (!value) return { success: false, expired: false, notFound: true };

        const record = value as CacheRecord<T>;

        if(!record.expiration) return { success: true, record };

        if (record.expiration && new Date(record.expiration).getTime() > Date.now()) {
            return { success: true, record };
        }

        return { success: false, expired: true, notFound: false };
    }

    /**
     * Stores data in the cache indefinitely.
     * @param key The key to store the data under.
     * @param data The data to store.
     */
    async set<T>(key: string, data: T): Promise<void>;

    /**
     * Stores data in cache for a specified number of seconds.
     * @param key The key to store the data under.
     * @param data The data to store.
     * @param expireIn The number of seconds to store the data for.
     */
    async set<T>(key: string, data: T, expireIn: number): Promise<void>;

    /**
     * Stores data in cache until a specified date.
     * @param key The key to store the data under.
     * @param data The data to store.
     * @param expiration The expiration date of the data.
     */
    async set<T>(key: string, data: T, expiration?: Date): Promise<void>;
    async set<T>(key: string, data: T, expiration?: unknown): Promise<void> {
        const record: CacheRecord<T> = { data };

        if (typeof expiration === 'number') {
            const expireDate = new Date();
            expireDate.setSeconds(expireDate.getSeconds() + expiration);
            record.expiration = expireDate;
        } else if (expiration instanceof Date) {
            record.expiration = expiration;
        }

        await this.cacheInstance.set(key, record);
    }

    /** Removes all records */
    async clean(): Promise<void> {
        await this.cacheInstance.clear();
    }
}