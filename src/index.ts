import {Command, flags} from '@oclif/command';
import config from './config';
import {WorkerContainer} from './worker/worker-container';

class LeapfinExercise extends Command {
    static description = 'This program spawns worker threads to search a stream of data for the string \'Lpfn\''

    static flags = {
        version: flags.version({char: 'v'}),

        help: flags.help({char: 'h'}),

        timeout: flags.integer({
            char: 't',
            description: 'processing timeout in milliseconds',
            default: config.defaultProcessingTimeout
        }),

        search: flags.string({
            char: 's',
            description: 'the string to search for',
            default: config.defaultSearchString
        }),

        workers: flags.integer({
            char: 'w',
            description: 'number of workers',
            default: config.defaultNumberOfWorkers
        }),

        'dry-run': flags.boolean({
            description: 'does nothing. use to test you are passing the correct options'
        })
    }

    static args = []

    async run() {
        const {flags} = this.parse(LeapfinExercise);

        const search = flags.search;
        const timeout = flags.timeout;
        const numberOfWorkers = flags.workers;

        if (flags['dry-run']) {
            this.log('Command has following flags:', flags);
            this.log('Command will not run.');
            return;
        }

        await new WorkerContainer(search, timeout, numberOfWorkers).run();
    }
}

module.exports = LeapfinExercise;
