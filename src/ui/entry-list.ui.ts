import { Controller } from '../controller.js';
import { getFeed, type Entry } from '../services/rss.service.js';
import { getBorderCharacters, table } from 'table';
import { EntryReadUI } from './entry-read.ui.js';
import { color } from './color.js';

export class EntryListUI {
    private entries: Entry[] = [];
    private selectedIndex = 0;
    private currentPage = 0;

    private totalPages = 0;
    private entriesPerPage = 0;
    private screenSize = { columns: 0, rows: 0 };

    private readonly entryRowHeight = 7;
    private readonly entryTableHeaderHeight = 3;
    private readonly entryTableFooterHeight = 3;
    private readonly controller = new Controller();

    constructor() {
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows };
    }

    async load(): Promise<void> {
        // TODO: RSS CRUDL
        //const rssUrl = 'https://blog.paulasantamaria.com/rss.xml'; // Hashnode
        const rssUrl = 'https://dev.to/feed/paulasantamaria'; // Dev.to
        this.entries = (await getFeed(rssUrl)).entries;

        this.entriesPerPage = Math.floor(
            (this.screenSize.rows - (this.entryTableHeaderHeight + this.entryTableFooterHeight)) /
                this.entryRowHeight
        );
        this.totalPages = Math.ceil(this.entries.length / this.entriesPerPage);

        this.controller
            .on('up', () => {
                this.move('up');
            })
            .on('down', () => {
                this.move('down');
            })
            .on('return', () => {
                this.controller.clear(); // Clear commands so the entry UI can add its own.
                new EntryReadUI(this.entries[this.selectedIndex * this.currentPage]).load();
            })
            .build();

        console.clear();
        this.print();
    }

    private print() {
        console.clear();
        process.stdout.cursorTo(0, 0);

        const tableData = [];
        const startIndex = this.currentPage * this.entriesPerPage;
        const currentPageEntries = this.entries.slice(startIndex, startIndex + this.entriesPerPage);

        for (let i = 0; i < currentPageEntries.length; i++)
            tableData.push([
                this.selectedIndex == i ? '\n>' : ' ',
                this.entryToString(currentPageEntries[i])
            ]);

        console.clear();
        console.log(
            table(tableData, {
                border: getBorderCharacters('norc'),
                header: { content: color.pink.inverse(' MY FEED ') },
                drawHorizontalLine: () => true,
                drawVerticalLine: () => false
            })
        );
        this.printFooter();
        console.log('\u001B[?25l'); // Hide cursor.
    }

    private entryToString(entry: Entry): string {
        let entryRow =
            color.yellow(this.sliceTextToFit(entry.title?.toUpperCase() ?? 'TITLE NOT FOUND')) +
            '\n\n';
        entryRow += color.pink(this.sliceTextToFit(this.formatDate(entry.date))) + ' | ';
        entryRow += color.pink.italic(this.sliceTextToFit(entry.creator ?? '')) + '\n';
        entryRow += color.green(this.sliceTextToFit(entry.categories?.join(', ') ?? ''));

        return `\n${entryRow}\n`;
    }

    private printFooter() {
        let footer = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        footer += ` | ${this.entries.length} entries`;

        console.log(footer);
    }

    private sliceTextToFit(text: string) {
        if (text.length < this.screenSize.columns - 4) return text;

        return text.slice(0, this.screenSize.columns - 8) + '...';
    }

    private move(direction: 'up' | 'down') {
        if (direction == 'up') {
            this.selectedIndex--;
            if (this.selectedIndex < 0 && this.currentPage > 0) {
                this.currentPage--;
                this.selectedIndex = this.entriesPerPage - 1;
            }
        } else {
            this.selectedIndex++;
            if (this.selectedIndex >= this.entriesPerPage && this.currentPage < this.totalPages) {
                this.selectedIndex = 0;
                this.currentPage++;
            }
        }

        this.print();
    }

    private formatDate(date?: Date): string {
        return date ? new Date(date).toLocaleDateString() : '';
    }
}
