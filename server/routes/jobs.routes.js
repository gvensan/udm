import express from 'express';
import multer from 'multer';
import fs from 'fs';
import uuidv4 from 'uuid/v4'; 

const logger = require('winston');

const { getAllJobs, getJob, deleteJob, saveJob, endJob, initJobsConfig, sleep } = require('../utils/jobUtils');
const { getMap } = require('../utils/designUtils');
const { getUserByToken, logActivity, getActivityLog } = require('../utils/userUtils');

const router = new express.Router();
const find = require('find-process');

const storage = multer.diskStorage({
  destination: process.env.FILESDIR,
  filename: function(request, file, cb) {
    cb(null, file.originalname);
  }
});

const stopJob = (job, user) => {
  initJobsConfig();

  var xformLog = [];         
  var job = getJob(job.id);
  if  (job.pid) {
    find('pid', job.pid)
    .then(function (list) {
      list.map((proc) => {
        process.kill(proc.pid);
      })
    }, function (err) {
      console.log(err.stack || err);
    })
  }
}

router.get('/', function(req, res, next) {
  return res.end("MAPPER API Index");
});

router.get('/download', function(req, res, next) {
  var user = getUserByToken(req.query.token)
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Download job (' + job.id + ') of ' + '\n' + job.mapName});

  var listOfFiles = [];
  var dir = process.env.FILESDIR;
  var path = dir + '/jobs/' + req.query.id;
  if (fs.existsSync(path)) {
    var jsonfile = require('jsonfile');
    try {
      jsonfile.writeFileSync(dir + '/jobs/' + req.query.id + '/job.json', job, {}, function(err) {
        console.log('ERROR: job json write failed - ', err)
      })  
    } catch (error) {
      console.log(error);
    }
    
    listOfFiles.push({src: dir + '/jobs/' + req.query.id + '/' + job.inputFile, name: job.inputFile});
    if (fs.existsSync(dir + '/jobs/' + req.query.id + '/mapped.xlsx'))
      listOfFiles.push({src: dir + '/jobs/' + req.query.id + '/mapped.xlsx', name: 'mapped.xlsx'});
    if (job.diffFile && fs.existsSync(dir + '/jobs/' + req.query.id + '/' + job.diffFile))
      listOfFiles.push({src: dir + '/jobs/' + req.query.id + '/' + job.diffFile, name: job.diffFile});
    if (fs.existsSync(dir + '/jobs/' + req.query.id + '/job.log'))
      listOfFiles.push({src: dir + '/jobs/' + req.query.id + '/job.log', name: 'job.log'});
    listOfFiles.push({src: dir + '/jobs/' + req.query.id + '/job.json', name: 'job.json'});
  }

  if (listOfFiles.length) {
    var zipfilename = dir + '/jobs/' + req.query.id + '/exportjob.zip';
    var output = fs.createWriteStream(zipfilename);

    var archiver =  require('archiver');
    output.on('close', function() {
      console.log(zipArchive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      res.download(zipfilename, function (err) {
        if (err) {
            console.log("Download Error", err);
        } else {
            console.log("Successfully downloaded");
        }
      });        
    });
     
    output.on('end', function() {
      console.log('Data has been drained');
    });
     
        
    var zipArchive = archiver('zip', {
      // gzip: true,
      zlib: { level: 9 } // Sets the compression level.
    });

    zipArchive.pipe(output);

    listOfFiles.forEach((file) => {
      zipArchive.append(fs.createReadStream(file.src), {name: file.name});
    });

    zipArchive.finalize();
    
  }        
});

router.get('/downloadlookuptemplate', function(req, res, next) {
  var user = getUserByToken(req.query.token)
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var file = process.env.FILESDIR + '/named_lookup.xlsx';
  if (!fs.existsSync(file))
    return res.send('Template file not found');

  res.download(file, function (err) {
    if (err) {
        console.log("Download Error", err);;
    } else {
        console.log("Success");
    }
  });
});

router.get('/downloadmappedexists', function(req, res, next) {
  var user = getUserByToken(req.query.token)
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);
  var dir = process.env.FILESDIR;
  var path = dir + '/jobs/' + req.query.id;
  if (fs.existsSync(path) && fs.existsSync(dir + '/jobs/' + req.query.id + '/mapped.xlsx'))
    return res.json({success: true});

  return res.json({success: false});
});

router.get('/downloadmapped', function(req, res, next) {
  var user = getUserByToken(req.query.token)
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);
  var file = process.env.FILESDIR + '/jobs/' + req.query.id + '/mapped.xlsx';
  if (!job || !fs.existsSync(file))
    return res.send('No job or mapped output file found');

  res.download(file, function (err) {
    if (err) {
        console.log("Download Error", err);;
    } else {
        console.log("Success");
    }
  });
});

router.get('/viewlog', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);
  if (job) {
    var dir = process.env.FILESDIR;
    var entries = 'Empty log - Error';
    try {
      if (fs.existsSync(dir + '/jobs/' + job.id + '/job.log'))
        entries = fs.readFileSync(dir + '/jobs/' + job.id + '/job.log');
    } catch (error) {
      console.log(error);
    }
  
    return res.json({success: true, logentries: entries.toString()});
  }

  return res.json({success: false, message: 'Job not found'});
});

router.get('/getlog', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);

  if (job) {
    var dir = process.env.FILESDIR;
    var logFile = dir + '/jobs/' + req.query.id + '/mapper.log';
    if (fs.existsSync(logFile)) {
      var logentries = fs.readFileSync(logFile).toString().split("\n");
      return res.json({success: true, logentries: logentries});
    } else {
      return res.json({success: false, logentries: ['Job not started or never ran!']});      
    }
  }

  return res.json({success: false, logentries: ['Job not found']});
});

router.post('/deletejob', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});
    
  var ids = req.body.ids;
  ids.map((id) => {
    var job = getJob(id, user);
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Delete job (' + job.id + ') of ' + job.mapName});

    deleteJob(job.id, user);
  });
  
  return res.json({success: false, message: 'Job not found'});
});

router.get('/jobs', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});


  return res.json({success: true, jobs: getAllJobs(user)});      
});

router.get('/job', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.query.id, user);

  return res.json({success: true, job: getJob(req.query.id, user)});      
});

router.post('/upload', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/jobs/' + req.body.id))
      fs.mkdirSync(dir + '/jobs/' + req.body.id);
    fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/' + req.file.filename);
    fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.mapId);
    var job = getJob(req.body.id, user);
    job.inputFile = req.file.filename;
    job.mapName = map.name;
    job.mapId = map.id;
    job.lookupFiles = job.lookupFiles ? job.lookupFiles : {};
    if (map.namedlookups && map.namedlookupsList.length > 0) {
      map.namedlookupsList.map((namedLookup) => {
        if (namedLookup.reuseSource)
          job.lookupFiles[namedLookup.lookupName] = req.file.filename;
      });
    }
    saveJob(job, user);
    
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Upload job input file (' + job.id + ') of ' + job.mapName + ' - ' + req.file.filename});
    
    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/resetinput', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/jobs/' + req.body.id))
    fs.mkdirSync(dir + '/jobs/' + req.body.id);
  var job = getJob(req.body.id, user);
  var fileName = job.inputFile;
  if (job.inputFile) {
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/' + job.inputFile))
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/' + job.inputFile);
    delete job.inputFile;
    saveJob(job, user);
  }
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset input file for (' + job.id + ') of ' + job.mapName + ' - ' + fileName});

  return res.json({success: true});  
});

router.post('/uploaddiff', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/jobs/' + req.body.id))
      fs.mkdirSync(dir + '/jobs/' + req.body.id);
    if (!fs.existsSync(dir + '/jobs/' + req.body.id + '/' + req.file.filename))      
      fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/' + req.file.filename);
    else
      fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/DIFF-' + req.file.filename);
    fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.mapId);
    var job = getJob(req.body.id, user);
    job.diffFile = req.file.filename;
    job.mapName = map.name;
    job.mapId = map.id;
    saveJob(job, user);
    
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Upload job diff file (' + job.id + ') of ' + job.mapName + ' - ' + req.file.filename});
    
    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/uploadcustom', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/jobs/' + req.body.id))
      fs.mkdirSync(dir + '/jobs/' + req.body.id);
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/CUSTOM-' + req.body.index + '-' + req.file.filename))  
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/CUSTOM-' + req.body.index + '-' + req.file.filename);

    fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/CUSTOM-' + req.body.index + '-' + req.file.filename);
    fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.mapId);
    var job = getJob(req.body.id, user);
    job.customFiles = job.customFiles ? job.customFiles : {};
    job.customFiles[req.body.index] = req.file.filename;
    job.mapName = map.name;
    job.mapId = map.id;
    saveJob(job, user);
    
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Upload custom file [' + req.body.index + '] (' + job.id + ') of ' + job.mapName + ' - ' + req.file.filename});
    
    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/resetcustom', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/jobs/' + req.body.id))
    fs.mkdirSync(dir + '/jobs/' + req.body.id);
  var job = getJob(req.body.id, user);
  job.customFiles = job.customFiles ? job.customFiles : {};

  var fileName = 'UNKNOWN';
  if (job.customFiles[req.body.index]) {
    fileName = job.customFiles['CUSTOM-'+req.body.index];
    var customFileName = job.customFiles[req.body.index];
    delete job.customFiles['CUSTOM-'+req.body.index];
    
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/CUSTOM-' + req.body.index + '-' + customFileName))
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/CUSTOM-' + req.body.index + '-' + customFileName);
  
    saveJob(job, user);
  }
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset custom file index [' + req.body.index + '] (' + job.id + ') of ' + job.mapName + ' - ' + fileName});

  return res.json({success: true});  
});

router.post('/mergefile', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/jobs/' + req.body.id))
      fs.mkdirSync(dir + '/jobs/' + req.body.id);
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/' + req.file.filename))
      return res.json({success: false, message: 'Named file already loaded'});  

    fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/' + req.file.filename);
    fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.mapId);
    var job = getJob(req.body.id, user);
    job.mergeFiles = job.mergeFiles ? job.mergeFiles : [];
    job.mergeFiles.push(req.file.filename);
    job.mapName = map.name;
    job.mapId = map.id;
    saveJob(job, user);
    
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Upload merge file (' + job.id + ') of ' + job.mapName + ' - ' + req.file.filename});
    
    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/resetmerge', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/jobs/' + req.body.id))
    fs.mkdirSync(dir + '/jobs/' + req.body.id);
  var fileName = req.body.file;
  var job = getJob(req.body.id, user);
  job.mergeFiles = job.mergeFiles ? job.mergeFiles : [];
  if (fileName && job.mergeFiles.indexOf(fileName) >= 0) {
    job.mergeFiles.splice(job.mergeFiles.indexOf(fileName), 1);
    
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/' + fileName))
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/' + fileName);
  
    saveJob(job, user);
  }
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset merge file (' + job.id + ') of ' + job.mapName + ' - ' + fileName});

  return res.json({success: true});  
});

router.post('/uploadlookup', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/jobs/' + req.body.id))
      fs.mkdirSync(dir + '/jobs/' + req.body.id);
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/LU-' + req.body.lookupName + '-' + req.file.filename))  
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/LU-' + req.body.lookupName + '-' + req.file.filename);

    fs.linkSync(dir + '/' + req.file.filename, dir + '/jobs/' + req.body.id + '/LU-' + req.body.lookupName + '-' + req.file.filename);
    fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.mapId);
    var job = getJob(req.body.id, user);
    job.lookupFiles = job.lookupFiles ? job.lookupFiles : {};
    job.lookupFiles[req.body.lookupName] = req.file.filename;
    job.mapName = map.name;
    job.mapId = map.id;
    saveJob(job, user);
    
    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Upload lookup file for [' + req.body.lookupName + '] (' + job.id + ') of ' + job.mapName + ' - ' + req.file.filename});
    
    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/resetlookup', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/jobs/' + req.body.id))
    fs.mkdirSync(dir + '/jobs/' + req.body.id);
  var fileName = 'UNKNOWN';
  var job = getJob(req.body.id, user);
  job.lookupFiles = job.lookupFiles ? job.lookupFiles : {};
  if (job.lookupFiles[req.body.lookupName]) {
    fileName = job.lookupFiles[req.body.lookupName];
    var lookupFileName = job.lookupFiles[req.body.lookupName];
    delete job.lookupFiles[req.body.lookupName];
    
    if (fs.existsSync(dir + '/jobs/' + req.body.id + '/LU-' + req.body.lookupName + '-' + lookupFileName))
      fs.unlinkSync(dir + '/jobs/' + req.body.id + '/LU-' + req.body.lookupName + '-' + lookupFileName);
  
    saveJob(job, user);
  }
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset lookup file for [' + req.body.lookupName + '] (' + job.id + ') of ' + job.mapName + ' - ' + fileName});

  return res.json({success: true});  
});

const runJob = (job, user) => {
  initJobsConfig();

  var xformLog = [];         
  var mappingFile = 'index.js';
  var map = getMap(job.mapId);
  if (map.customMapping) {
    mappingFile = map.customMappingFile;
    if (!fs.existsSync(process.env.BASEDIR + '/services/mapper/' + mappingFile)) {
      xformLog.push("Child process (conversion) failed with error: Mapping implementation file '" + mappingFile + "' does not exist");
      endJob(job.id, xformLog, false, 'File conversion failed');
      return;
    }
  }

  try {
    job.status = 'RUNNING';
    job.message = 'Starting...';
    saveJob(job, user);    
    
    var exec = require('child_process').execFile;
    const tx = exec('node',
                        [process.env.BASEDIR + '/services/mapper/' + mappingFile, job.id],
                        // job.inputFile, job.mapName, job.outputFile],
                        {maxBuffer: 512 * 1024 * 1024}, 
                      function(error, stdout, stderr) {
                        if (error) {
                          logger.info("Child process (mapping) failed with error at: ", error);
                          endJob(job.id, [
                                error ? ('error: ' + error.stack + '\n') : '' ,
                                stdout ? (`stdout: ${stdout}` + '\n') : '' ,
                                stderr ? (`stderr: ${stderr}` + '\n') : ''],
                                false, 'File conversion failed');
                          return;
                        } else if (stderr.length > 0) {
                          logger.info("Child process (mapping) failed with stderr: ", stderr);
                          endJob(job.id, [
                                error ? ('error: ' + error.stack + '\n') : '' ,
                                stdout ? (`stdout: ${stdout}` + '\n') : '' ,
                                stderr ? (`stderr: ${stderr}` + '\n') : ''],
                                false, 'File conversion failed');
                          return;
                        }

                        logger.info("Child process (mapping) successful");
                        endJob(job.id, [
                                error ? ('error: ' + error.stack + '\n') : '' ,
                                stdout ? (`stdout: ${stdout}` + '\n') : '' ,
                                stderr ? (`stderr: ${stderr}` + '\n') : ''],
                                true, 'File converted successfully');                                              
                      });
    job.pid = tx.pid;
    job.lastExecutedAt = new Date().toLocaleString();
    saveJob(job, user);    
  } catch (error) {
    console.log('Transform Error: ', error);
    endJob(job.id, [], false, error.message);
  }  
}

router.post('/run', async(req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.body.id, user);
  if (!job)
    return res.json({success: false, message: "Invalid request"});      

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Run job (' + job.id + ') of ' + job.mapName});

  runJob(job, user)
  return res.json({success: true, inputFile: job.inputFile, outputFile: job.outputFile});  
});

router.post('/stop', async(req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var job = getJob(req.body.id, user);
  if (!job)
    return res.json({success: false, message: 'Invalid request'});

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Stop job (' + job.id + ') of ' + job.mapName});

  stopJob(job, user)
  sleep(2000);
  job.status = 'ABORTED EXECUTION';
  saveJob(job, user);
  return res.json({success: true});  
});

router.post('/submit', async(req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token'])
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  initJobsConfig();

  var xformLog = [];         
  
  var job = getJob(req.body.id, user);
  logger.info('JOB', job);
  if (!job)
    return res.json({success: false, message: "Invalid request"});      

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Submit job (' + job.id + ') of ' + job.mapName});
    
  job.useSheetNumbers = req.body.useSheetNumbers === true ? true : false;
  job.status = 'Submitted';
  job.message = 'Run the job to see the mapped output';
  saveJob(job, user);
  
  runJob(job, user);
  return res.json({success: true, inputFile: job.inputFile, outputFile: job.outputFile});  
});

module.exports = router;
