import { emitKeypressEvents } from 'node:readline';

class Controller {
    commands: { key: string; command: () => void }[] = [];

    on(key: string, command: () => void) {
        this.commands.push({ key, command });
        return this;
    }

    execute(key: string) {
        this.commands.find((c) => c.key == key)?.command();
    }

    clear() {
        this.commands = [];
    }

    build() {
        emitKeypressEvents(process.stdin);

        process.stdin.setRawMode(true);

        process.stdin.removeAllListeners('keypress');
        process.stdin.on('keypress', this.keyPressHandler.bind(this));
    }

    private keyPressHandler(chunk: any, key: any) {
        this.execute(key.name);

        // default commands
        if ((key.name == 'c' && key.ctrl) || key.name == 'q') process.exit();
    }
}

export const controller = new Controller();
controller.build();
