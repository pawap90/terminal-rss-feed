import { controller } from '../controller.js';
import { Entry } from '../services/rss.service.js';
import { EntryListUI } from './entry-list.ui.js';
import { color } from './color.js';

import { getBorderCharacters, table } from 'table';
import blessed from 'blessed';
import cliHtml from 'cli-html';
const screen = blessed.screen({
    smartCSR: true,
    fullUnicode: true,
});

export class EntryReadUI {
    private readonly entry: Entry;
    private readonly screenSize = { columns: 0, rows: 0 };

    constructor(entry: Entry) {
        this.entry = entry;
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows };
    }

    async load() {
        controller.on('backspace', async () => {
            controller.clear(); // Clear commands so the entry UI can add its own.
            await new EntryListUI().load();
            screen.children[0].destroy();
        })
        .build(); 

        console.clear();
        this.print();

        // Show cursor
        process.stdout.write('\x1B[?25h');
    }

    print() {
        const header = color.pink.inverse(
            ` ${this.entry.title?.toUpperCase()} ` ?? ' TITLE NOT FOUND '
        );

        let metadata = '\n' + color.pink(this.formatDate(this.entry.date)) + ' | ';
        metadata += color.pink.italic(this.entry.creator ?? '') + '\n';
        metadata +=
            color.green(this.sliceTextToFit(this.entry.categories?.join(', ') ?? '')) + '\n';
        metadata += color.yellow(this.sliceTextToFit(this.entry.url ?? '')) + '\n';

        console.log(
            table([[metadata]], {
                border: getBorderCharacters('norc'),
                header: { content: header, alignment: 'center' },
                drawHorizontalLine: () => true,
                drawVerticalLine: () => false
            })
        );

        // Use blessed for better scrolling.
        const box = blessed.box({
            parent: screen,
            padding: 0,
            left: 'center',
            top: 'top+8',
            width: '100%',
            height: '100%-8'
        });

        const content = blessed.text({
            parent: box,
            content: this.formatContent(),
            top: 2,
            scrollable: true,
            keys: true,
            vi: true,
            alwaysScroll: true,
            scrollbar: {}
        });

        content.focus();
        screen.render();
    }

    private sliceTextToFit(text: string) {
        if (text.length < this.screenSize.columns - 2) return text;

        return text.slice(0, this.screenSize.columns - 9) + '...';
    }

    private formatDate(date?: Date): string {
        return date ? new Date(date).toLocaleDateString() : '';
    }

    private formatContent() {
        if (!this.entry.content) return '';

        return cliHtml(this.entry.content?.replace('\n', ''));
    }
}
