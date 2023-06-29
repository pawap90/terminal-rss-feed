import type { Entry } from '../rss.service.js';
import { getBorderCharacters, table } from 'table';

let selectedIndex = 0;

export function printEntryList(entries: Entry[]) {
    const tableData = [];

    for (let i = 0; i < entries.length; i++) 
        tableData.push([selectedIndex == i ? '>': ' ', entryToString(entries[i])]);

    return table(tableData, {
        border: getBorderCharacters('norc'),
        header: { content: 'FEED ENTRIES' },
        drawHorizontalLine: () => true,
        drawVerticalLine: () => false,
    });
}

function entryToString(entry: Entry): string {
    let entryRow = `${entry.title?.toUpperCase() ?? 'TITLE NOT FOUND'}\n`;
    if (entry.date) entryRow += `${entry.date.toLocaleDateString()} | `;
    if (entry.creator) entryRow += `${entry.creator}\n`;
    if (entry.categories) entryRow += `${entry.categories}\n`;
    if (entry.url) entryRow += `${entry.url.slice(0, 48)}${entry.url.length > 48 ? '...' : ''}\n`;

    return entryRow;
}
