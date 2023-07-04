import Parser from "rss-parser";

export type Feed = {
    title?: string;
    url: string;
    entries: Entry[];
}

export type Entry = Partial<{
    title: string;
    creator: string;
    categories: string[];
    date: Date;
    url: string;
    description: string;
}>

const parser: Parser = new Parser();

export async function getFeed(url: string): Promise<Feed> {
    const feed = await parser.parseURL(url);
    return {
        title: feed.title,
        url: url,
        entries: feed.items.map(item => {
            return {
                title: item.title,
                creator: item.creator,
                categories: item.categories,
                date: item.isoDate ? new Date(item.isoDate) : undefined,
                url: item.link,
                description: item.content
            }
        })
    };
}