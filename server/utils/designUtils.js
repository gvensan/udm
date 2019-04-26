import fs from 'fs';

const moment = require('moment');
const logger = require('winston');
const jsonfile = require('jsonfile');
require('winston-memory').Memory;

const batchMapsFile = process.env.FILESDIR + '/maps.json';
const { deleteJobsOfMap } = require('./jobUtils');

export const getMaps = (user) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } 
  try {
    maps = jsonfile.readFileSync(batchMapsFile);   
    if (!maps || !maps.length)
      return [];

    var userMaps = maps.filter((map) => {
      map.owned = false;
      if (map.creator === user.email)
        map.owned = true;
      return map.owned;
    }) 

    userMaps.sort(function(a, b) {
      return (new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
    })
      
    return userMaps;    
  } catch (error) {
    console.log('ERROR: Maps read failed - ', error)
    return [];
  }
}

export const getSharedMaps = (user) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } 
  try {
    maps = jsonfile.readFileSync(batchMapsFile); 
    if (!maps || !maps.length)
      return [];

    var sharedMaps = maps.filter((map) => {
      return map.shared;
    }) 

    sharedMaps.sort(function(a, b) {
      return (new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
    })
    
    return sharedMaps;    
  } catch (error) {
    console.log('ERROR: Maps read failed - ', error)
    return [];
  }
}

export const getMap = (id) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: Maps read failed - ', error)
    }
  }

  var map = maps.find((map) => {
    return map.id === id;
  })

  if (map)
    return map;

  return {id, createdAt: new Date().toLocaleString(), status: 'INVALID'};
}

export const getMapByName = (name) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: Maps read failed - ', error)
    }
  }

  var map = maps.find((map) => {
    return map.name === name;
  })

  if (map)
    return map;

  return false;
}

export const getMapById = (id) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: Maps read failed - ', error)
    }
  }

  var map = maps.find((map) => {
    return map.id === id;
  })

  if (map)
    return map;

  return false;
}

export const getMapCountForUser = (user) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile); 
    } catch (error) {
      console.log('ERROR: Maps read failed - ', error)
    }
  }

  var owned = [];
  var shared = [];
  maps.map((map) => {
    if (map.creator === user.email) {
      owned.push(map.name);
      if (map.shared)
        shared.push(map.name);
    }

    return map;
  })

  return {owned: owned, shared: shared};
}

export const deleteMap = (id, deleteChained, user) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: Maps read failed - ', error)
    }
  }

  var map = maps.find((map) => {
    return map.id === id && map.creator === user.email;
  })

  if (map !== undefined) {
    deleteJobsOfMap(user, map.id);  
    if (map.chainedMaps && map.chainedMaps.length) {
      map.chainedMaps.map((_cmap) => {
        var cmap = getMapById(_cmap.id);
        if (!cmap) 
          cmap = getMapByName(_cmap.name);
        if (cmap) {
          var chained = cmap.chained ? cmap.chained : [];
          if (chained.indexOf(map.id) >=  0)
            chained.splice(chained.indexOf(map.id), 1);
          cmap.chained = chained.length ? chained : false;
          
          if (deleteChained)
            deleteMap(cmap.id, deleteChained, user);
        }
      })
    }
    
    var path = process.env.FILESDIR + '/maps/' + map.id;
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
  
  maps = jsonfile.readFileSync(batchMapsFile);    
  var newMaps = maps.filter((map) => {
    return map.id !== id;
  })

  jsonfile.writeFileSync(batchMapsFile, newMaps, {}, function(error) {
    console.log('ERROR: Maps write failed - ', error)
  })  

  return;
}

export const endMap = (id, entries, status, message) => {
  var maps = jsonfile.readFileSync(batchMapsFile);
  var map = maps.find((map) => {
    return map.id === id;
  })

  if (!map) {
    console.log('ERROR: endMap::Map not found for id ' + id);
    return;
  }

  map.status = status ? 'SUCCESS' : 'FAILED';
  map.message = message; 
  map.logentries = entries; 

  jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
    console.log('ERROR: Maps write failed - ', error)
  })  
}

export const saveMap = (map, user) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: Maps write failed - ', error)
    })  
  } 

  maps = jsonfile.readFileSync(batchMapsFile);    

  var _map = maps.length ? maps.find((_map) => {
    return map.id === _map.id;
  }) : undefined;

  if (!_map) {
    _map = {id: map.id, owner: user.name, creator: user.email, createdAt: new Date().toLocaleString(), 
            lastUpdatedAt: new Date().toLocaleString(), shared: false, status: 'INVALID'};
    maps.push(_map);
  } else {
    _map.status = 'VALID';
    _map.lastUpdatedAt = new Date().toLocaleString();
    _map.createdAt = map.createdAt;
  }

  _map.owner = map.owner;
  _map.originalName = map.originalName;
  _map.shared = map.shared;
  _map.mapConfig = map.mapConfig;
  _map.mapIgnoreConfig = map.mapIgnoreConfig;
  _map.mapCopyConfig = map.mapCopyConfig;
  _map.mapCopyByNameConfig = map.mapCopyByNameConfig;
  _map.sourceFile = map.sourceFile;
  _map.sourceMap = map.sourceMap;
  _map.sourceIgnoreMap = map.sourceIgnoreMap;
  _map.mergeConfig = map.mergeConfig;
  _map.sourceMapValidation = map.sourceMapValidation;
  _map.sourcePreprocessor = map.sourcePreprocessor;
  _map.mergeFiles = map.mergeFiles !== undefined ? map.mergeFiles : false;
  _map.reuseSource = map.reuseSource !== undefined ? map.reuseSource : false;
  _map.diffSupported = map.diffSupported ? map.diffSupported : false;
  _map.diffMandatory = map.diffMandatory ? map.diffMandatory : false;
  _map.diffProcessing = map.diffProcessing ? map.diffProcessing : {};
  _map.customMapping = map.customMapping !== undefined ? map.customMapping : false;
  _map.customMappingFile = map.customMappingFile;
  _map.customFilesCount = map.customFilesCount;
  _map.namedlookups = map.namedlookups !== undefined ? map.namedlookups : false;
  _map.namedlookupsList = map.namedlookupsList;
  _map.targetFile = map.targetFile;
  _map.targetMap = map.targetMap;
  _map.targetIgnoreMap = map.targetIgnoreMap;
  _map.targetMapValidation = map.targetMapValidation;
  _map.mapPreprocessor = map.mapPreprocessor;
  _map.mapPostprocessor = map.mapPostprocessor;
  _map.chainWaterfall = map.chainWaterfall;
  _map.chained = map.chained;
  if (_map.chainMaps && _map.chainedMaps && _map.chainedMaps.length > 0) {
    _map.chainedMaps.map((cmap) => {
      var _cmap = maps.find((__cmap) => {
        return __cmap.id === cmap.id;
      })
      if (_cmap) {
        var chained = _cmap.chained && typeof (_cmap.chained) !== 'boolean' ? _cmap.chained : [];
        if (chained.indexOf(map.id) >= 0)
          chained.splice(chained.indexOf(map.id), 1);
        _cmap.chained = chained.length ? chained : false;
      }
    })
  }
  if (map.chainMaps && map.chainedMaps && map.chainedMaps.length > 0) {
    map.chainedMaps.map((cmap) => {
      var _cmap = maps.find((__cmap) => {
        return __cmap.id === cmap.id;
      })
      if (_cmap) {
        var chained = _cmap.chained && typeof (_cmap.chained) !== 'boolean'? _cmap.chained : [];
        if (chained.indexOf(map.id) <  0)
          chained.push(map.id);
        _cmap.chained = chained.length ? chained : false;
      }
    })
  }
  
  _map.chainedMaps = map.chainedMaps;
  _map.chainMaps = map.chainMaps;
  _map.validation = map.validation;
  _map.name = map.name;
  _map.description = map.description;
  _map.headerRow = map.headerRow;
  _map.sourceHeaderRow = map.sourceHeaderRow;
  _map.status = map.status;
  _map.success = map.success;
  _map.message = map.message;

  maps.sort(function(a, b) {
    return (new Date(b.lastUpdatedAt) - new Date(a.lastUpdatedAt))
  })

  jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
    console.log('ERROR: Maps write failed - ', error)
  })  

  return true;
}

export const initMapsConfig = () => {
  var maps = undefined;

  if (!fs.existsSync(batchMapsFile)) {
    maps = [];

    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(error) {
      console.log('ERROR: initConfig::Maps write failed - ', error)
    })
  }

  return;
}
