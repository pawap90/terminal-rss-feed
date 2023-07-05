import { Controller } from '../controller.js';
import { Entry } from '../services/rss.service.js';
import { EntryListUI } from './entry-list.ui.js';
import { color } from './color.js';
import { getBorderCharacters, table } from 'table';

import cliHtml from 'cli-html';

export class EntryReadUI {
    private readonly controller = new Controller();
    private readonly entry: Entry;
    private readonly screenSize = { columns: 0, rows: 0 };

    constructor(entry: Entry) {
        this.entry = entry;
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows };
    }

    async load() {
        this.controller
            .on('backspace', async () => {
                this.controller.clear(); // Clear commands so the entry UI can add its own.
                await new EntryListUI().load();
            })
            .build();

        console.clear();
        this.print();

        // Show cursor
        process.stdout.write('\x1B[?25h');
    }

    private print() {
        console.clear();
        process.stdout.cursorTo(0, 0);

        // Header
        //let header = color.yellow(this.entry.title?.toUpperCase() ?? 'TITLE NOT FOUND') + '\n\n';
        let header = '\n' + color.pink(this.formatDate(this.entry.date)) + ' | ';
        header += color.pink.italic(this.entry.creator ?? '') + '\n';
        header += color.green(this.sliceTextToFit(this.entry.categories?.join(', ') ?? '')) + '\n';
        header += color.yellow(this.sliceTextToFit(this.entry.url ?? '')) + '\n';

        const tabledata = [[header]];

        console.log(
            table(tabledata, {
                border: getBorderCharacters('norc'),
                header: {
                    content: color.pink.inverse(
                        ` ${this.entry.title?.toUpperCase()} ` ?? ' TITLE NOT FOUND '
                    )
                },
                drawHorizontalLine: () => true,
                drawVerticalLine: () => false
            })
        );

        // console.log(header + '\n');

        if (this.entry.content) console.log(cliHtml(this.entry.content));
        else console.log('No content found for this entry.');
    }

    private sliceTextToFit(text: string) {
        if (text.length < this.screenSize.columns - 2) return text;

        return text.slice(0, this.screenSize.columns - 5) + '...';
    }

    private formatDate(date?: Date): string {
        return date ? new Date(date).toLocaleDateString() : '';
    }
}
