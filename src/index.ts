import { getFeed } from "./rss.service.js";
import { printEntryList } from "./ui/entry-list.ui.js";


//const rssUrl = 'https://blog.paulasantamaria.com/rss.xml'; // Hashnode
const rssUrl = 'https://dev.to/feed/paulasantamaria'; // Dev.to

const feed = await getFeed(rssUrl);

console.log(printEntryList(feed.entries));