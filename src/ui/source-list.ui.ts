import { getBorderCharacters, table } from 'table';
import { type UserFeed, getUserFeeds } from '../services/feed.service.js';
import { controller } from '../utils/controller.js';
import { color } from '../utils/color.js';
import { SourceAddUI } from './source-add.ui.js';

export class SourceListUI {
    private sources: UserFeed[] = [];
    private selectedIndex = 0;
    private currentPage = 0;

    private totalPages = 0;
    private itemsPerPage = 0;
    private screenSize = { columns: 0, rows: 0 };

    private readonly ROW_HEIGHT = 5;
    private readonly HEADER_HEIGHT = 3;
    private readonly FOOTER_HEIGHT = 3;

    async load(): Promise<void> {
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows };

        this.sources = await getUserFeeds();

        this.itemsPerPage = Math.floor(
            (this.screenSize.rows - (this.HEADER_HEIGHT + this.FOOTER_HEIGHT)) / this.ROW_HEIGHT
        );
        this.totalPages = Math.ceil(this.sources.length / this.itemsPerPage);

        controller
            .on('up', () => this.move('up'))
            .on('down', () => this.move('down'))
            .on('a', async () => { 
                controller.clear();
                await new SourceAddUI().load();
            })
            .on('r', () => this.load());

        this.print();
    }

    private print() {
        console.clear();
        process.stdout.cursorTo(0, 0);

        const tableData = [];
        const startIndex = this.currentPage * this.itemsPerPage;
        const currentPageSources = this.sources.slice(startIndex, startIndex + this.itemsPerPage);

        for (let i = 0; i < currentPageSources.length; i++)
            tableData.push([
                this.selectedIndex == i ? '>' : ' ',
                this.sourceToString(currentPageSources[i])
            ]);

        console.clear();
        console.log(
            table(tableData, {
                border: getBorderCharacters('norc'),
                header: { content: color.yellow.inverse(' MY SOURCES ') },
                columns: { 0: { width: 1 }, 1: { width: this.screenSize.columns - 5 } },
                drawHorizontalLine: () => true,
                drawVerticalLine: () => false
            })
        );

        this.printFooter();
        console.log('\u001B[?25l'); // Hide cursor.
    }

    private sourceToString(source: UserFeed) {
        return `${color[source.color ?? 'white']('██')} ${source.title}\n${color.green(source.url)}`;
    }

    private printFooter() {
        let footer = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        footer += ` | ${this.sources.length} entries\n`;
        let controls = ' Select: [↑] [↓] | Add: [A] | Remove: [del] | Refresh: [R]';

        process.stdout.cursorTo(
            this.screenSize.columns - footer.length + 1,
            this.screenSize.rows - 3
        );
        process.stdout.write(footer);

        process.stdout.cursorTo(
            this.screenSize.columns - controls.length,
            this.screenSize.rows - 2
        );
        process.stdout.write(color.blue(controls));
    }

    private move(direction: 'up' | 'down') {
        if (direction == 'up') {
            if (this.selectedIndex == 0 && this.currentPage == 0) return;

            this.selectedIndex--;
            if (this.selectedIndex < 0 && this.currentPage > 0) {
                this.currentPage--;
                this.selectedIndex = this.itemsPerPage - 1;
            }
        } else {
            if (
                this.selectedIndex == this.itemsPerPage - 1 &&
                this.currentPage == this.totalPages - 1
            )
                return;

            this.selectedIndex++;
            if (this.selectedIndex >= this.itemsPerPage && this.currentPage < this.totalPages) {
                this.selectedIndex = 0;
                this.currentPage++;
            }
        }

        this.print();
    }
}
