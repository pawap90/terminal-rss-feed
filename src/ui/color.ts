import chalk, { ChalkInstance } from 'chalk';
import { Theme } from 'cli-html';

// https://lospec.com/palette-list/fairydust-8
const colors = {
    yellow: '#f0dab1',
    orange: '#e39aac',
    pink: '#c45d9f',
    purple: '#634b7d',
    blue: '#6461c2',
    green: '#93d4b5',
    white: '#f0f6e8'
};

export const color: Record<keyof typeof colors, ChalkInstance> = Object.assign(
    {},
    ...Object.entries(colors).map(([key, value]) => {
        return { [key]: chalk.hex(value) };
    })
);

const colorString: Record<keyof typeof colors, { fg: string; bg: string }> = Object.assign(
    {},
    ...Object.entries(colors).map(([key, value]) => {
        return {
            [key]: {
                fg: value.replace('#', 'hex-'),
                bg: value.replace('#', 'bgHex-')
            }
        };
    })
);

export const theme: Theme = {
    bold: colorString.blue.fg,
    h1: colorString.pink.fg + ' inverse',
    h2: colorString.pink.fg,
    h3: colorString.blue.fg,
    h4: colorString.blue.fg,
    h5: colorString.purple.fg,
    h6: colorString.purple.fg,
    
    inlineCode: colorString.yellow.fg + ' ' + colorString.purple.bg,
    code: colorString.yellow.fg,
    codeNumbers: colorString.purple.fg,

    a: colorString.yellow.fg + ' underline'
};
