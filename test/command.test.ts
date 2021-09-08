import {expect, test} from '@oclif/test';

import config from '../src/config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LeapfinExercise = require('../src');

describe('test command', () => {
    test
        .stdout()
        .do(() => LeapfinExercise.run(['--dry-run']))
        .it('runs command with default arguments', ctx => {
            expect(ctx.stdout).to.contain(`workers: ${config.defaultNumberOfWorkers}`);
            expect(ctx.stdout).to.contain(`timeout: ${config.defaultProcessingTimeout}`);
            expect(ctx.stdout).to.contain(`search: '${config.defaultSearchString}'`);
            expect(ctx.stdout).to.contain('Command will not run.');
        });

    test
        .stdout()
        .do(() => LeapfinExercise.run(['--dry-run', '--timeout', '30000']))
        .it('runs command --timeout 30000', ctx => {
            expect(ctx.stdout).to.contain('timeout: 30000');
            expect(ctx.stdout).to.contain('Command will not run.');
        });
});
