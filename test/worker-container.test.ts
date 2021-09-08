import {expect, test} from '@oclif/test';

import * as sinon from 'sinon';
import {WorkerContainer} from '../src/worker/worker-container';

const getWorkerContainerStub = () => {
    const workerContainer = new WorkerContainer('Lpfn', 10, 10);
    sinon.stub(workerContainer, <any>'spawnWorker').returns(new class {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        terminate() {
        }
    });
    return workerContainer;
};

describe('test worker container', function () {
    test
        .stdout()
        .add('workerContainer', getWorkerContainerStub)
        .it('should create 10 workers', async ctx => {
            await ctx.workerContainer.run();
            expect(ctx.workerContainer.results.length).to.equal(10);
        });

    test
        .stdout()
        .add('workerContainer', getWorkerContainerStub)
        .it('should terminate workers on timeout', async ctx => {
            await ctx.workerContainer.run();
            expect((ctx.stdout.match(/TIMEOUT/g) || []).length).to.equal(10);
        });

    test
        .stdout()
        .add('workerContainer', getWorkerContainerStub)
        .it('should log results in 11 lines for 10 workers', async ctx => {
            await ctx.workerContainer.run();
            expect((ctx.stdout.match(/\n/g) || []).length).to.equal(11);
            expect(ctx.stdout).to.contain('Average bytes read');
        });
});
