import Parser from "rss-parser";

type Feed = {
    title?: string;
    url: string;
    entries: Entry[];
}

type Entry = Partial<{
    title: string;
    creator: string;
    categories: string[];
    date: Date;
    url: string;
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
                url: item.link
            }
        })
    };
}