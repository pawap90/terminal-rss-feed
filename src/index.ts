import { getFeed } from "./rss.service.js";


const rssUrl = 'https://blog.paulasantamaria.com/rss.xml'; // Hashnode
//const rssUrl = 'https://dev.to/feed/paulasantamaria'; // Dev.to

const feed = await getFeed(rssUrl);

for (const entry of feed.entries) {
    console.log(entry.title);
    console.log(entry.url);
    console.log(entry.date);
    console.log(entry.creator);
    console.log(entry.categories);
    console.log('-------------------');
}