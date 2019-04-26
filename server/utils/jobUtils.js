const fs = require('fs');
const moment = require('moment');
const logger = require('winston');
const jsonfile = require('jsonfile');
require('winston-memory').Memory;

const batchJobsFile = process.env.FILESDIR + '/jobs.json';

export const getAllJobs = (user) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } 
  try {
    jobs = jsonfile.readFileSync(batchJobsFile);  
    var userJobs = jobs.filter((job) => {
      return (job.creator === user.email);
    }) 
    userJobs.sort(function(a, b) {
      return (new Date(b.lastExecutedAt) - new Date(a.lastExecutedAt))
    })
    const { getMapById } = require('./designUtils');
    userJobs.map((job) => {
      var map = getMapById(job.mapId);
      job.mapName = map ? map.name : job.mapName;
    });
    
    return userJobs;
  } catch (error) {
    console.log('ERROR: Jobs read failed - ', error)
    return [];
  }
}

export const getJobs = (user, allJobs = false) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } 
  try {
    jobs = jsonfile.readFileSync(batchJobsFile);  
    var userJobs = jobs.filter((job) => {
      return (job.creator === user.email && (job.status === 'SUCCESS' || job.status === 'RUNNING')) || allJobs;
    }) 
    const { getMapById } = require('./designUtils');
    userJobs.map((job) => {
      var map = getMapById(job.mapId);
      job.mapName = map ? map.name : job.mapName;
    });
    
    return userJobs;
  } catch (error) {
    console.log('ERROR: Jobs read failed - ', error)
    return [];
  }
}

export const getFailedJobs = (user) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } 
  try {
    jobs = jsonfile.readFileSync(batchJobsFile);  
    var userJobs = jobs.filter((job) => {
      return job.creator === user.email && job.status !== 'SUCCESS';
    }) 
    const { getMapById } = require('./designUtils');
    userJobs.map((job) => {
      var map = getMapById(job.mapId);
      job.mapName = map ? map.name : job.mapName;
    });
    return userJobs;
  } catch (error) {
    console.log('ERROR: Jobs read failed - ', error)
    return [];
  }
}

export const getJob = (id) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } else {
    try {
      jobs = jsonfile.readFileSync(batchJobsFile);    
    } catch (error) {
      console.log('ERROR: Jobs read failed - ', error)
    }
  }

  var job = jobs.find((job) => {
    return job.id === id;
  })

  if (job) {
    const { getMapById } = require('./designUtils');
    var map = getMapById(job.mapId);
    job.mapName = map ? map.name : job.mapName;
    return job;
  }

  return {id, createdAt: new Date().toLocaleString(), status: 'INVALID'};
}

export const getJobCountForUser = (user) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } else {
    try {
      jobs = jsonfile.readFileSync(batchJobsFile);    
    } catch (error) {
      console.log('ERROR: Jobs read failed - ', error)
    }
  }

  var jobs = jobs.filter((job) => {
    return job.creator === user.email;
  })

  return jobs ? jobs.length : 0;
}

export const deleteJobsOfMap = (user, mapId) => {
  var jobs = getJobs(user, true);
  var mapJobs = jobs.filter((job) => {
    return (job.creator === user.email && job.mapId === mapId);
  });
  mapJobs.map((job) => {
    deleteJob(job.id, user);
  })
}

export const deleteJob = (id, user) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } else {
    try {
      jobs = jsonfile.readFileSync(batchJobsFile);    
    } catch (error) {
      console.log('ERROR: Jobs read failed - ', error)
    }
  }

  var job = jobs.find((job) => {
    return job.id === id && job.creator == user.email;
  })

  if (job !== undefined) {
    var path = process.env.FILESDIR + '/jobs/' + job.id;
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index){
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }    
  }
  
  var newJobs = jobs.filter((job) => {
    return job.id !== id;
  })

  jsonfile.writeFileSync(batchJobsFile, newJobs, {}, function(error) {
    console.log('ERROR: Jobs write failed - ', error)
  })  

  return;
}

export const endJob = (id, entries, status, message) => {
  var jsonfile = require('jsonfile');
  var jobs = jsonfile.readFileSync(batchJobsFile);

  var job = jobs.find((job) => {
    return job.id === id;
  })

  if (!job) {
    console.log('ERROR: endJob::Job not found for id ' + id);
    return;
  }

  job.status = status ? 'SUCCESS' : 'FAILED';
  job.lastExecutedAt = new Date().toLocaleString();
  job.message = message; 

  var dir = process.env.FILESDIR;
  try {
    fs.writeFileSync(dir + '/jobs/' + job.id + '/job.log', entries);
  } catch (error) {
    console.log(error);
  }
    

  jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
    console.log('ERROR: Jobs write failed - ', error)
  })  
}

export const saveJob = (job, user) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: Jobs write failed - ', error)
    })  
  } 

  jobs = jsonfile.readFileSync(batchJobsFile);    

  var _job = jobs.find((_job) => {
    return job.id === _job.id;
  })

  if (!_job) {
    _job = {id: job.id, creator: user.email, owner: user.name, createdAt: (new Date().toLocaleString()), status: 'INVALID'};
    jobs.push(_job);
  }

  _job.creator = job.creator ? job.creator : _job.creator;
  _job.owner = job.owner ? job.owner : _job.owner;
  _job.createdAt = job.createdAt ? job.createdAt : _job.createdAt;
  _job.lastExecutedAt = job.status === 'INVALID' ? job.createdAt : job.lastExecutedAt;
  _job.inputFile = job.inputFile;
  _job.diffFile = job.diffFile;
  _job.customFiles = job.customFiles;
  _job.lookupFiles = job.lookupFiles;
  _job.mergeFiles = job.mergeFiles;
  _job.mapName = job.mapName;
  _job.mapId = job.mapId;
  _job.pid = job.pid;
  _job.outputFile = job.outputFile;
  _job.useSheetNumbers = job.useSheetNumbers;
  _job.status = job.status;
  _job.success = job.success;
  _job.message = job.message;

  jobs.sort(function(a, b) {
    return (new Date(b.lastExecutedAt) - new Date(a.lastExecutedAt))
  })

  jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
    console.log('ERROR: Jobs write failed - ', error)
  })  
  
  return job;
}


export const sleep = (delay) => {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

export const initJobsConfig = () => {
  var jobs = undefined;

  if (!fs.existsSync(batchJobsFile)) {
    jobs = [];

    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      console.log('ERROR: initConfig::Jobs write failed - ', error)
    })
  }

  return;
}
