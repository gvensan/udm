const _ = require('lodash');
const fs = require('fs');
const logger = require('winston');

const init = async () => {    
  var args = process.argv;
  console.log('ARGS', args);
  // jobId
  // logger.info(args);
  if (args.length < 3) {
    logger.info('Invalid or missing arguments');
    process.exit(1);
  }

  var jobId = args[2];
  logger.info(`Fetching job by specified id`);
  var job = getJob(jobId);
  if (!job) {
    logger.info(`Could not find the job by specified id: {args[2]}`);
    process.exit(0);
  }

  var map = getMapByName(job.mapName);
  if (!map) {
    logger.info(`Could not find the mapper by name referred in the job: {job.mapName}`);
    process.exit(0);
  }

  process.exit(0);  
};


init();
