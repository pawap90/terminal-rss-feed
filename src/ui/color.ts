import chalk, { ChalkInstance } from 'chalk';

// https://lospec.com/palette-list/fairydust-8
const colors = {
    yellow: '#f0dab1',
    orange: '#e39aac',
    pink: '#c45d9f',
    purple: '#634b7d',
    blue: '#6461c2',
    green: '#93d4b5',
    white: '#f0f6e8',
};

export const color: Record<keyof typeof colors, ChalkInstance> = Object.assign(
    {},
    ...Object.entries(colors).map(([key, value]) => {
        return { [key]: chalk.hex(value) };
    })
);

