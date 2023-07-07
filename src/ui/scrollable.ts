import wrapAnsi from 'wrap-ansi';

type ScrollableOptions = {
    content?: string;
    start: { x: number; y: number };
    container: { width: number; height: number };
};

export class Scrollable {
    private lines: string[] = [];
    private currentLine = 0;
    private options: ScrollableOptions;

    constructor(options: Partial<ScrollableOptions>) {
        this.options = {
            content: options.content,
            start: options.start ?? { x: 0, y: 0 },
            container: options.container ?? {
                width: process.stdout.columns,
                height: process.stdout.rows
            }
        };
    }

    setContent(content: string): this {
        this.options.content = content;
        return this;
    }

    setStart(start: { x: number; y: number }): this {
        this.options.start = start;
        return this;
    }

    setContainer(container: { width: number; height: number }): this {
        this.options.container = container;
        return this;
    }

    print(): this {
        if (this.lines) this.splitContentIntoLines();
        const { x, y } = this.options.start;
        const { height } = this.options.container;

        process.stdout.cursorTo(0, y);
        for (let i = 0; i < height - 1; i++) {
            const line = this.lines[i + this.currentLine];
            process.stdout.clearLine(0);
            if (i < this.lines.length && line != undefined) console.log(line);
            else process.stdout.cursorTo(x, y + i);
        }

        return this;
    }

    scroll(lines: number): this {
        if (this.currentLine + lines < 0) this.currentLine = 0;
        else if (this.currentLine + lines > this.lines.length - 1)
            this.currentLine = this.lines.length - 1;

        this.currentLine += lines;
        this.print();
        return this;
    }

    private splitContentIntoLines(): void {
        if (!this.options.content) return;

        const wrapped = wrapAnsi(this.options.content, this.options.container.width, {
            hard: true,
            wordWrap: true
        });
        this.lines = wrapped.split('\n');
    }
}
