import inquirer from "inquirer";
import { saveUserFeed } from "../services/feed.service.js";
import { color, colorKeys } from "../utils/color.js";
import clipboardy from "clipboardy";
import { SourceListUI } from "./source-list.ui.js";
import { controller } from "../utils/controller.js";
import { emitKeypressEvents } from "node:readline";

export class SourceAddUI {
    private screenSize = { columns: 0, rows: 0 };

    private readonly HEADER_HEIGHT = 3;

    async load(): Promise<void> {
        this.screenSize = { columns: process.stdout.columns, rows: process.stdout.rows };
        console.clear();

        this.printHeader();

        this.printFooter();

        await this.prompt();

        process.stdin.resume();

        await new SourceListUI().load();
    }

    private async prompt() {
        // Print header 
        process.stdout.cursorTo(0, this.HEADER_HEIGHT);

        const clipboardContent = await clipboardy.read();
        let clipboardUrl = '';
        if (this.isUrl(clipboardContent)) 
            clipboardUrl = clipboardContent; 
        
        const newRssAnswers = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Do you want to add a new RSS feed?',
                default: true
            },
            {
                type: 'input',
                name: 'url',
                message: (answers: any) => {
                    if (clipboardUrl.length > 0) return `Press enter to use the URL from your clipboard or enter a new one:`;
                    return 'Enter the URL of the RSS feed:';
                },
                default: clipboardUrl.length > 0 ? clipboardUrl : undefined,
                when: (answers: any) => answers.confirm,
                validate: (input: string) => {
                    if (this.isUrl(input)) return true;
                    return 'Please enter a valid URL. You can copy and paste it from your browser.';
                }
            },
            {
                type: 'input',
                name: 'title',
                message: 'Enter a title for this feed (optional):',
                when: (answers: any) => answers.confirm
            },
            {
                type: 'list',
                name: 'color',
                message: 'Select a color for this feed:',
                choices: colorKeys,
                default: 'white',
                when: (answers: any) => answers.confirm
            }
        ]);

        if (newRssAnswers.confirm)
            await saveUserFeed(newRssAnswers.url, newRssAnswers.title, newRssAnswers.color);
    }

    private printHeader() {
        const fullWidthLine = '─'.repeat(this.screenSize.columns - 2);
        const title = ' ADD SOURCE ';
        console.log(
            fullWidthLine +
            `\n${' '.repeat(this.screenSize.columns / 2 - title.length / 2)}${color.yellow.inverse(title)}\n` +
            fullWidthLine
        );
    }

    private printFooter() {
        const controls = 'Complete the questionnaire to add a new source.';

        process.stdout.cursorTo(
            this.screenSize.columns - controls.length,
            this.screenSize.rows - 2
        );
        process.stdout.write(color.blue(controls));
    }

    private isUrl(text: string): boolean {
        try {
            new URL(text);
            return true;
        } catch {
            return false;
        }
    }
}