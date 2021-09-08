/* eslint-disable @typescript-eslint/no-var-requires */

// this file is just a trick to load ts files from worker_threads

const path = require('path');
const {workerData} = require('worker_threads');
require('ts-node').register();
require(path.resolve(__dirname, workerData.path));
