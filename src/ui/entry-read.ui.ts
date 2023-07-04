import { Controller } from '../controller.js';
import { Entry } from '../rss.service.js';
import cliHtml from 'cli-html';

export class EntryReadUI {
    private readonly controller = new Controller();
    private readonly entry: Entry;

    constructor(entry: Entry) {
        this.entry = entry;
    }

    load() {
        this.controller
            .on('backspace', () => {
                this.controller.clear(); // Clear commands so the entry UI can add its own.
                console.log('TODO - Go back to entry list');
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
        let header = (this.entry.title?.toUpperCase() ?? 'TITLE NOT FOUND') + '\n\n';
        header += (this.entry.date?.toLocaleDateString() ?? '') + ' | ';
        header += (this.entry.creator ?? '') + '\n';
        header += this.entry.categories?.join(', ') ?? '';
        console.log(header + '\n');

        if (this.entry.content) console.log(cliHtml(this.entry.content));
        else console.log('No content found for this entry.');
    }    
}
