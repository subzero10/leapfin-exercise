import {expect} from '@oclif/test';

import * as sinon from 'sinon';
import {CryptoRandomStreamGenerator} from '../src/stream-read/crypto-random-stream-generator';
import {Worker} from '../src/domain/worker';
import {IndexOfStringSearch} from '../src/search/index-of-string-search';
import {WorkerMessenger} from '../src/domain/worker-messenger';
import {WorkerMessage} from '../src/domain/worker-message';
import actions from '../src/domain/worker-actions';

function getStubs() {
    const dataStreamer = sinon.createStubInstance(CryptoRandomStreamGenerator);
    const messenger = sinon.stub(new class implements WorkerMessenger {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
        postMessage(data: any) {
        }
    });
    return {dataStreamer, messenger};
}

describe('test worker processing', function () {

    it('should post message with success', () => {
        const {dataStreamer, messenger} = getStubs();
        dataStreamer.read.returns('blablaLpfnblabla');
        messenger.postMessage.returns();

        const worker = new Worker(messenger, new IndexOfStringSearch(), <any>dataStreamer, 'Lpfn');
        worker.run();

        expect(dataStreamer.read.callCount).to.equal(1);

        expect(messenger.postMessage.calledWithMatch({
            action: actions.STREAM_RESULT,
            data: {status: 'SUCCESS'}
        } as WorkerMessage)).to.be.true;
    });

    it('should post message with failure', () => {
        const {dataStreamer, messenger} = getStubs();
        dataStreamer.read.throws();
        messenger.postMessage.returns();

        const worker = new Worker(messenger, new IndexOfStringSearch(), <any>dataStreamer, 'Lpfn');
        worker.run();

        expect(dataStreamer.read.callCount).to.equal(1);

        expect(messenger.postMessage.calledWithMatch({
            action: actions.STREAM_RESULT,
            data: {status: 'FAILURE'}
        } as WorkerMessage)).to.be.true;
    });

    it('should read from stream until success', () => {
        const {dataStreamer, messenger} = getStubs();
        dataStreamer.read.onFirstCall().returns('blablabla');
        dataStreamer.read.onSecondCall().returns('blewblewblew');
        dataStreamer.read.onThirdCall().returns('blewblewLpfnblew');
        messenger.postMessage.returns();

        const worker = new Worker(messenger, new IndexOfStringSearch(), <any>dataStreamer, 'Lpfn');
        worker.run();

        expect(dataStreamer.read.callCount).to.equal(3);

        expect(messenger.postMessage.calledWithMatch({
            action: actions.STREAM_RESULT,
            data: {status: 'SUCCESS'}
        } as WorkerMessage)).to.be.true;
    });

    it('should fail if data streamer chunk size is too large', () => {
        const {messenger} = getStubs();
        messenger.postMessage.returns();
        const dataStreamer = sinon.spy(new CryptoRandomStreamGenerator(10000000000));

        const worker = new Worker(messenger, new IndexOfStringSearch(), <any>dataStreamer, 'Lpfn');
        worker.run();

        expect(dataStreamer.read.callCount).to.equal(1);
        expect(dataStreamer.read.threw()).to.be.true;

        expect(messenger.postMessage.calledWithMatch({
            action: actions.STREAM_RESULT,
            data: {status: 'FAILURE'}
        } as WorkerMessage)).to.be.true;
    });
});
