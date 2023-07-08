import { controller } from '../controller.js';
import { Entry } from '../services/rss.service.js';
import { EntryListUI } from './entry-list.ui.js';
import { color, theme } from './color.js';

import { getBorderCharacters, table } from 'table';
import cliHtml from 'cli-html';
import { Scrollable } from './scrollable.js';

export class EntryReadUI {
    private readonly entry: Entry;
    private readonly screenSize = { columns: 0, rows: 0 };
    private scrollableContent?: Scrollable;

    constructor(entry: Entry) {
        this.entry = entry;
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows }; 
    }

    async load() {
        this.scrollableContent = new Scrollable({
            content: this.formatContent(),
            wrapOptions: { trim: true }
        });

        controller
            .on('b', async () => {
                controller.clear(); // Clear commands so the entry UI can add its own.
                await new EntryListUI().load();
            })
            .on('up', () => this.scrollableContent?.scroll(-1).print())
            .on('down', () => this.scrollableContent?.scroll(1).print())
            .on('r', () => this.load());

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

        const headerTable = table([[metadata]], {
            border: getBorderCharacters('norc'),
            columnDefault: { width: this.screenSize.columns - 2 },
            header: { content: header, alignment: 'center' },
            drawHorizontalLine: () => true,
            drawVerticalLine: () => false
        });

        console.log(headerTable);

        const cursorY = headerTable.split('\n').length - 1;
        this.scrollableContent
            ?.setStart({ x: 0, y: cursorY })
            .setContainer({
                width: this.screenSize.columns - 2,
                height: this.screenSize.rows - cursorY - 2
            })
            .print();
        this.printFooter();
    }

    private printFooter() {
        let footer = 'Scroll: [↑] [↓] | Go back [B]';
        process.stdout.cursorTo(this.screenSize.columns - footer.length, this.screenSize.rows - 2);
        process.stdout.write(color.blue(footer));
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

        return cliHtml(this.entry.content?.replace('\n', ''), theme, { enableWordWrap: false });
    }
}
