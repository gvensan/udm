import express from 'express';
import multer from 'multer';
import fs from 'fs';
import uuidv4 from 'uuid/v4'; 
import moment from 'moment';
import { getMapById, getMapByName } from '../utils/designUtils';

const _ = require('lodash');
const { getMap, getMaps, getSharedMaps, deleteMap, saveMap, endMap, initMapsConfig, updateMapsConfig } = require('../utils/designUtils');
const { getUserByToken, doesUserExist, logActivity, getActivityLog } = require('../utils/userUtils');
const router = new express.Router();
const currMap = undefined;
const CHARCODES = {
  'A': 0,'B': 1,'C': 2,'D': 3,'E': 4,'F': 5,'G': 6,'H': 7,'I': 8,'J': 9,'K': 10,'L': 11,'M': 12,'N': 13,'O': 14,'P': 15,'Q': 16,'R': 17,'S': 18,'T': 19,'U': 20,'V': 21,'W': 22,'X': 23,'Y': 24,'Z': 25,'AA': 26,'AB': 27,'AC': 28,'AD': 29,'AE': 30,'AF': 31,'AG': 32,'AH': 33,'AI': 34,'AJ': 35,'AK': 36,'AL': 37,'AM': 38,'AN': 39,'AO': 40,'AP': 41,'AQ': 42,'AR': 43,'AS': 44,'AT': 45,'AU': 46,'AV': 47,'AW': 48,'AX': 49,'AY': 50,'AZ': 51,'BA': 52,'BB': 53,'BC': 54,'BD': 55,'BE': 56,'BF': 57,'BG': 58,'BH': 59,'BI': 60,'BJ': 61,'BK': 62,'BL': 63,'BM': 64,'BN': 65,'BO': 66,'BP': 67,'BQ': 68,'BR': 69,'BS': 70,'BT': 71,'BU': 72,'BV': 73,'BW': 74,'BX': 75,'BY': 76,'BZ': 77,'CA': 78,'CB': 79,'CC': 80,'CD': 81,'CE': 82,'CF': 83,'CG': 84,'CH': 85,'CI': 86,'CJ': 87,'CK': 88,'CL': 89,'CM': 90,'CN': 91,'CO': 92,'CP': 93,'CQ': 94,'CR': 95,'CS': 96,'CT': 97,'CU': 98,'CV': 99,'CW': 100
}

const storage = multer.diskStorage({
  destination: process.env.FILESDIR,
  filename: function(request, file, cb) {
    cb(null, file.originalname);
  }
});
router.get('/', function(req, res, next) {
  return res.end("DESIGN API Index");
});

router.post('/deletemap', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});
  var ids = req.body.ids;
  ids.map((id) => {
    var map = getMap(id, user);
    var deleteChained = req.body.deleteChained;
    var userMaps = getMaps(user);
    var chained = undefined;
    userMaps.map((_map) => {
      if (chained || _map.id === map.id)
        return _map;
      if (_map.chainMaps && _map.chainedMaps && _map.chainedMaps.length) {
        chained = _map.chainedMaps.find((_cmap) => {
          return _cmap.id === map.id;
        }) ? _map : chained;
      }
    })

    if (chained) {
      return res.json({success: false, message: 'Cannot delete map as it is chained to mapper - ' + 
              chained.name + ' [' + chained.id + ']'});
    }

    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Delete map (' + map.id + ') of ' + map.name});

    deleteMap(id, deleteChained, user);
  });
  
  return res.json({success: true});
});

router.post('/clonemap', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  if (map.status !== 'VALID')
    return res.json({success: false, message: 'Invalid request'});
  
  map.originalName = map.name;
  map.name = map.name + " (Clone)"
  map.creator = user.email;
  map.createdAt = new Date().toLocaleString();
  map.lastUpdatedAt = map.createdAt;
  map.shared = false;
  map.id = uuidv4();
  map.chainWaterfall = false;
  map.chained = false;
  map.chainedMaps = [];
  map.chainMaps = false;

  var dir = process.env.FILESDIR;
  fs.mkdirSync(dir + '/maps/' + map.id);  
  fs.linkSync(dir + '/maps/' + req.body.id + '/' + map.sourceFile, dir + '/maps/' + map.id + '/' + map.sourceFile);
  if (!map.reuseSource)
    fs.linkSync(dir + '/maps/' + req.body.id + '/' + map.targetFile, dir + '/maps/' + map.id + '/' + map.targetFile);

  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Clone map (' + map.id + ') of ' + map.name});
  
  return res.json({success: true, map: getMap(map.id, user)});      
});

router.post('/unchainmap', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var chainedMap = getMap(req.body.id, user);
  var map = getMap(req.body.mapId, user);

  if (chainedMap && map) {
    var chained = chainedMap.chained && typeof (chainedMap.chained) !== 'boolean' ? chainedMap.chained : [];
    if (chained.indexOf(map.id) >= 0)
      chained.splice(chained.indexOf(map.id), 1);
    chainedMap.chained = chained.length ? chained : false;
    saveMap(chainedMap, user);

    map.chainedMaps.splice(map.chainedMaps.indexOf(chainedMap.id), 1);
    saveMap(map, user);
  }    

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Clone map (' + map.id + ') of ' + map.name});
  
  return res.json({success: true, map: getMap(map.id, user)});      
});

const processChainedMap = (map, chainedMap, user, listOfZipFiles, zipMeta) => {
  var listOfFiles = [];
  var dir = process.env.FILESDIR;
  console.log('Zipping ' + chainedMap.name);
  
  var path = dir + '/maps/' + chainedMap.id;
  if (fs.existsSync(path)) {
    var jsonfile = require('jsonfile');
    try {
      jsonfile.writeFileSync(dir + '/maps/' + chainedMap.id + '/map.json', getMap(chainedMap.id, user), {}, function(err) {
        console.log('ERROR: map json write failed - ', err)
      })  
    } catch (error) {
      console.log(error);
    }
    
    listOfFiles.push({src: dir + '/maps/' + chainedMap.id + '/' + chainedMap.source, name: chainedMap.source});
    if (chainedMap.source && chainedMap.source !== chainedMap.target)
      listOfFiles.push({src: dir + '/maps/' + chainedMap.id + '/' + chainedMap.target, name: chainedMap.target });
    listOfFiles.push({src: dir + '/maps/' + chainedMap.id + '/map.json', name: 'map.json'});
  }

  if (listOfFiles.length) {
    var zipfilename = dir + '/maps/' + chainedMap.id + '/' + chainedMap.id + '.zip';
    var output = fs.createWriteStream(zipfilename);

    var archiver =  require('archiver');
    output.on('close', function() {
      console.log(zipArchive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
      if (fs.existsSync(dir + '/maps/' + chainedMap.id + '/map.json'))
        fs.unlinkSync(dir + '/maps/' + chainedMap.id + '/map.json');
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
    listOfZipFiles.push({src: zipfilename, name: chainedMap.id + '.zip'});

    // process chained maps
    var _map = getMapById(chainedMap.id);
    if (_map && _map.chainedMaps && _map.chainedMaps.length > 0) {
      _map.chainedMaps.map((_chainedMap) => {
        processChainedMap(_map, _chainedMap, user, listOfZipFiles, zipMeta);
        var found = zipMeta.chainedMaps.find((meta) => {
          return meta.mapId === _map.id;
        });
        if (!found) {
          found = { mapId: _map.id, chainedMaps: []};
          zipMeta.chainedMaps.push(found);
        }
        if (found.chainedMaps.indexOf(_chainedMap.id) < 0)
          found.chainedMaps.splice(0, 0, _chainedMap.id); 
      });
      zipMeta.importOrder.push(_map.id);          
    } else {
      // var found = zipMeta.chainedMaps.find((meta) => {
      //   return meta.mapId === map.id;
      // });
      // if (!found) {
      //   found = { mapId: chainedMap.id, chainedMaps: []};
      //   zipMeta.chainedMaps.push(found);
      // }
      // if (found.chainedMaps.indexOf(chainedMap.id) < 0)
      //   found.chainedMaps.splice(0, 0, chainedMap.id); 
      zipMeta.importOrder.splice(0, 0, chainedMap.id);    
    }

  }
}

router.post('/toggleshare', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  if (map.status !== 'VALID')
    return res.json({success: false, message: 'Invalid request'});
  
  map.shared = map.shared ? !map.shared : true;

  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Toggle share (' + map.id + ') of ' + map.name + ' - ' + map.shared ? 'SHARE' : 'UNSHARE'});
  
  return res.json({success: true, message: 'Successfully toggled share'});      
});

router.get('/export', function(req, res, next) {
  var user = getUserByToken(req.query.token)
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.query.id, user);
  
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Download map (' + map.id + ') of ' + map.name});

  if (map.chainedMaps && map.chainedMaps.length > 0) {
    var listOfZipFiles = [];
    var dir = process.env.FILESDIR;
    var path = undefined;
    var finalpath = dir + '/maps/' + req.query.id;
    var finalzipfilename = dir + '/maps/' + req.query.id + '/exportmap.zip';
    var finalarchiver =  require('archiver');
    var finalArchive = finalarchiver('zip', {
      // gzip: true,
      zlib: { level: 9 } // Sets the compression level.
    });
    var finaloutput = fs.createWriteStream(finalzipfilename);

    var zipMeta = { importOrder: [], chainedMaps: [] };

    // process chained maps
    if (map.chainedMaps && map.chainedMaps.length > 0) {
      map.chainedMaps.map((chainedMap) => {
        processChainedMap(map, chainedMap, user, listOfZipFiles, zipMeta);
        var found = zipMeta.chainedMaps.find((meta) => {
          return meta.mapId === map.id;
        });
        if (!found) {
          found = { mapId: map.id, chainedMaps: []};
          zipMeta.chainedMaps.push(found);
        }
        if (found.chainedMaps.indexOf(chainedMap.id) < 0)
          found.chainedMaps.splice(0, 0, chainedMap.id); 
      });
    }
    
    // process main map
    var listOfFiles = [];
    path = dir + '/maps/' + req.query.id;
    if (fs.existsSync(path)) {
      var jsonfile = require('jsonfile');
      try {
        jsonfile.writeFileSync(dir + '/maps/' + req.query.id + '/map.json', map, {}, function(err) {
          console.log('ERROR: map json write failed - ', err)
        })  
      } catch (error) {
        console.log(error);
      }
      
      listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + map.sourceFile, name: map.sourceFile});
      if (map.sourceFile !== map.targetFile)
        listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + map.targetFile, name: map.targetFile});
      if (map.namedlookups && map.namedlookupsList.length > 0) {
        map.namedlookupsList.map((nlul) => {
          if (!nlul.reuseSource)
            listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + nlul.externalLookupFile, name: nlul.externalLookupFile});
        })
      }
      listOfFiles.push({src: dir + '/maps/' + req.query.id + '/map.json', name: 'map.json'});
    }

    if (listOfFiles.length) {
      var zipfilename = dir + '/maps/' + req.query.id + '/' + req.query.id + '.zip';
      var output = fs.createWriteStream(zipfilename);

      var archiver =  require('archiver');
      output.on('close', function() {
        console.log(zipArchive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        var finaloutput = fs.createWriteStream(finalzipfilename);
        listOfZipFiles.forEach((file) => {
          finalArchive.append(fs.createReadStream(file.src), { name: file.name});
        })
        finaloutput.on('close', function() {
          console.log(finalArchive.pointer() + ' total bytes');
          console.log('Final archiver has been finalized and the output file descriptor has closed.');
          res.download(finalzipfilename, function (err) {
            if (fs.existsSync(dir + '/maps/' + req.query.id + '/map.json'))
              fs.unlinkSync(dir + '/maps/' + req.query.id + '/map.json');
            if (fs.existsSync(dir + '/maps/' + req.query.id + '/' + req.query.id + '.zip'))
              fs.unlinkSync(dir + '/maps/' + req.query.id + '/' + req.query.id + '.zip');
            if (fs.existsSync(dir + '/maps/' + req.query.id + '/exportmap.zip'))
              fs.unlinkSync(dir + '/maps/' + req.query.id + '/exportmap.zip');
            if (fs.existsSync(dir + '/maps/' + req.query.id + '/chained.json'))
              fs.unlinkSync(dir + '/maps/' + req.query.id + '/chained.json');
            map.chainedMaps.map((chainedMap) => {
              if (fs.existsSync(dir + '/maps/' + chainedMap.id + '/' + chainedMap.id + '.zip'))
                fs.unlinkSync(dir + '/maps/' + chainedMap.id + '/' + chainedMap.id + '.zip');
            });

            if (err) {
                console.log("Download Error", err);
            } else {
                console.log("Successfully downloaded");
            }
          });        
        });
          
        finalArchive.pipe(finaloutput);
        finalArchive.finalize();
      });
      
          
      var zipArchive = archiver('zip', {
        // gzip: true,
        zlib: { level: 9 } // Sets the compression level.
      });

      zipArchive.pipe(output);

      listOfFiles.forEach((file) => {
        zipArchive.append(fs.createReadStream(file.src), {name: file.name});
      });
      listOfZipFiles.push({src: zipfilename, name: map.id + '.zip'});

      var zipMetaFile = dir + '/maps/' + req.query.id + '/chained.json';
      zipMeta.main = map.id;
      jsonfile.writeFileSync(zipMetaFile, zipMeta, {}, function(error) {
        console.log('ERROR: Maps write failed - ', error)
      })  
      listOfZipFiles.push({src: zipMetaFile, name: 'chained.json'});
          
      zipArchive.finalize();
    }  
  } else {
    var listOfFiles = [];
    var dir = process.env.FILESDIR;
    var path = dir + '/maps/' + req.query.id;
    if (fs.existsSync(path)) {
      var jsonfile = require('jsonfile');
      try {
        jsonfile.writeFileSync(dir + '/maps/' + req.query.id + '/map.json', map, {}, function(err) {
          console.log('ERROR: map json write failed - ', err)
        })  
      } catch (error) {
        console.log(error);
      }
      
      listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + map.sourceFile, name: map.sourceFile});
      if (map.sourceFile !== map.targetFile)
        listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + map.targetFile, name: map.targetFile});
      if (map.namedlookups && map.namedlookupsList.length > 0) {
        map.namedlookupsList.map((nlul) => {
          if (!nlul.reuseSource)
            listOfFiles.push({src: dir + '/maps/' + req.query.id + '/' + nlul.externalLookupFile, name: nlul.externalLookupFile});
        })
      }
      listOfFiles.push({src: dir + '/maps/' + req.query.id + '/map.json', name: 'map.json'});
    }

    if (listOfFiles.length) {
      var zipfilename = dir + '/maps/' + req.query.id + '/exportmap.zip';
      var output = fs.createWriteStream(zipfilename);

      var archiver =  require('archiver');
      output.on('close', function() {
        console.log(zipArchive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');

        res.download(zipfilename, function (err) {
          if (fs.existsSync(dir + '/maps/' + req.query.id + '/map.json'))
            fs.unlinkSync(dir + '/maps/' + req.query.id + '/map.json');
          if (fs.existsSync(dir + '/maps/' + req.query.id + '/exportmap.zip'))
            fs.unlinkSync(dir + '/maps/' + req.query.id + '/exportmap.zip');
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
  }
});

router.post('/import', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});
    if (!req.file)
      return res.json({success: false, message: 'Missing or invalid input file'});

    var newId = uuidv4();
    if (!fs.existsSync(dir + '/maps/' + newId))
      fs.mkdirSync(dir + '/maps/' + newId);

    var jsonfile = require('jsonfile');
      
    var AdmZip = require('adm-zip');
    var zip = new AdmZip(req.file.path);
    zip.extractAllTo(dir + '/maps/' + newId, true);
    if (fs.existsSync(dir + '/' + req.file.filename))
      fs.unlinkSync(dir + '/' + req.file.filename);

    if (!fs.existsSync(dir + '/maps/' + newId + '/chained.json')) {
      try {
        var map = jsonfile.readFileSync(dir + '/maps/' + newId + '/map.json');  
        map.originalName = map.name;
        map.name = map.name + ' (' + moment().format('MMM Do, YYYY') + ')';
        map.creator = user.name;
        map.createdAt = new Date().toLocaleString();
        map.lastUpdatedAt = map.createdAt;
        map.status = 'VALID';
        map.shared = false;
        map.id = newId;
        saveMap(map, user);  

        logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Import map (' + map.id + ') of ' + map.name});
        
        return res.json({success: true, inputFile: map.name});  
      } catch (error) {
        console.log('ERROR: endMap::Maps read failed - ', err)
        return res.json({success: false, message: 'Import failed'});  
      }   
    } else {
      var importedMaps = [];
      var zipMeta = jsonfile.readFileSync(dir + '/maps/' + newId + '/chained.json');
      var mainZip = new AdmZip(dir + '/maps/' + newId + '/' + zipMeta.main + '.zip');

      // import child maps
      var mappedId = {};
      zipMeta.importOrder.map((childId) => {
        var newChildId = uuidv4();

        if (!fs.existsSync(dir + '/maps/' + newId + '/' + newChildId))
          fs.mkdirSync(dir + '/maps/' + newId + '/' + newChildId);
        var chainedZip = new AdmZip(dir + '/maps/' + newId + '/' + childId + '.zip');
        chainedZip.extractAllTo(dir + '/maps/' + newId + '/' + newChildId, true);  

        try {
          var cmap = jsonfile.readFileSync(dir + '/maps/' + newId + '/' + newChildId + '/map.json');  
          cmap.originalName = cmap.name;
          cmap.name = cmap.name;
          cmap.creator = user.name;
          cmap.createdAt = new Date().toLocaleString();
          cmap.lastUpdatedAt = cmap.createdAt;
          cmap.status = 'VALID';
          cmap.shared = false;
          cmap.id = newChildId;
          // jsonfile.writeFileSync(dir + '/maps/' + newId + '/' + newChildId + '/map.json', cmap, {});
          // saveMap(cmap, user);  
          importedMaps.push(cmap);

          mappedId[childId] = {
            newId: newChildId,
            name: cmap.name
          }
  
          logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Import map (' + cmap.id + ') of ' + cmap.name});
        } catch (error) {
          console.log('ERROR: endMap::Maps read failed - ', error)
          return res.json({success: false, message: 'Import of chained map failed'});  
        }   
      })
      
      // extract chained maps
      zipMeta.chainedMaps.map((chained) => {
        var newChainedId = uuidv4();

        if (!fs.existsSync(dir + '/maps/' + newId + '/' + newChainedId))
          fs.mkdirSync(dir + '/maps/' + newId + '/' + newChainedId);
        var chainedZip = new AdmZip(dir + '/maps/' + newId + '/' + chained.mapId + '.zip');
        chainedZip.extractAllTo(dir + '/maps/' + newId + '/' + newChainedId, true);  

        try {
          var cmap = jsonfile.readFileSync(dir + '/maps/' + newId + '/' + newChainedId + '/map.json');  
          cmap.originalName = cmap.name;
          cmap.name = cmap.name + ' (Imported @ ' + moment().format('DD-MM-YYYY HH:mm:ss') + ')';
          cmap.creator = user.name;
          cmap.createdAt = new Date().toLocaleString();
          cmap.lastUpdatedAt = cmap.createdAt;
          cmap.status = 'VALID';
          cmap.shared = false;
          cmap.id = newChainedId;

          mappedId[chained.mapId] = {
            newId: newChainedId,
            name: cmap.name
          }

          if (cmap.chainedMaps && cmap.chainedMaps.length > 0) {
            cmap.chainedMaps.map((_cmap) => {
              _cmap.name = mappedId[_cmap.id].name;
              _cmap.id = mappedId[_cmap.id].newId;
            })
          }
          // jsonfile.writeFileSync(dir + '/maps/' + newId + '/' + newChainedId + '/map.json', cmap, {});
          // saveMap(cmap, user); 
          importedMaps.push(cmap); 
  
          logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Import map (' + cmap.id + ') of ' + cmap.name});
        } catch (error) {
          console.log('ERROR: endMap::Maps read failed - ', error)
          return res.json({success: false, message: 'Import of chained map failed'});  
        }   
      })

      importedMaps.map((map) => {
        if (map.chained && map.chained.length > 0) {
          var found = map.chained.find((mapId) => {
            return Object.keys(mappedId).indexOf(mapId) >= 0;
          })
          if (found) {
            map.chained = [];
            if (map.chained.indexOf(mappedId[found].newId) < 0)
              map.chained.push(mappedId[found].newId);
            jsonfile.writeFileSync(dir + '/maps/' + newId + '/' + map.id + '/map.json', map, {});          
          }
        }

        saveMap(map, user);
        fs.renameSync(dir + '/maps/' + newId + '/' + map.id, dir + '/maps/' + map.id);
      })

      // delete holder directory
      var path = dir + '/maps/' + newId;
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
        
  
      return res.json({success: true});  
    } 
  });
});


router.get('/maps', function(req, res, next) {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  return res.json({success: true, maps: getMaps(user), sharedMaps: getSharedMaps(user)});      
});

router.get('/map', function(req, res, next) {
  return res.json({success: true, map: getMap(req.query.id)});      
});


router.post('/abandon', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Abandoned map creation'});

  var dir = process.env.FILESDIR;
  if (fs.existsSync(dir + '/maps/' + req.body.id)) {
    var path = dir + '/maps/' + req.body.id;
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

  deleteMap(req.body.id, false, user);  
  return res.json({success: true});
});

router.post('/source', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/maps/' + req.body.id))
      fs.mkdirSync(dir + '/maps/' + req.body.id);
    if (fs.existsSync(dir + '/maps/' + req.body.id + '/' + req.file.filename))
      fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + req.file.filename);
    fs.linkSync(dir + '/' + req.file.filename, dir + '/maps/' + req.body.id + '/' + req.file.filename);
    if (fs.existsSync(dir + '/' + req.file.filename))
      fs.unlinkSync(dir + '/' + req.file.filename);
    var map = getMap(req.body.id);
    map.sourceFile = req.file.filename;
    map.headerRow = req.body.headerRow ? req.body.headerRow : undefined;
    map.name = req.body.name;

    const excelToJson = require('convert-excel-to-json');
    const result = excelToJson({
      sourceFile: dir + '/maps/' + req.body.id + '/' + req.file.filename,
      header: {
        rows: map.headerRow
      }
    });

    map.sourceHeaderRow = map.sourceHeaderRow ? map.sourceHeaderRow : {};

    var dupsFound = [];
    Object.keys(result).map((key, index) => {
      map.sourceHeaderRow[key] = map.sourceHeaderRow[key] ? map.sourceHeaderRow[key] : req.body.headerRow;
      if (result[key].length > 0)
        result[key] = result[key].slice(0, 1)[0];
      else
        result[key] = {};
      var names = Object.values(result[key]);
      var uniqueNames = _.uniq(Object.values(result[key]));
      if (names.length !== uniqueNames.length)
        dupsFound.push(key);
    })

    if (dupsFound.length) {
      logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map source upload (' + map.id + ') of ' + map.name + ' :: Found duplicate headers'});

      return res.json({success: false, message: 'Duplicate header column names found on sheets [' + dupsFound.join(', ') + ']'}); 
    }
    
    map.sourceMap = result;
    saveMap(map, user);

    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map source upload (' + map.id + ') of ' + map.name});

    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/sourcesheet', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  var map = getMap(req.body.id);

  const excelToJson = require('convert-excel-to-json');
  const result = excelToJson({
    sourceFile: dir + '/maps/' + req.body.id + '/' + map.sourceFile,
    sheets: [{
      name: req.body.sheet,
      header: {
        rows: req.body.headerRow-1
      }
    }]
  });

  var preprocessor = {
      "preprocessorType": "Skip first N rows",
      "precision": "0",
      "skipRows": req.body.headerRow-1,
      "equalsValue": "",
      "listValue": "",
      "lessValue": "",
      "greaterValue": "",
      "fromDate": "",
      "toDate": "",
      "leftPreprocessorMode": "Lookup Value",
      "leftPreprocessorValue": {},
      "skiprows": ""
  }
  map.sourcePreprocessor = map.sourcePreprocessor ? map.sourcePreprocessor : {};
  if (map.mapConfig && map.mapConfig[req.body.sheet])
    delete map.mapConfig[req.body.sheet];
  var skipProcessor = undefined;

  if (map.sourcePreprocessor[req.body.sheet]) {
    skipProcessor = map.sourcePreprocessor[req.body.sheet].find((proc) => {
      return proc.preprocessorType === 'Skip first N rows';
    });
  }

  if (req.body.headerRow === "1" && map.sourcePreprocessor[req.body.sheet]) {
    map.sourcePreprocessor[req.body.sheet] = map.sourcePreprocessor[req.body.sheet].filter((proc) => {
      return proc.preprocessorType !== 'Skip first N rows';
    })
  } else if (skipProcessor) {
    skipProcessor.skipRows = req.body.headerRow - 1;
  } else {
    map.sourcePreprocessor[req.body.sheet] = map.sourcePreprocessor[req.body.sheet] ? map.sourcePreprocessor[req.body.sheet] : [];
    map.sourcePreprocessor[req.body.sheet].push(preprocessor);
  }

  map.sourceHeaderRow = map.sourceHeaderRow ? map.sourceHeaderRow : {};
  map.sourceHeaderRow[req.body.sheet] = req.body.headerRow;
  map.sourceMap[req.body.sheet] = result[req.body.sheet].slice(0, 1)[0];
  if (map.reuseSource) {
    map.targetMap[req.body.sheet] = result[req.body.sheet].slice(0, 1)[0];      
  }
  
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map source sheet update (' + map.id + ') of ' + map.name});

  return res.json({success: true, inputFile: map.sourceFile});  
});

router.post('/resetsource', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/maps/' + req.body.id))
    return res.json({success: true});  

  var map = getMap(req.body.id);
  if (fs.existsSync(dir + '/maps/' + req.body.id + '/' + map.sourceFile))
    fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + map.sourceFile);
  delete map.sourceFile;
  map.headerRow = req.body.headerRow;
  map.name = req.body.name;
  map.sourceFileReady = false;
  delete map.sourceFile;
  delete map.sourceMap;
  delete map.sourceMapValidation;
  delete map.sourcePreprocessor;
  delete map.sourceHeaderRow;
  delete map.mapPreprocessor;
  delete map.namedlookupsList;
  delete map.mapIgnoreConfig;

  map.shared = false;
  map.targetFileReady = false;
  map.reuseSource = false;
  map.diffSupported = false;
  map.customMapping = false;
  map.namedlookups = false;
  map.namedlookupsList = [];
  
  delete map.targetFile;
  delete map.targetMap;
  delete map.targetMapValidation;
  delete map.targetIgnoreMap;
  
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset map source (' + map.id + ') of ' + map.name});

  return res.json({success: true});  
});

router.post('/resettarget', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir + '/maps/' + req.body.id))
    return res.json({success: true});  

  var map = getMap(req.body.id);
  if (!map.reuseSource && fs.existsSync(dir + '/maps/' + req.body.id + '/' + map.targetFile))
    fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + map.targetFile);
  map.targetFile = undefined;
  map.name = req.body.name;
  map.targetFileReady = false;
  map.reuseSource = false;
  delete map.targetMap;
  delete map.targetMapValidation;
  delete map.targetIgnoreMap;
  
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Reset map target (' + map.id + ') of ' + map.name});

  return res.json({success: true});  
});

router.post('/customfilescount', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  map.customFilesCount = req.body.customFilesCount;
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map custom files count updated (' + map.id + ') of ' + map.name});

  return res.json({success: true});      
});

router.post('/headerrow', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  map.headerRow = req.body.headerRow;

  var dir = process.env.FILESDIR;

  const excelToJson = require('convert-excel-to-json');
  const result = excelToJson({
    sourceFile: dir + '/maps/' + req.body.id + '/' + map.sourceFile,
    header: {
      rows: map.headerRow
    }
  });

  map.sourceHeaderRow = map.sourceHeaderRow ? map.sourceHeaderRow : {};

  var sourceMap = {};
  Object.keys(result).map((key, index) => {
    map.sourceHeaderRow[key] = map.sourceHeaderRow[key] ? map.sourceHeaderRow[key] : req.body.headerRow;
    if (result[key].length > 0)
      sourceMap[key] = result[key][0];
    else
      sourceMap[key] = {};
  })

  map.sourceMap = sourceMap;
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map header row updated (' + map.id + ') of ' + map.name});

  return res.json({success: true});      
});

router.post('/reusesource', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  var dir = process.env.FILESDIR;
  
  if (req.body.reuse) {
    if (map.targetFile !== map.sourceFile && fs.existsSync(dir + '/maps/' + req.body.id + '/' + map.targetFile))
      fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + map.targetFile);    
    map.targetFile = map.sourceFile;  
    map.targetMap = map.sourceMap;
    map.targetMapValidation = map.sourceMapValidation;
    map.mapConfig = undefined;
    map.reuseSource = true;
    map.mergeFiles = false;
  } else {
    map.targetFile = undefined;
    map.targetMap = undefined;
    map.targetMapValidation = undefined;
    map.targetIgnoreMap = undefined;
    map.reuseSource = false;
    map.mapConfig = undefined;
  } 

  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map reuse source flag updated (' + map.id + ') of ' + map.name});

  return res.json({success: true, inputFile: map.sourceFile});      
});

router.post('/mergefiles', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  map.mergeFiles = req.body.mergeFiles ? true : false;

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map merge file setting updated for (' + map.id + ') of ' + map.name});
  saveMap(map, user);

  return res.json({success: true});      
});  

router.post('/diffupload', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  var dir = process.env.FILESDIR;
  
  if (req.body.diffupload) {
    map.diffSupported = true;
  } else {
    map.diffSupported = false;
  } 

  saveMap(map, user);
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map diff upload flag updated (' + map.id + ') of ' + map.name});

  return res.json({success: true, inputFile: map.sourceFile});      
});

router.post('/custommapping', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  var dir = process.env.FILESDIR;
  
  if (req.body.custommapping) {
    map.customMapping = true;
  } else {
    map.customMapping = false;
  } 

  saveMap(map, user);
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map custom mapping requirement updated (' + map.id + ') of ' + map.name});

  return res.json({success: true, customMapping: map.customMapping});      
});

router.post('/custommappingfile', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  var dir = process.env.FILESDIR;
  
  map.customMappingFile = req.body.custommappingfile;

  saveMap(map, user);
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map custom mapping implementation file updated with ' + map.customMappingFile + ' (' + map.id + ') of ' + map.name});

  return res.json({success: true, customMappingFile: map.customMappingFile});      
});

router.post('/namedlookups', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = getMap(req.body.id, user);
  var dir = process.env.FILESDIR;
  
  if (req.body.namedlookups) {
    map.namedlookups = true;
  } else {
    map.namedlookups = false;
  } 

  saveMap(map, user);
  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map named lookups updated (' + map.id + ') of ' + map.name});

  return res.json({success: true, namedlookups: map.namedlookups});      
});

router.post('/lookupsource', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;
  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    if (!fs.existsSync(dir + '/maps/' + req.body.id))
      fs.mkdirSync(dir + '/maps/' + req.body.id);
    
    var fileName = 'LU-' + moment().format('x') + '-' + req.file.filename;
    fs.linkSync(dir + '/' + req.file.filename, dir + '/maps/' + req.body.id + '/' + fileName);
    if (fs.existsSync(dir + '/' + req.file.filename))
      fs.unlinkSync(dir + '/' + req.file.filename);

    const excelToJson = require('convert-excel-to-json');
    const result = excelToJson({
      sourceFile: dir + '/maps/' + req.body.id + '/' + fileName,
    });

    Object.keys(result).map((key, index) => {
      if (result[key].length > 0)
        result[key] = result[key].slice(0, 1)[0];
      else
        result[key] = {};
    })

    var map = getMap(req.body.id);
    map.namedlookupsList[req.body.index].externalLookupFile = fileName;
    map.namedlookupsList[req.body.index].externalLookupFileReady = true;
    map.namedlookupsList[req.body.index].externalLookupFileUploadInProgress = false;
    map.namedlookupsList[req.body.index].externalLookupFileError = undefined;
    map.namedlookupsList[req.body.index].externalLookupSheets = Object.keys(result);;
    map.namedlookupsList[req.body.index].externalLookupSourceMap = result;

    saveMap(map, user);

    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Lookup source upload (' + map.id + ') of ' + map.name});

    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/lookupdelete', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  var map = getMap(req.body.id);
  if (req.body.index >= 0) {
    var namedLookup = map.namedlookupsList[req.body.index];
    if (!namedLookup.reuseSource && fs.existsSync(dir + '/maps/' + req.body.id + '/' + namedLookup.externalLookupFile))
      fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + namedLookup.externalLookupFile);
    map.namedlookupsList.splice(req.body.index, 1);
    map.namedlookups = map.namedlookupsList.length ? true : false;
  } else {
    if (map.namedlookupsList && map.namedlookupsList.length > 0) {
      map.namedlookupsList.map((namedLookup, index) => {
        if (!namedLookup.reuseSource && fs.existsSync(dir + '/maps/' + req.body.id + '/' + namedLookup.externalLookupFile))
          fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + namedLookup.externalLookupFile);
      })
    }
    map.namedlookupsList = [];
    map.namedlookups = false;
  }
    
  saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Lookup source reset (' + map.id + ') of ' + map.name});

  return res.json({success: true});  
});

router.post('/target', (req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var upload = multer({ storage }).single('file');;

  var dir = process.env.FILESDIR;
  if (!fs.existsSync(dir))
    fs.mkdirSync(dir);

  upload(req, res, function(err) {
    if (err)
      return res.json({success: false, message: err.message});

    var map = getMap(req.body.id, user);
    if (map.sourceFile === req.file.filename) {
      if (fs.existsSync(dir + '/maps/' + req.file.filename))
        fs.unlinkSync(dir + '/maps/' + req.file.filename);      
      return res.json({success: false, message: 'Source and target cannot be same file!'});  
    }
      
    if (!fs.existsSync(dir + '/maps/' + req.body.id))
      fs.mkdirSync(dir + '/maps/' + req.body.id);
    if (fs.existsSync(dir + '/maps/' + req.body.id + '/' + req.file.filename))
      fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + req.file.filename);
    fs.linkSync(dir + '/' + req.file.filename, dir + '/maps/' + req.body.id + '/' + req.file.filename);
    if (fs.existsSync(dir + '/' + req.file.filename))
      fs.unlinkSync(dir + '/' + req.file.filename);
      
    map.targetFile = req.file.filename;
    map.name = req.body.name;

    const excelToJson = require('convert-excel-to-json');
    const result = excelToJson({
      sourceFile: dir + '/maps/' + req.body.id + '/' + req.file.filename
    });

    var dupsFound = [];
    Object.keys(result).map((key, index) => {
      map.sourceHeaderRow[key] = map.sourceHeaderRow[key] ? map.sourceHeaderRow[key] : req.body.headerRow;
      if (result[key].length > 0)
        result[key] = result[key].slice(0, 1)[0];
      else
        result[key] = {};
      var names = Object.values(result[key]);
      var uniqueNames = _.uniq(Object.values(result[key]));
      if (names.length !== uniqueNames.length)
        dupsFound.push(key);
    })

    if (dupsFound.length) {
      logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map target upload (' + map.id + ') of ' + map.name + ' :: Found duplicate headers'});

      return res.json({success: false, message: 'Duplicate header column names found on sheets [' + dupsFound.join(', ') + ']'}); 
    }

    map.targetMap = result;

    var targetSheets = Object.keys(map.targetMap);
    var error = undefined;
    targetSheets.map((name) => {
      var keys = Object.keys(map.targetMap[name]);
      for (var i=0; i<keys.length-1; i++) {
        if (CHARCODES[keys[i+1]] - CHARCODES[keys[i]] !== 1) {
          error = "Missing header names for one or more columns starting after column "  + keys[i] + " on sheet '" + name + "' of '" + req.file.filename;
        }
      }
    });

    if (error) {
      if (fs.existsSync(dir + '/' + req.file.filename))
        fs.unlinkSync(dir + '/maps/' + req.body.id + '/' + req.file.filename);    
      return res.json({success: false, message: error});
    }    
    saveMap(map, user);

    logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map target upload (' + map.id + ') of ' + map.name});

    return res.json({success: true, inputFile: req.file.filename});  
  });
});

router.post('/update', async(req, res, next) => {
  var user = getUserByToken(req.headers['x-info-token']);
  if (!user)
    return res.json({success: false, message: 'Unauthorized request'});

  var map = req.body.map;
  if (map)
    saveMap(map, user);

  logActivity({time: new Date().toLocaleString(), user: user.name, email: user.email, activity: 'Map updated (' + map.id + ') of ' + map.name});

  return res.json({success: true});  
});

module.exports = router;
