'use strict';

const xlsx = require('xlsx');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const logger = require('winston');
const config = require('./config.js');
const jsonfile = require('jsonfile');
const jStat = require('jStat').jStat;
const uuidv4 = require('uuid/v4'); 
const md5 = require('md5');
const { union, intersection, difference, complement, equals } = require('set-manipulator');

process.env.BASEDIR = __dirname;
process.env.FILESDIR = __dirname + '/../../../files';

const batchJobsFile = process.env.FILESDIR + '/jobs.json';
const batchMapsFile = process.env.FILESDIR + '/maps.json';
const CHARCODES = {
  'A': 0,'B': 1,'C': 2,'D': 3,'E': 4,'F': 5,'G': 6,'H': 7,'I': 8,'J': 9,'K': 10,'L': 11,'M': 12,'N': 13,'O': 14,'P': 15,'Q': 16,'R': 17,'S': 18,'T': 19,'U': 20,'V': 21,'W': 22,'X': 23,'Y': 24,'Z': 25,'AA': 26,'AB': 27,'AC': 28,'AD': 29,'AE': 30,'AF': 31,'AG': 32,'AH': 33,'AI': 34,'AJ': 35,'AK': 36,'AL': 37,'AM': 38,'AN': 39,'AO': 40,'AP': 41,'AQ': 42,'AR': 43,'AS': 44,'AT': 45,'AU': 46,'AV': 47,'AW': 48,'AX': 49,'AY': 50,'AZ': 51,'BA': 52,'BB': 53,'BC': 54,'BD': 55,'BE': 56,'BF': 57,'BG': 58,'BH': 59,'BI': 60,'BJ': 61,'BK': 62,'BL': 63,'BM': 64,'BN': 65,'BO': 66,'BP': 67,'BQ': 68,'BR': 69,'BS': 70,'BT': 71,'BU': 72,'BV': 73,'BW': 74,'BX': 75,'BY': 76,'BZ': 77,'CA': 78,'CB': 79,'CC': 80,'CD': 81,'CE': 82,'CF': 83,'CG': 84,'CH': 85,'CI': 86,'CJ': 87,'CK': 88,'CL': 89,'CM': 90,'CN': 91,'CO': 92,'CP': 93,'CQ': 94,'CR': 95,'CS': 96,'CT': 97,'CU': 98,'CV': 99,'CW': 100
}
const supportedDateFormats = [
  'DD-MM-YYYY',
  'MM-DD-YYYY',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'DD-MMM-YYYY',
  'YYYY-MM-DD',
  'YYYY/MM/DD',
  'DD.MM.YYYY',
  'MM.DD.YYYY',
  'DDMMMMY',
  'MMMMDDY'
]
const extractColumnAsArray = (arr, key) => arr.map(x => x[key]);
const extractDateColumnAsArray = (arr, key) => arr.map(x => 
                moment(x[key], supportedDateFormats));

const saveJob = (job, status, message, messageGroup = undefined) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
      logger.error('ERROR: Jobs write failed - ', error);
      process.exit(1);
    })  
  } 

  jobs = jsonfile.readFileSync(batchJobsFile);    

  var _job = jobs.find((_job) => {
    return job.id === _job.id;
  })

  _job.status = status;
  _job.message = message ? message : '';
  _job.messageGroup = messageGroup ? messageGroup : '';
  
  jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(error) {
    console.log('ERROR: Jobs write failed - ', error)
  })  
  
  return job;
}

const getJob = (id) => {
  var jobs = [];
  if (!fs.existsSync(batchJobsFile)) {
    jsonfile.writeFileSync(batchJobsFile, jobs, {}, function(err) {
      console.log('ERROR: endJob::Jobs write failed - ', err)
    })  
  } else {
    try {
      jobs = jsonfile.readFileSync(batchJobsFile);    
    } catch (error) {
      console.log('ERROR: endJob::Jobs read failed - ', err)
    }
  }

  var job = jobs.find((job) => {
    return job.id === id;
  })

  if (job)
    return job;

  return false;
}

const getMapByName = (name) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(err) {
      console.log('ERROR: endMap::Maps write failed - ', err)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: endMap::Maps read failed - ', err)
    }
  }

  var map = maps.find((map) => {
    return map.name === name;
  })

  if (map)
    return map;

  return false;
}

const getMapById = (id) => {
  var maps = [];
  if (!fs.existsSync(batchMapsFile)) {
    jsonfile.writeFileSync(batchMapsFile, maps, {}, function(err) {
      console.log('ERROR: endMap::Maps write failed - ', err)
    })  
  } else {
    try {
      maps = jsonfile.readFileSync(batchMapsFile);    
    } catch (error) {
      console.log('ERROR: endMap::Maps read failed - ', err)
    }
  }

  var map = maps.find((map) => {
    return map.id === id;
  })

  if (map)
    return map;

  return false;
}

const isValidDate = (value) => {
  if (!value || !value.length)
    return value;
  
  try {
    var dateObj = moment(value, supportedDateFormats, true);
    var valid = dateObj.isValid();
    if (!valid)
      dateObj = moment(value, supportedDateFormats, true);
    valid = dateObj.isValid() ? dateObj.format('DD/MM/YYYY') : false;
    
    if (!valid && _.toInteger(value)) {
      const dateObj = xlsx.SSF.parse_date_code(_.toInteger(value));
      if (dateObj && dateObj.d && dateObj.m && dateObj.y) {
        dateObj.d = dateObj.d < 10 ? `0${dateObj.d}`: dateObj.d;
        dateObj.m = dateObj.m < 10 ? `0${dateObj.m}`: dateObj.m;
        dateObj.y = dateObj.y;
        valid = `${dateObj.d}/${dateObj.m}/${dateObj.y}`;
      }
    }
    return valid;
  } catch (error) {
    return false;
  }
}

const isValidNumber = (value) => {
  if (value === undefined || value === '')
    return false;

  var valid = _.isNumber(value) ? true : false;
  try {
    if (!valid) {
      var a = parseFloat(value);
      valid = !isNaN(a)
    }

    return valid;
  } catch (error) {
    return false;
  }
}

const runPostprocessor = (processor, sheet, data) => {

}

const runPreprocessor = (processor, sheet, data, map) => {
  saveJob(currentJob.job, 'RUNNING', 'Apply source preprocessor rules - ' + sheet);
  var preprocessors = processor && processor.length ? processor : [];
  if (!preprocessors.length)
    return data;

  var hIndex = preprocessors.indexOf('Header line number');
  if (hIndex >= 0)
    data[sheet].headerRow = Number(preprocessors[hIndex].headerLine);

  preprocessors.map((preprocessor, index) => {
    var columnArray = extractColumnAsArray(data[sheet], preprocessor.leftPreprocessorValue.lookupKey); //.slice(0, 1);
    var duplicates = _(columnArray).groupBy().pickBy(x => x.length > 1).keys().value()
    var sourceRangeInDays = 0;
    var targetRangeInDays = 0;
    var dateMax = undefined;
    var dateMin = undefined;

    if (preprocessor.preprocessorType === 'Date Range Fix') {
      var dateArray = extractDateColumnAsArray(data[sheet].slice(1), preprocessor.leftPreprocessorValue.lookupKey); //.slice(0, 1);
      dateMax = moment.max(dateArray);
      dateMin = moment.min(dateArray);
      sourceRangeInDays = dateMax.diff(dateMin, 'days');
      targetRangeInDays = moment(preprocessor.toDate).diff(moment(preprocessor.fromDate), 'days');
    }

    if (preprocessor.preprocessorType === 'Dedup by removal') {
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType, '" found ' + duplicates.length + ' duplicates');
      duplicates.map((dupVal) => {
        var els = [];
        for (var index=1; index<data[sheet].length; index++) {
          if (data[sheet][index][preprocessor.leftPreprocessorValue.lookupKey].toString() === dupVal.toString())
            els.push(index);
        }
        if (els.length > 1) {
          els.splice(0, 1);
          els.reverse();
          
          els.map((index) => {
            data[sheet].splice(index, 1);
          })
        }
      })
    } else if (preprocessor.preprocessorType === 'Dedup by obfuscation') {
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType, '" found ' + duplicates.length + ' duplicates');
      duplicates.map((dupVal) => {
        var indices = [];
        for (var index=1; index<data[sheet].length; index++) {
          if (data[sheet][index][preprocessor.leftPreprocessorValue.lookupKey].toString() === dupVal.toString())
            indices.push(index);
        }
        if (indices.length > 1) {
          var obfIndex = 1;
          indices.map((index1) => {
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = 
                data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] + '-' + obfIndex++;
          })
        }

        return dupVal;
      })
    } else if (preprocessor.preprocessorType === 'Skip row if empty') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (!data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');      
    } else if (preprocessor.preprocessorType === 'Skip row if not empty') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }

      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Uppercase') {
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (!data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey])
          continue;
        data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = 
          data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString().toUpperCase();
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" applied');  
    } else if (preprocessor.preprocessorType === 'Lowercase') {
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (!data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey])
          continue;
        data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = 
          data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString().toLowerCase();
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" applied');        
    } else if (preprocessor.preprocessorType === 'Empty Value') {
      for (var index1=1; index1<data[sheet].length; index1++) {
        data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = '';
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" applied');
    } else if (preprocessor.preprocessorType === 'Number round up' || preprocessor.preprocessorType === 'Number round down') {
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (!data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey])
          continue;
        data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = 
            roundTo(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey], preprocessor.precision);
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" applied');      
    } else if (preprocessor.preprocessorType === 'Skip after if equals to' || 
              preprocessor.preprocessorType === 'Skip after if not equals to') {
      var skipped = 0;
      var fromIndex = -1;
      if (preprocessor.preprocessorType === 'Skip after if equals to') {
        data[sheet].map((_row, _index) => {
          if (fromIndex < 0 && 
              _row[preprocessor.leftPreprocessorValue.lookupKey] &&
              _row[preprocessor.leftPreprocessorValue.lookupKey].toString() === preprocessor.skipAfterValue)
              fromIndex = _index;
          return _row;
        })
      } else if (preprocessor.preprocessorType === 'Skip after if not equals to') {
        data[sheet].map((_row, _index) => {
          if (fromIndex < 0 && 
              _row[preprocessor.leftPreprocessorValue.lookupKey] &&
              _row[preprocessor.leftPreprocessorValue.lookupKey].toString() !== preprocessor.skipAfterValue)
              fromIndex = _index;
          return _row;
        });
      }
      if (fromIndex >= 0) {
        for (var index1=fromIndex; index1<data[sheet].length; index1++) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }

      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped'); 
    } else if (preprocessor.preprocessorType === 'Skip after if empty') {
      var skipped = 0;
      var fromIndex = -1;
      data[sheet].map((_row, _index) => {
        if (fromIndex < 0 && (!_row[preprocessor.leftPreprocessorValue.lookupKey] || !_row[preprocessor.leftPreprocessorValue.lookupKey].toString().length))
          fromIndex = _index;
        return _row;
      })
      if (fromIndex >= 0) {
        for (var index1=fromIndex; index1<data[sheet].length; index1++) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }

      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped'); 
    } else if (preprocessor.preprocessorType === 'Skip row if equals to' || 
              preprocessor.preprocessorType === 'Skip row if not equals to') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (preprocessor.preprocessorType === 'Skip row if equals to' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString() === preprocessor.equalsValue) {
          data[sheet].splice(index1--, 1);
          skipped++;
        } else if (preprocessor.preprocessorType === 'Skip row if not equals to' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString() !== preprocessor.equalsValue) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' || 
              preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to') {
      var skipped = 0;
      var columnArray = extractColumnAsArray(data[preprocessor.leftPreprocessorValue.lookupSheet],
                                            preprocessor.leftPreprocessorValue.lookupKey);

      var aggregateKeys = _.uniq(columnArray).filter((value) => { return value.toString().length > 0 && value.toString() !== '0' });
      aggregateKeys.splice(0, 1);
      var aggregateResult = {};
      var aggregateRows = undefined;
      var aggregate = undefined;
      aggregateKeys.map((key) => {
        aggregateRows = data[preprocessor.leftPreprocessorValue.lookupSheet].filter((_row) => {
          return _row[preprocessor.leftPreprocessorValue.lookupKey] === key;                
        });
        if (aggregateRows.length) {
          aggregate = jStat.sum(extractColumnAsArray(aggregateRows, preprocessor.aggregateOnKey));
          if (preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' && 
              aggregate.toString() === preprocessor.equalsValue) {
            aggregateRows.map((row) => {
              row.skip = true;
              skipped++;
            });
          } else if (preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to' && 
                    aggregate.toString() !== preprocessor.equalsValue) {
            aggregateRows.map((row) => {
              row.skip = true;
              skipped++;
            });
          }

        }
      });
      
      for (var index1=data[preprocessor.leftPreprocessorValue.lookupSheet].length-1; index1 >= 0; index1--) {
        if (data[preprocessor.leftPreprocessorValue.lookupSheet][index1].skip)
          data[preprocessor.leftPreprocessorValue.lookupSheet].splice(index1, 1);
      }

      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Skip row if in list' || 
              preprocessor.preprocessorType === 'Skip row if not in list') {
      var skipped = 0;
      var values = preprocessor.listValue.split(",").map(function(item) {
        return item.trim();
      });
      
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (preprocessor.preprocessorType === 'Skip row if in list' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            values.indexOf(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString()) >= 0) {
          data[sheet].splice(index1--, 1);
          skipped++;
        } else if (preprocessor.preprocessorType === 'Skip row if not in list' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            values.indexOf(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString()) < 0) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Skip row if starts with' || 
                preprocessor.preprocessorType === 'Skip row if ends with') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (preprocessor.preprocessorType === 'Skip row if starts with' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString().startsWith(preprocessor.startEndValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        } else if (preprocessor.preprocessorType === 'Skip row if ends with' && 
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] !== undefined &&
            data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey].toString().endsWith(preprocessor.startEndValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Skip row if less than' || 
              preprocessor.preprocessorType === 'Skip row if less than or equals to') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (preprocessor.preprocessorType === 'Skip row if less than' && 
            typeof data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] === 'number' &&
            Number(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) <
              Number(preprocessor.lessValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        } else if (preprocessor.preprocessorType === 'Skip row if less than or equals to' && 
            typeof data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] === 'number' &&
            Number(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) <=
              Number(preprocessor.lessValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    } else if (preprocessor.preprocessorType === 'Skip row if greater than' || 
              preprocessor.preprocessorType === 'Skip row if greater than or equals to') {
      var skipped = 0;
      for (var index1=1; index1<data[sheet].length; index1++) {
        if (preprocessor.preprocessorType === 'Skip row if greater than' && 
            typeof data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] === 'number' &&
            Number(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) >
              Number(preprocessor.greaterValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        } else if (preprocessor.preprocessorType === 'Skip row if greater than or equals to' && 
            typeof data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] === 'number' &&
            Number(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey]) >=
              Number(preprocessor.greaterValue)) {
          data[sheet].splice(index1--, 1);
          skipped++;
        }
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" ' + skipped + ' rows skipped');            
    }  else if (preprocessor.preprocessorType === 'Date Range Fix') {
      for (var index1=1; index1<data[sheet].length; index1++) {
        data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey] = 
          moment(preprocessor.fromDate, supportedDateFormats).add(
                moment(data[sheet][index1][preprocessor.leftPreprocessorValue.lookupKey], supportedDateFormats).diff(
                    dateMin, 'days') * (targetRangeInDays / sourceRangeInDays), 'd').format('DD/MM/YYYY');
      }
      logger.info('PREPROCESSOR['+index+'] ' + ' :: "' + preprocessor.preprocessorType + '" applied');            
    }  
  })

  return data;
}

const constructMergedRow = (row, sourceSheet, targetSheet, map) => {
  var mergedRow = {};
  Object.entries(map.sourceMap[sourceSheet]).map((sEntry, sIndex) => {
    var targetEntry = Object.entries(map.sourceMap[targetSheet]).find((tEntry, tIndex) => { 
      return tIndex >= sIndex && tEntry[1] === sEntry[1];
    });
    if (targetEntry)
      mergedRow[targetEntry[0]] = row[sEntry[0]];
  })
  return mergedRow;
}

const runSourceValidation = (map, data) => {
  logger.info('Will run source validation');
  var errors = [];
  var sourceMapValidation = map.sourceMapValidation ? map.sourceMapValidation : [];

  Object.keys(data).map((sheet, index) => {
    for (var index=0; index < data[sheet].length; index++) {
      data[sheet][index]._rowNum = index;
    }
  });
      
  Object.keys(data).map((sheet, index) => {
    if (map.sourcePreprocessor && map.sourcePreprocessor[sheet])
      data = runPreprocessor(map.sourcePreprocessor[sheet], sheet, data, map);
    
    if (Object.keys(sourceMapValidation).indexOf(sheet) < 0) {
      return;
    }

    map.sourceIgnoreMap = map.sourceIgnoreMap ? map.sourceIgnoreMap : [];
    map.targetIgnoreMap = map.targetIgnoreMap ? map.targetIgnoreMap : [];
      
    if (map.sourceIgnoreMap.indexOf(sheet) >= 0) {
      return;
    }

    if (!Object.keys(sourceMapValidation).length || Object.keys(sourceMapValidation).indexOf(sheet) < 0) {
      return;
    }
    if (data[sheet].length <= 1) {
      return;
    }

    saveJob(currentJob.job, 'RUNNING', 'Apply source validation rules - ' + sheet);
    
    Object.keys(sourceMapValidation[sheet]).map((column) => {
      var validationRule = map.sourceMapValidation[sheet][column];

      if (validationRule.unique) {
        var columnArray = extractColumnAsArray(data[sheet], column); //.slice(0, 1);
        columnArray.splice(0, 1);
        var duplicates = columnArray.reduce(function(acc, el, i, arr) {
          if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
        }, []);

        if (duplicates.length) {
          errors.push('SHEET: "' + sheet + '" Duplicates found on column "' + validationRule.name + '"' + '\n' +
                      'COUNT: ' + duplicates.length);
          duplicates.map((dup) => {
            errors.push('DUPLICATE: ' + dup);
          })
          return column;
        }
      }
      
      for (var index1=1; index1 < data[sheet].length; index1++) {
        if (validationRule.required && (data[sheet][index1][column] === undefined || data[sheet][index1][column] === '')) {
          errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing required column (' + column + ') for ' + validationRule.name);
          continue;
        }

        if (validationRule.type === 'Date') {
          if (!data[sheet][index1][column] && validationRule.required) {
            errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing date value on column (' + column + ') for ' + validationRule.name);            
          } else if (data[sheet][index1][column]) {
            var dateValue = isValidDate(data[sheet][index1][column]);
            if (!dateValue) {
              errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Invalid date value found on column (' + column + ') for ' + validationRule.name);
            } else {
              data[sheet][index1][column] = dateValue; // DEC 17 (SChand) caused invalid date: moment(dateValue).format('DD/MM/YYYY');
            }
          }
        } else if (validationRule.type === 'Number') {
          if (!data[sheet][index1][column] && validationRule.required) {
            errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing number value on column (' + column + ') for ' + validationRule.name);   
          } else if (data[sheet][index1][column]) {
            var numberValue = isValidNumber(data[sheet][index1][column]);
            try {
              var numberResult = Number(data[sheet][index1][column]);
              if (numberValue && numberResult !== NaN)
                data[sheet][index1][column] = numberResult;
              else
                numberValue = false;
            } catch (error) {
              numberValue = false;
            }
            if (!numberValue || typeof data[sheet][index1][column] !== 'number') {
              errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Invalid number value found on column (' + column + ') for ' + validationRule.name);
            }
          }
        }
      }  
    })
  })

  // process merge into
  Object.keys(data).map((sheet, index) => {
    if (map.sourceIgnoreMap && map.sourceIgnoreMap.indexOf(sheet) >= 0)
      return sheet;

    if (!map.mergeConfig || !map.mergeConfig[sheet])
      return sheet;
    for (var index=1; index < data[sheet].length; index++) {
      var mergeRow = constructMergedRow(data[sheet][index], sheet, map.mergeConfig[sheet], map);
      data[map.mergeConfig[sheet]].push(mergeRow);;
    }
  });
    
  var sourceValidity = { valid: !errors.length, errors: errors, data: !errors.length ? data : []};
  return sourceValidity;
}

const runTargetValidation = (map, data) => {
  logger.info('Will run target validation');
  var errors = [];
  var targetMapValidation = map.targetMapValidation ? map.targetMapValidation : [];

  Object.keys(data).map((sheet, index) => {
    for (var index=0; index < data[sheet].length; index++) {
      data[sheet][index]._rowNum = index;
    }
  });
      
  Object.keys(data).map((sheet, index) => {
    if (Object.keys(targetMapValidation).indexOf(sheet) < 0) {
      return;
    }

    map.targetIgnoreMap = map.targetIgnoreMap ? map.targetIgnoreMap : [];
      
    if (map.targetIgnoreMap.indexOf(sheet) >= 0) {
      return;
    }

    if (!Object.keys(targetMapValidation).length || Object.keys(targetMapValidation).indexOf(sheet) < 0) {
      return;
    }
    if (data[sheet].length <= 1) {
      return;
    }

    saveJob(currentJob.job, 'RUNNING', 'Apply target validation rules - ' + sheet);
    
    Object.keys(targetMapValidation[sheet]).map((column) => {
      var validationRule = map.targetMapValidation[sheet][column];

      if (validationRule.unique) {
        var columnArray = extractColumnAsArray(data[sheet], column); //.slice(0, 1);
        columnArray.splice(0, 1);
        var duplicates = columnArray.reduce(function(acc, el, i, arr) {
          if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el); return acc;
        }, []);

        if (duplicates.length) {
          errors.push('SHEET: "' + sheet + '" Duplicates found on column "' + validationRule.name + '"' + '\n' +
                      'COUNT: ' + duplicates.length);
          duplicates.map((dup) => {
            errors.push('DUPLICATE: ' + dup);
          })
          return column;
        }
      }
      
      for (var index1=1; index1 < data[sheet].length; index1++) {
        if (validationRule.required && (data[sheet][index1][column] === undefined || data[sheet][index1][column] === '')) {
          errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing required column (' + column + ') for ' + validationRule.name);
          continue;
        }

        if (validationRule.type === 'Date') {
          if (!data[sheet][index1][column] && validationRule.required) {
            errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing date value on column (' + column + ') for ' + validationRule.name);            
          } else if (data[sheet][index1][column]) {
            var dateValue = isValidDate(data[sheet][index1][column]);
            if (!dateValue) {
              errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Invalid date value found on column (' + column + ') for ' + validationRule.name);
            } else {
              data[sheet][index1][column] = dateValue; // DEC 17 (SChand) caused invalid date: moment(dateValue).format('DD/MM/YYYY');
            }
          }
        } else if (validationRule.type === 'Number') {
          if (!data[sheet][index1][column] && validationRule.required) {
            errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Missing number value on column (' + column + ') for ' + validationRule.name);   
          } else if (data[sheet][index1][column]) {
            var numberValue = isValidNumber(data[sheet][index1][column]);
            try {
              var numberResult = Number(data[sheet][index1][column]);
              if (numberValue && numberResult !== NaN)
                data[sheet][index1][column] = numberResult;
              else
                numberValue = false;
            } catch (error) {
              numberValue = false;
            }
            if (!numberValue || typeof data[sheet][index1][column] !== 'number') {
              errors.push('SHEET: "' + sheet + '" ROW: ' + (index1+1) + ' - Invalid number value found on column (' + column + ') for ' + validationRule.name);
            }
          }
        }
      }  
    })
  })
    
  var targetValidity = { valid: !errors.length, errors: errors, data: !errors.length ? data : []};
  return targetValidity;
}

const createEmptyRow = (map, sheet) => {
  var data = {};
  Object.keys(map.targetMap[sheet]).map((key) => {
    data[key] = '';
  })

  return data;
}

const evaluateCondition = (left, right, condition) => {
  if (condition.conditionType === 'Is Empty') {
    return (left ? false : true);
  } else if (condition.conditionType === 'Is Not Empty') {
    return (left ? true : false);
  } else if (condition.conditionType === 'Equals to') {
    return (left === right);
  } else if (condition.conditionType === 'Not Equals to') {
    return (left !== right);
  } else if (condition.conditionType === 'Less than') {
    return (left < right);
  } else if (condition.conditionType === 'Less than or Equals to') {
    return (left <= right);
  } else if (condition.conditionType === 'Greater than') {
    return (left > right);
  } else if (condition.conditionType === 'Greater than or Equals to') {
    return (left >= right);
  } else if (condition.conditionType === 'Substring') {
    var len = Number(condition.stringLength);
    if (len > left.length)
      len = left.length;
    else if (len <= 0)
      len = left.length > 10 ? 10 : left.length;
    
    var pos = Number(condition.stringPosition);
    if (condition.stringPosition >= 0 && condition.stringPosition < len)
      pos = Number(condition.stringPosition);
    else if (condition.stringPosition < 0 && left.length >= len)
      pos = left.length - len;
    else if (condition.stringPosition < 0 && left.length < len)
      pos = 0;

    var val = left.substr(pos, len) === right;
    return val;
  } else if (condition.conditionType === 'Starts With') {
    return left.startsWith(condition.subString);
  } else if (condition.conditionType === 'Ends With') {
    return left.endsWith(condition.subString);
  } else if (condition.conditionType === 'Contains') {
    return left.indexOf(condition.subString) >= 0;
  }
}

const evaluateComputeConnected = (left, right, leftIsDate, rightIsDate, op, opConnector = undefined) => {
  if (op === 'Concatenate') {
    left = leftIsDate ? moment(left, supportedDateFormats).format('DD/MM/YYYY') : left;
    right = rightIsDate ? moment(right, supportedDateFormats).format('DD/MM/YYYY') : right;
    var res = right ? left.toString() + (opConnector ? opConnector : '') + right.toString() : left.toString();
    return res;
  } else if (op === 'Add') {
    var res;
    if (leftIsDate) {
      res = right ? moment(left, supportedDateFormats).add(right,'d').format('DD/MM/YYYY') : left;
    } else {
      res = right ? (Number(left) + Number(right)) : Number(left);
    }
    return res;
  } else if (op === 'Subtract') {
    var res;
    if (leftIsDate) {
      res = right ? moment(left, supportedDateFormats).subtract(right,'d').format('DD/MM/YYYY') : left;
    } else {
      res = right ? (Number(left) - Number(right)) : Number(left);
    }
    return res;
  } else if (op === 'Multiply') {
    return right ? Number(left) * Number(right) : Number(left);
  } else if (op === 'Divide') {
    return right ? Number(left) / Number(right) : Number(left);
  } else {
    return left;
  }
}

const evaluateComputed = (left, right, leftIsDate, rightIsDate, op, joiner, position, length) => {  
  if (op === 'Lowercase') {
    return left ? left.toString().toLowerCase() : '';
  } else if (op === 'Uppercase') {
    return left ? left.toString().toUpperCase() : '';
  } else if (op === 'Concatenate') {
    left = leftIsDate ? moment(left, supportedDateFormats).format('DD/MM/YYYY') : left;
    right = rightIsDate ? moment(right, supportedDateFormats).format('DD/MM/YYYY') : right;
    var res = right ? (left ? left.toString() : '') + joiner + right.toString() : (left ? left.toString() : '');
    return res;
  } else if (op === 'Convert To String') {
    var res = leftIsDate ? (left ? moment(left, supportedDateFormats).format('DD-MM-YYYY') : '') : (left ? left.toString() : '');
    return res;
  } else if (op === 'Convert To Number') {
    var num = isValidNumber(left);
    var res = num === false ? 0 : num;
    return res;
  } else if (op === 'MD5 Token') {
    return md5(left);
  } else if (op === 'Substring') {    
    var len = Number(length);
    var l = left ? left.toString() : '';
    if (len > l.length)
      len = l.length;
    else if (len <= 0)
      len = l.length > 10 ? 10 : l.length;
    
    var pos = Number(position);
    if (position >= 0 && position < len)
      pos = Number(position);
    else if (position < 0 && l.length >= len)
      pos = l.length - len;
    else if (position < 0 && l.length < len)
      pos = 0;

    var val = l.substr(pos, len);
    return val;
  } else if (op === 'Add') {
    var res;
    if (leftIsDate) {
      res = right ? moment(left, supportedDateFormats).add(right,'d').format('DD/MM/YYYY') : left;
    } else {
      res = right ? (left + right) : left;
    }
    return res;
  } else if (op === 'Subtract') {
    var res;
    if (leftIsDate) {
      res = right ? moment(left, supportedDateFormats).subtract(right,'d').format('DD/MM/YYYY') : left;
    } else {
      res = right ? (left - right) : left;
    }
    return res;
  } else if (op === 'Multiply') {
    return right ? left * right : left;
  } else if (op === 'Divide') {
    return right ? left / right : left;
  } else {
    return left;
  }
}

const evaluateAggregated = (data, op) => {
  if (op === 'Sum') {
    return jStat.sum(data);
  } else if (op === 'Average') {
    return jStat.sum(data) / data.length;
  } else if (op === 'Min') {
    return jStat.min(data);
  } else if (op === 'Max') {
    return jStat.max(data);
  } else if (op === 'Mean') {
    return jStat.mean(data);
  } else if (op === 'Variance') {
    return jStat.variance(data);
  } else if (op === 'Standard Deviation') {
    return jStat.stdev(data);
  } else if (op === 'Percentile') {
    return jStat.percentile(data);
  }
}

const constructId = (row, distinctKey, distinctCompositeKeys) => {
  if (distinctKey) {
    return row[distinctKey];
  } else if (distinctCompositeKeys) {
    var result = '';
    distinctCompositeKeys.map((key) => {
      result = result + row[key];
      return key;
    })
    return result;
  }
}

const locateRows = (data, anchor, anchorKey, anchorCompositeKeys, id) => {
  var result = [];
  data.map((row) => {
    if (id === constructId(row, anchorKey, anchorCompositeKeys))
      result.push(row);
    return row;
  })

  return result;
}

const runDetectDelta = (sourceData, diffData, lookupData, map) => {
  logger.info('Will run delta detection');

  var result = true;
  Object.keys(diffData).map((soruceSheet, sourceData, diffData, lookupData, map) => {
    if (result)
      result = sheetDetectDelta(sourceSheer);
    return sourceSheet;
  })
}

const sheetDetectDelta = (sheet, sourceData, diffData, lookupData, map) => {
  var absentDiffRequired = false;
  var partialDiffRequired = false;
  if (map.diffProcessing['Absent Record'] !== undefined)
    absentDiffRequired = true;
  if (map.diffProcessing['Partial Changes'] !== undefined)
    partialDiffRequired = true;

  var sheetData = diffData[sheet][0]
  if (!sheetData)
    return false;

  if (!map.targetMapValidation || !map.targetMapValidation[sheet])
    return false;

  var sheetKey = Object.keys(map.targetMapValidation[sheet]).find((key) => {
    return map.targetMapValidation[sheet][key].identifier && map.targetMapValidation[sheet][key].identifier === true;
  });
  var sheetKeyCol = sheetKey ? map.targetMapV[sheetKey] : undefined;

  var anchor = mapConfig[sheet]._config;

  if (absentDiffRequired) {
    saveJob(currentJob.job, 'RUNNING', 'Absent record diff processing...');
    var sourceIds = extractColumnAsArray(sheetData[sheet], sheetKey);
    var diffIds = extractColumnAsArray(diffData[sheet], sheetKey);
      
    if (map.diffProcessing['Absent Record'] === 'Bring Over') {
      var inDiffOnly = complement(diffIds, sourceIds);
      if (inDiffOnly && inDiffOnly.length > 0) {
        inDiffOnly.map((diffId) => {
          var row = diffData[sheet].find((_row) => {
            return _row[sheetKey] === diffId;
          })
          sheetData[sheet].push(row);
        })
      }
    }
  }

  if (partialDiffRequired) {
    saveJob(currentJob.job, 'RUNNING', 'Partial record updates diff processing...');
      
    if (map.diffProcessing['Partial Changes'] === 'Undo Changes') {
      diffData[sheet].map((data, row) => {
        sheetData[sheet][row] = data;
      });
    }
  }

  return {valid: true, data: sourceData};
}

const evaluateSkipConditions = (row, skipConditions, sourceSheet, targetSheet, evalCell, errors) => {
  var left = undefined;
  var right = undefined;
  var conditionResults = [];
  var evalResult = undefined;

  if (!skipConditions.length)
    return false;

  skipConditions.map((condition, cindex) => {
    left = undefined;
    if (condition.leftConditionMode === 'Lookup Value')
      left = row[condition.leftConditionValue.lookupKey];

    right = undefined;
    if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty')) {
      if (condition.rightConditionMode === 'Static Value')
        right = condition.rightConditionValue.staticValue;
      else if (condition.rightConditionMode === 'Lookup Value')
        right = row[condition.rightConditionValue.lookupKey];
    }
      
    try {
      conditionResults[cindex] = evaluateCondition(left, right, condition);
    } catch (error) {
      errors.push('INVALID evaluateSkipConditions on - ' + sourceSheet + ' @row: ' + row._rowNum + 
                  ' with - left:  ' + left + ' right: ' + right + ' conditionType: ' + condition.conditionType + 
                  ', while working on ' + evalCell + ' of ' + targetSheet);             
    }
  })

  if (skipConditions.length === 1)
    evalResult = conditionResults[0];
  else {
    evalResult = conditionResults[0];
    for (var cindex=1; cindex<skipConditions.length; cindex++) {
      if (skipConditions[cindex-1].connector === 'AND')
        evalResult = evalResult && conditionResults[cindex];
      else if (skipConditions[cindex-1].connector === 'OR')
        evalResult = evalResult || conditionResults[cindex];
    }
  }

  return evalResult;
}

const runMapping = (map, data, lookupData) => {
  logger.info('Will run mapping');
  var errors = [];

  var targetData = {};
  Object.keys(map.targetMap).map((targetSheet) => {
    saveJob(currentJob.job, 'RUNNING', 'Apply mapping & transformation rules - ' + targetSheet);
    logger.info('Mapping: ' + targetSheet);
    if ((map.mapIgnoreConfig && map.mapIgnoreConfig.indexOf(targetSheet) >= 0) || 
        (map.targetIgnoreMap && map.targetIgnoreMap.indexOf(targetSheet) >= 0)) {
      return;
    }

    var config = map.mapConfig[targetSheet];
    if (!config)
      return;

    targetData[targetSheet] = [];
    var headerAdjusted = {};
    Object.keys(CHARCODES).map((_key) => {
      if (map.targetMap[targetSheet][_key]) {
        headerAdjusted[_key] = map.targetMap[targetSheet][_key];
      }
    })
    
    // targetData[targetSheet].push(Object.values(map.targetMap[targetSheet]));
    targetData[targetSheet].push(headerAdjusted);

    var anchor = config._config;
    var anchorCompositeKeys = [];
    var anchorCompositeValues = [];
    var anchorCompositeRowValues = [];
    var dataSource = {};
    var _data = {};
    Object.keys(data).map((key) => {
      _data[key] = data[key].slice();
    });

    if (map.mapPreprocessor && map.mapPreprocessor[targetSheet])
      _data = runPreprocessor(map.mapPreprocessor[targetSheet], anchor.sourceSheet, _data, map);

    if (anchor.distinctRows) {
      var anchorKey = _.findKey(map.sourceMap[anchor.sourceSheet], 
        function (o) { return o === anchor.sourceColumn});

      dataSource[anchor.sourceSheet] = _.uniqBy(_data[anchor.sourceSheet], anchorKey);
    } else if (anchor.distinctCompositeRows) {
      _.findKey(map.sourceMap[anchor.sourceSheet], 
        function (o, k) { 
          if (_.includes(anchor.sourceColumns, o))
          anchorCompositeKeys.push(k);
          return false;
        }
      );

      anchorCompositeValues = _.map(_data[anchor.sourceSheet], 
        function(row) {
          var result = '';
          anchorCompositeKeys.map((key) => {
            result = result + row[key];
            return key;
          })
          return result;
        }
      );

      dataSource[anchor.sourceSheet] = _.uniqBy(_data[anchor.sourceSheet], 
        function(row) {
          var result = '';
          anchorCompositeKeys.map((key) => {
            result = result + row[key];
            return key;
          })
          return result;
        }
      );

      dataSource[anchor.sourceSheet].map((row) => {
        var result = '';
        anchorCompositeKeys.map((key) => {
          result = result + row[key];
          return key;
        })
        anchorCompositeRowValues.push(result);
        return row;      
      })
    } else {
      dataSource = _data;
    }

    var evalError = undefined;
    var evalErrorType = undefined;
    var evalRow = undefined;
    var evalCondition = undefined;
    var evalTargetSheet = anchor.sourceSheet;
    var evalTargetCell = undefined;

    for (var row=1; row < dataSource[anchor.sourceSheet].length; row++) {
      var newData = createEmptyRow(map, targetSheet);
      var rowData = dataSource[anchor.sourceSheet][row];
      var ignoreRow = false;
      if (evalError) {
        errors.push('INVALID final evaluation (' + evalErrorType + ') on - ' + anchor.sourceSheet + ' @row: ' + evalRow + ' at - ' + evalCondition.leftAggregatedValue.lookupName + ', while working on column "' + evalTargetCell + '" of ' + targetSheet);              
        break;
      }

      Object.values(map.targetMap[targetSheet]).map((targetColEntry) => {
        var cellKey = Object.keys(config).find((configEntry) => {
          return configEntry === targetColEntry;
        });

        if (!cellKey)
          return targetColEntry;

      // Object.keys(config).map((cellKey) => {        
        // if (cellKey === '_config')
            // return cellKey;

        var targetCellKey = _.findKey(map.targetMap[targetSheet], 
          function (o) { 
            return o === cellKey;
          }
        );

        if (newData[targetCellKey] && newData[targetCellKey].length > 0)
          return cellKey;
      
        evalTargetCell = cellKey;

        if (!config[cellKey].mapMode || config[cellKey].mapMode === 'Simple') {
          var evalResult = undefined;

          var condition = config[cellKey].simple.conditions[0];
          if (condition.leftSimpleMode === 'Static Value') {
            evalResult  = condition.leftSimpleValue.staticValue;
          } else if (condition.leftSimpleMode === 'vLookup Name' && condition.leftSimpleValue.lookedupName && 
                    lookupData && lookupData[condition.leftSimpleValue.lookedupName] && 
                    lookupData[condition.leftSimpleValue.lookedupName][condition.leftSimpleValue.lookedupSheetName]) {
            var dresult = lookupData[condition.leftSimpleValue.lookedupName][condition.leftSimpleValue.lookedupSheetName].find((entry) => {
              return entry[condition.leftSimpleValue.lookedupKey].toString() === 'default';
            });
            var lresult = lookupData[condition.leftSimpleValue.lookedupName][condition.leftSimpleValue.lookedupSheetName].find((entry) => {
              return entry[condition.leftSimpleValue.lookedupKey].toString() === dataSource[condition.leftSimpleValue.lookupSheet][row][condition.leftSimpleValue.lookupKey].toString();
            });

            evalResult = lresult ? lresult[condition.leftSimpleValue.lookedupValue] : (dresult ? dresult[condition.leftSimpleValue.lookedupValue] : '');   
          } else if (condition.leftSimpleMode === 'Lookup Value') {
            evalResult = dataSource[condition.leftSimpleValue.lookupSheet][row][condition.leftSimpleValue.lookupKey]   
          }

          evalRow = rowData._rowNum;

          if (config[cellKey].simple.final) {
            var tag = moment().milliseconds();
            var code = "function fn_" + tag + "(evalResult)" + config[cellKey].simple.final.code + "\nfn_" + tag + "(\"" + evalResult + "\");";
            var result = 'Not Evaluated';
            try {
              if (evalResult !== undefined)
                eval(code);
            } catch (error) {
              evalError = error;
              evalCondition = condition;
              evalErrorType = 'simple'
            }

            if (result === 'Skip Row') {
              ignoreRow = true;
            } else if (result !== 'Not Evaluated') {
              newData[targetCellKey] = result;              
            } else {
              newData[targetCellKey] = evalResult;              
            }
          } else {
            newData[targetCellKey] = evalResult;          
          }
          
        } else if (config[cellKey].mapMode === 'Conditional') {
          var evalResult = undefined;
          var conditionResults = [];
          var conditional = config[cellKey].conditional;
          var conditions = conditional.conditions;
          var left = undefined;
          var right = undefined;

          conditions.map((condition, cindex) => {
            left = undefined;
            if (condition.leftConditionMode === 'Static Value') {
              left = condition.leftConditionValue.staticValue;
            } else if (condition.leftConditionMode === 'vLookup Name' && condition.leftConditionValue.lookedupName && 
                      lookupData && lookupData[condition.leftConditionValue.lookedupName] && 
                      lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName]) {
              var dresult = lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftConditionValue.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftConditionValue.lookedupKey].toString() === dataSource[condition.leftConditionValue.lookupSheet][row][condition.leftConditionValue.lookupKey].toString();
              });

              left = lresult ? lresult[condition.leftConditionValue.lookedupValue] : (dresult ? dresult[condition.leftConditionValue.lookedupValue] : '');   
            } else if (condition.leftConditionMode === 'Lookup Value') {
              left = dataSource[condition.leftConditionValue.lookupSheet][row][condition.leftConditionValue.lookupKey];
            }

            right = undefined;
            if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty')) {
              if (condition.rightConditionMode === 'Static Value')
                right = condition.rightConditionValue.staticValue;
              else if (condition.rightConditionMode === 'Lookup Value')
                right = dataSource[condition.rightConditionValue.lookupSheet][row][condition.rightConditionValue.lookupKey];
            }
              
            try {
              conditionResults[cindex] = evaluateCondition(left, right, condition);
            } catch (error) {
              errors.push('INVALID evaluateCondition on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                          ' with - left:  ' + left + ' right: ' + right + ' conditionType: ' + condition.conditionType + 
                          ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
            }
          })

          if (conditions.length === 1)
            evalResult = conditionResults[0];
          else {
            evalResult = conditionResults[0];
            for (var cindex=1; cindex<conditions.length; cindex++) {
              if (conditions[cindex-1].connector === 'AND')
                evalResult = evalResult && conditionResults[cindex];
              else if (conditions[cindex-1].connector === 'OR')
                evalResult = evalResult || conditionResults[cindex];
            }
          }

          if (evalResult) {
            if (conditional.trueCondition.mode === 'Static Value') {
              newData[targetCellKey] = conditional.trueCondition.result.staticValue;
            } else if (conditional.trueCondition.mode === 'Lookup Value') {
              newData[targetCellKey] = 
                dataSource[conditional.trueCondition.result.lookupSheet][row][conditional.trueCondition.result.lookupKey]  ? dataSource[conditional.trueCondition.result.lookupSheet][row][conditional.trueCondition.result.lookupKey] : '';
            } else if (conditional.trueCondition.mode === 'vLookup Name' && conditional.trueCondition.result.lookedupName && 
                      lookupData && lookupData[conditional.trueCondition.result.lookedupName] && 
                      lookupData[conditional.trueCondition.result.lookedupName][conditional.trueCondition.result.lookedupSheetName]) {
              var dresult = lookupData[conditional.trueCondition.result.lookedupName][conditional.trueCondition.result.lookedupSheetName].find((entry) => {
                return entry[conditional.trueCondition.result.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[conditional.trueCondition.result.lookedupName][conditional.trueCondition.result.lookedupSheetName].find((entry) => {
                return entry[conditional.trueCondition.result.lookedupKey].toString() === dataSource[conditional.trueCondition.result.lookupSheet][row][conditional.trueCondition.result.lookupKey].toString();
              });              
              newData[targetCellKey]  = lresult ? lresult[conditional.trueCondition.result.lookedupValue] : (dresult ? dresult[conditional.trueCondition.result.lookedupValue] : '');   
            } else if (conditional.trueCondition.mode === 'Skip Row') {
              ignoreRow = true;
            }
          } else {
            if (conditional.falseCondition.mode === 'Static Value') {
              newData[targetCellKey] = conditional.falseCondition.result.staticValue;
            } else if (conditional.falseCondition.mode === 'Lookup Value') {
              newData[targetCellKey] = dataSource[conditional.falseCondition.result.lookupSheet][row][conditional.falseCondition.result.lookupKey] ? dataSource[conditional.falseCondition.result.lookupSheet][row][conditional.falseCondition.result.lookupKey] : '';
            } else if (conditional.falseCondition.mode === 'vLookup Name' && 
                      conditional.falseCondition.result.lookedupName && 
                      lookupData && lookupData[conditional.falseCondition.result.lookedupName] && 
                      lookupData[conditional.falseCondition.result.lookedupName][conditional.falseCondition.result.lookedupSheetName]) {
              var dresult = lookupData[conditional.falseCondition.result.lookedupName][conditional.falseCondition.result.lookedupSheetName].find((entry) => {
                return entry[conditional.falseCondition.result.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[conditional.falseCondition.result.lookedupName][conditional.falseCondition.result.lookedupSheetName].find((entry) => {
                return entry[conditional.falseCondition.result.lookedupKey].toString() === dataSource[conditional.falseCondition.result.lookupSheet][row][conditional.falseCondition.result.lookupKey].toString();
              });

              newData[targetCellKey]  = lresult ? lresult[conditional.falseCondition.result.lookedupValue] : (dresult ? dresult[conditional.falseCondition.result.lookedupValue] : ''); 
            } else if (conditional.falseCondition.mode === 'Skip Row') {
              ignoreRow = true;
            }
          }
        } else if (config[cellKey].mapMode === 'Switch') {
          var evalResult = undefined;
          var switcher = config[cellKey].switch;
          var conditions = switcher.conditions;
          var left = undefined;
          var right = undefined;
          var switchFound = false;
          
          conditions.map((condition, cindex) => {
            if (switchFound)
              return condition;

            left = undefined;
            if (condition.leftConditionMode === 'Lookup Value')
              left = dataSource[condition.leftConditionValue.lookupSheet][row][condition.leftConditionValue.lookupKey];
            else if (condition.leftConditionMode === 'vLookup Name' && 
                      condition.leftConditionValue.lookedupName && 
                      lookupData && lookupData[condition.leftConditionValue.lookedupName] && 
                      lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName]) {
              var dresult = lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftConditionValue.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[condition.leftConditionValue.lookedupName][condition.leftConditionValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftConditionValue.lookedupKey].toString() === dataSource[condition.leftConditionValue.lookupSheet][row][condition.leftConditionValue.lookupKey].toString();
              });

              left  = lresult ? lresult[condition.leftConditionValue.lookedupValue] : (dresult ? dresult[condition.leftConditionValue.lookedupValue] : ''); 
            }

            right = undefined;
            if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty')) {
              if (condition.rightConditionMode === 'Static Value')
                right = condition.rightConditionValue.staticValue;
              else if (condition.rightConditionMode === 'Lookup Value')
                right = dataSource[condition.rightConditionValue.lookupSheet][row][condition.rightConditionValue.lookupKey];
            }

            try {
              evalResult = evaluateCondition(left, right, condition);
            } catch (error) {
              errors.push('INVALID evaluateCondition on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                          ' with - left:  ' + left + ' right: ' + right + ' conditionType: ' + condition.conditionType + 
                          ' stringPosition: ' + condition.stringPosition + ' stringLength: ' + condition.stringLength +
                          ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
            }
            if (evalResult) {
              switchFound = true;
              if (condition.resultMode === 'Static Value') {
                newData[targetCellKey] = condition.resultValue.staticValue;
              } else if (condition.resultMode === 'Lookup Value') {
                newData[targetCellKey] = 
                  dataSource[condition.resultValue.lookupSheet][row][condition.resultValue.lookupKey]  ? dataSource[condition.resultValue.lookupSheet][row][condition.resultValue.lookupKey] : '';
              } else if (condition.resultMode === 'vLookup Name' && 
                      condition.resultValue.lookedupName && 
                      lookupData && lookupData[condition.resultValue.lookedupName] && 
                      lookupData[condition.resultValue.lookedupName][condition.resultValue.lookedupSheetName]) {
                var dresult = lookupData[condition.resultValue.lookedupName][condition.resultValue.lookedupSheetName].find((entry) => {
                  return entry[condition.resultValue.lookedupKey].toString() === 'default';
                });
                var lresult = lookupData[condition.resultValue.lookedupName][condition.resultValue.lookedupSheetName].find((entry) => {
                  return entry[condition.resultValue.lookedupKey].toString() === dataSource[condition.resultValue.lookupSheet][row][condition.resultValue.lookupKey].toString();
                });

                newData[targetCellKey]  = lresult ? lresult[condition.resultValue.lookedupValue] : (dresult ? dresult[condition.resultValue.lookedupValue] : ''); 
              } else if (condition.resultMode === 'Emptry Value') {
                  newData[targetCellKey] = '';
              } else if (condition.resultMode === 'Skip Row') {
                ignoreRow = true;
              }
            }

            return condition;            
          });

          if (!switchFound && switcher.defaultCondition) {
            if (switcher.defaultCondition.resultMode === 'Static Value') {
              newData[targetCellKey] = switcher.defaultCondition.resultValue.staticValue;
            } else if (switcher.defaultCondition.resultMode === 'Lookup Value') {
              newData[targetCellKey] = 
                dataSource[switcher.defaultCondition.resultValue.lookupSheet][row][switcher.defaultCondition.resultValue.lookupKey]  ? dataSource[switcher.defaultCondition.resultValue.lookupSheet][row][switcher.defaultCondition.resultValue.lookupKey] : '';
            } else if (switcher.defaultCondition.resultMode === 'vLookup Name' && 
                      switcher.defaultCondition.resultValue.lookedupName && 
                      lookupData && lookupData[switcher.defaultCondition.resultValue.lookedupName] && 
                      lookupData[switcher.defaultCondition.resultValue.lookedupName][switcher.defaultCondition.resultValue.lookedupSheetName]) {
              var dresult = lookupData[switcher.defaultCondition.resultValue.lookedupName][switcher.defaultCondition.resultValue.lookedupSheetName].find((entry) => {
                return entry[switcher.defaultCondition.resultValue.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[switcher.defaultCondition.resultValue.lookedupName][switcher.defaultCondition.resultValue.lookedupSheetName].find((entry) => {
                return entry[switcher.defaultCondition.resultValue.lookedupKey].toString() === dataSource[switcher.defaultCondition.resultValue.lookupSheet][row][switcher.defaultCondition.resultValue.lookupKey].toString();
              });

              newData[targetCellKey]  = lresult ? lresult[switcher.defaultCondition.resultValue.lookedupValue] : (dresult ? dresult[switcher.defaultCondition.resultValue.lookedupValue] : ''); 
            }
          }

          if (switcher.final && !ignoreRow) {
            evalResult = newData[targetCellKey];
            var tag = moment().milliseconds();
            var code = "function fn_" + tag + "(evalResult)" + switcher.final.code + "\nfn_" + tag + "(\"" + evalResult + "\");";
            var result = 'Not Evaluated';
            try {
              if (evalResult !== undefined)
                eval(code);
            } catch (error) {
              evalError = error;
              evalCondition = conditions[0];
              evalErrorType = 'switch'              
            }

            if (result === 'Skip Row') {
              ignoreRow = true;
            } else if (result !== 'Not Evaluated') {
              newData[targetCellKey] = result;              
            }
          }          
        } else if (config[cellKey].mapMode === 'Computed') {
          var evalResult = undefined;
          var computedResults = [];
          var computed = config[cellKey].computed;
          var conditions = computed.conditions;
          var left = undefined;
          var right = undefined;
          var leftIsDate = undefined;
          var rightIsDate = undefined;

          evalRow = rowData._rowNum;

          conditions.map((condition, cindex) => {
            leftIsDate = condition.leftComputedMode === 'Lookup Value' && map.sourceMapValidation !== undefined && 
              map.sourceMapValidation[condition.leftComputedValue.lookupSheet] !== undefined && 
              map.sourceMapValidation[condition.leftComputedValue.lookupSheet][condition.leftComputedValue.lookupKey] !== undefined && map.sourceMapValidation[condition.leftComputedValue.lookupSheet][condition.leftComputedValue.lookupKey].type === 'Date';
            left = undefined;
            if (condition.leftComputedMode === 'Static Value')
              left = condition.leftComputedValue.staticValue;
            else if (condition.leftComputedMode === 'Lookup Value')
              left = dataSource[condition.leftComputedValue.lookupSheet][row][condition.leftComputedValue.lookupKey];
            else if (condition.leftComputedMode === 'vLookup Name' && 
                      condition.leftComputedValue.lookedupName && 
                      lookupData && lookupData[condition.leftComputedValue.lookedupName] && 
                      lookupData[condition.leftComputedValue.lookedupName][condition.leftComputedValue.lookedupSheetName]) {
              var dresult = lookupData[condition.leftComputedValue.lookedupName][condition.leftComputedValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftComputedValue.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[condition.leftComputedValue.lookedupName][condition.leftComputedValue.lookedupSheetName].find((entry) => {
                return entry[condition.leftComputedValue.lookedupKey].toString() === dataSource[condition.leftComputedValue.lookupSheet][row][condition.leftComputedValue.lookupKey].toString();
              });

              left  = lresult ? lresult[condition.leftComputedValue.lookedupValue] : (dresult ? dresult[condition.leftComputedValue.lookedupValue] : ''); 
            }

            rightIsDate = condition.rightComputedMode === 'Lookup Value' && map.sourceMapValidation !== undefined && 
            map.sourceMapValidation[condition.rightComputedValue.lookupSheet] !== undefined && 
            map.sourceMapValidation[condition.rightComputedValue.lookupSheet][condition.rightComputedValue.lookupKey] !== undefined && map.sourceMapValidation[condition.rightComputedValue.lookupSheet][condition.rightComputedValue.lookupKey].type === 'Date';
            right = undefined;

            if (condition.rightComputedMode === 'Static Value')
              right = condition.rightComputedValue.staticValue;
            else if (condition.rightComputedMode === 'Lookup Value')
              right = dataSource[condition.rightComputedValue.lookupSheet][row][condition.rightComputedValue.lookupKey];
            else if (condition.rightComputedMode === 'vLookup Name' && 
                      condition.rightComputedValue.lookedupName && 
                      lookupData && lookupData[condition.rightComputedValue.lookedupName] && 
                      lookupData[condition.rightComputedValue.lookedupName][condition.rightComputedValue.lookedupSheetName]) {
              var dresult = lookupData[condition.rightComputedValue.lookedupName][condition.rightComputedValue.lookedupSheetName].find((entry) => {
                return entry[condition.rightComputedValue.lookedupKey].toString() === 'default';
              });
              var lresult = lookupData[condition.rightComputedValue.lookedupName][condition.rightComputedValue.lookedupSheetName].find((entry) => {
                return entry[condition.rightComputedValue.lookedupKey].toString() === dataSource[condition.rightComputedValue.lookupSheet][row][condition.rightComputedValue.lookupKey].toString();
              });

              right = lresult ? lresult[condition.rightComputedValue.lookedupValue] : (dresult ? dresult[condition.rightComputedValue.lookedupValue] : ''); 
            }
              
            try {
              computedResults[cindex] = evaluateComputed(left, right, leftIsDate, rightIsDate, condition.conditionType, 
                                                      condition.computedJoiner, condition.stringPosition, condition.stringLength);
            } catch (error) {
              errors.push('INVALID evaluateComputed on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                          ' with - left:  ' + left + ' leftIsDate: ' + leftIsDate + 
                          ' right: ' + right + ' rightIsDate: ' + rightIsDate + ' conditionType: ' + condition.conditionType + 
                          ' joiner: ' + condition.computedJoiner,
                          ' stringPosition: ' + condition.stringPosition + ' stringLength: ' + condition.stringLength +
                          ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
            }
          })

          if (conditions.length === 1)
            evalResult = computedResults[0];
          else {
            evalResult = computedResults[0];
            for (var cindex=1; cindex<computedResults.length; cindex++) {
              leftIsDate = conditions[cindex].leftComputedMode === 'Lookup Value' && 
                              map.sourceMapValidation !== undefined && 
                              map.sourceMapValidation[conditions[cindex].leftComputedValue.lookupSheet] !== undefined && 
                              map.sourceMapValidation[conditions[cindex].leftComputedValue.lookupSheet][conditions[cindex].leftComputedValue.lookupKey] !== undefined &&
                              map.sourceMapValidation[conditions[cindex].leftComputedValue.lookupSheet][conditions[cindex].leftComputedValue.lookupKey].type === 'Date';
              
              rightIsDate = conditions[cindex].rightComputedMode === 'Lookup Value' && 
                                map.sourceMapValidation !== undefined && 
                                map.sourceMapValidation[conditions[cindex].rightComputedValue.lookupSheet] !== undefined &&  
                                map.sourceMapValidation[conditions[cindex].rightComputedValue.lookupSheet][conditions[cindex].rightComputedValue.lookupKey] !== undefined &&
                                map.sourceMapValidation[conditions[cindex].rightComputedValue.lookupSheet][conditions[cindex].rightComputedValue.lookupKey].type === 'Date';
              
              try {
                evalResult = evaluateComputeConnected(evalResult, computedResults[cindex], leftIsDate, 
                              rightIsDate, conditions[cindex-1].connector, conditions[cindex-1].concatConnector);
              } catch (error) {
                errors.push('INVALID evaluateComputeConnected on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                            ' with - left:  ' + evalResult + ' leftIsDate: ' + leftIsDate + 
                            ' right: ' + computedResults[cindex] + ' rightIsDate: ' + rightIsDate + 
                            ' connector: ' + conditions[cindex-1].connector, 
                            ' concat connector: ' + conditions[cindex-1].concatConnector,
                            ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
              }
            }
          }
                    
          if (computed.final) {
            var tag = moment().milliseconds();
            var code = "function fn_" + tag + "(evalResult)" + computed.final.code + "\nfn_" + tag + "(\"" + evalResult + "\");";
            var result = 'Not Evaluated';
            try {
              if (evalResult !== undefined)
                eval(code);
            } catch (error) {
              evalError = error;
              evalCondition = conditions[0];
              evalErrorType = 'computed'
            }

            if (result === 'Skip Row') {
              ignoreRow = true;
            } else if (result !== 'Not Evaluated') {
              newData[targetCellKey] = result;              
            } else {
              newData[targetCellKey] = evalResult;              
            }
          } else {
            newData[targetCellKey] = evalResult;          
          }
        } else if (config[cellKey].mapMode === 'Aggregated') {
          var evalResult = undefined;
          var aggregatedResults = [];
          var aggregated = config[cellKey].aggregated;
          var conditions = aggregated.conditions;

          conditions.map((condition, cindex) => { 
            var dataset = [];
            var evalResult = undefined;
            var evalRecordsCount = undefined;
            if (anchor.distinctRows) {          
              var anchorKey = _.findKey(map.sourceMap[anchor.sourceSheet], 
                function (o) { return o === anchor.sourceColumn});

              var aggregateOn = dataSource[condition.leftAggregatedValue.lookupSheet][row][anchorKey];
              dataset = _data[condition.leftAggregatedValue.lookupSheet].filter((_row) => {
                return _row[anchorKey] === aggregateOn;                
              });

              evalRecordsCount = dataset.length;
              // evalRow = dataset[0]._rowNum;
              dataset = dataset.filter((row) => {
                return !evaluateSkipConditions(row, aggregated.skipConditions, anchor.sourceSheet,
                                                    targetSheet, evalTargetCell, errors);
              })

              if (dataset.length > 0) {              
                var valueset = dataset.map((_data) => {
                  return Number(_data[condition.leftAggregatedValue.lookupKey]) ? 
                          Number(_data[condition.leftAggregatedValue.lookupKey]) : 0;
                });
                
                try {
                  aggregatedResults[cindex] = evaluateAggregated(valueset, condition.conditionType);
                } catch (error) {
                  errors.push('INVALID evaluateAggregated on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                              'valueSet Length: ' + valueset.length + ' conditionType: ' + condition.conditionType,
                              ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
                }
              } else if (evalRecordsCount > 0) {
                aggregatedResults[cindex] = 0;
              }
            } else if (anchor.distinctCompositeRows) {
              anchorCompositeValues.map((_row, _index) => {
                if (_row === anchorCompositeRowValues[row])
                  dataset.push(_data[condition.leftAggregatedValue.lookupSheet][_index]);
                return _row;
              });

              evalRecordsCount = dataset.length;
              
              dataset = dataset.filter((row) => {
                return !evaluateSkipConditions(row, aggregated.skipConditions, anchor.sourceSheet,
                                                    targetSheet, evalTargetCell, errors);
              })

              // evalRow = dataset[0]._rowNum;
              if (dataset.length > 0) {              
                var valueset = dataset.map((_vdata) => {
                  return _vdata[condition.leftAggregatedValue.lookupKey] ? _vdata[condition.leftAggregatedValue.lookupKey] : 0;
                });
                
                try {
                  aggregatedResults[cindex] = evaluateAggregated(valueset, condition.conditionType);
                } catch (error) {
                  errors.push('INVALID evaluateAggregated on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                              'valueSet Length: ' + valueset.length + ' conditionType: ' + condition.conditionType,
                              ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
                }
               } else if (evalRecordsCount > 0) {
                aggregatedResults[cindex] = 0;
              }
            }
          });

         if (conditions.length === 1)
            evalResult = aggregatedResults[0];
          else {
            evalResult = aggregatedResults[0];
            for (var cindex=1; cindex<aggregatedResults.length; cindex++) {
              try {
                evalResult = evaluateComputeConnected(evalResult, aggregatedResults[cindex], 
                                false, false, conditions[cindex-1].connector);
              } catch (error) {
                errors.push('INVALID evaluateComputeConnected on - ' + anchor.sourceSheet + ' @row: ' + rowData._rowNum + 
                            ' with - left:  ' + evalResult + ' leftIsDate: ' + false + 
                            ' right: ' + computedResults[cindex] + ' rightIsDate: ' + false + 
                            ' connector: ' + conditions[cindex-1].connector,
                            ', while working on ' + evalTargetCell + ' of ' + targetSheet);             
              }
            }
          }          

          if (aggregated.final) {
            var tag = moment().milliseconds();
            var code = "function fn_" + tag + "(evalResult)" + aggregated.final.code + "\nfn_" + tag + "(" + evalResult + ");";
            var result = 'Not Evaluated';
            try {
              if (evalResult !== undefined)
                eval(code);
              else
                result = 'Skip Row';
            } catch (error) {
              evalError = error;
              evalCondition = conditions[0];
              evalErrorType = 'aggregated'
            }

            if (result === 'Skip Row') {
              ignoreRow = true;
            } else if (result !== 'Not Evaluated') {
              newData[targetCellKey] = result;              
            } else {
              newData[targetCellKey] = evalResult;              
            }
          } else {
            newData[targetCellKey] = evalResult;          
          }
        } else if (config[cellKey].mapMode === 'Custom') {
          var tag = moment().milliseconds();
          var code = "function fn_" + tag + "()" + config[cellKey].custom.conditions[0].code + "\nfn_" + tag + "();";
          var result = 'Not Evaluated';
          evalRow = rowData._rowNum;

          try {
            eval(code);
          } catch (error) {
            evalError = error;
            evalCondition = 'Custom';
            evalErrorType = 'custom'
          }
          if (result === 'Skip Row') {
            ignoreRow = true;
          } else {
            newData[targetCellKey] = result;              
          }
        }
      })

      if (!ignoreRow) {
        targetData[targetSheet].push(newData);
      }
    }

    // if (map.mapPostprocessor && map.mapPostprocessor[targetSheet])
    // targetData[targetSheet] = runPostprocessor(map.mapPostprocessor[targetSheet], anchor.sourceSheet, targetData[targetSheet]);         
  });
  
  return { valid: !errors.length, errors: errors, data: targetData};
}

const getSheets = (map) => {
  var sheets = [];
  Object.keys(map.sourceMap).map((sheetName) => {
    var sheetMap = {};
    Object.keys(map.sourceMap[sheetName]).map((key) => {
      sheetMap[key] = key;
    })

    var _sheet = {
      name: sheetName,
      columnToKey: sheetMap
    };

    if (map.sourcePreprocessor && Object.keys(map.sourcePreprocessor).indexOf(sheetName) >= 0) {
      var skipProcessor = map.sourcePreprocessor[sheetName].find((preprocessor) => {
        return preprocessor.preprocessorType === 'Skip first N rows';
      })

      if (skipProcessor) 
        _sheet.header = { rows: skipProcessor.skipRows };
    }

    sheets.push(_sheet);
  })

  return sheets;
}

const sleep = (delay) => {
  var start = new Date().getTime();
  while (new Date().getTime() < start + delay);
}

const saveOutput = (jobId, map, data, name) => {
  logger.info('Will save output');
  const wb = xlsx.utils.book_new();
  Object.keys(data).map((sheet) => {
    if (data[sheet] === undefined)
      return;
      
    var newSheet = xlsx.utils.aoa_to_sheet(data[sheet]); //, {header: Object.keys(data[sheet]), skipHeader:false, origin: 0});

    xlsx.utils.book_append_sheet(wb, newSheet, sheet);
  });

  const outputFilePath = process.env.FILESDIR + '/jobs/' + jobId + '/' + name + '.xlsx';

  xlsx.writeFile(wb, outputFilePath, {compression: true});
}
 
const saveIntermediateOutput = (jobId, map, data, name) => {
  logger.info('Will save output');
  const wb = xlsx.utils.book_new();
  Object.keys(data).map((sheet) => {
    if (data[sheet] === undefined)
      return;
      
    var newSheet = xlsx.utils.json_to_sheet(data[sheet], {skipHeader: true}); //, {header: Object.keys(data[sheet]), skipHeader:false, origin: 0});

    xlsx.utils.book_append_sheet(wb, newSheet, sheet);
  });

  const outputFilePath = process.env.FILESDIR + '/jobs/' + jobId + '/' + name + '.xlsx';

  xlsx.writeFile(wb, outputFilePath, {compression: true});
}

const runMapperTransformer = (rawSourceData, lookupData, job, map) => {
  var sheets = getSheets(map);
  sheets.map((sheet) => {
    if (map.sourcePreprocessor && Object.keys(map.sourcePreprocessor).indexOf(sheet.name) >= 0) {
      var skipProcessor = map.sourcePreprocessor[sheet.name].find((preprocessor) => {
        return preprocessor.preprocessorType === 'Skip after N rows';
      })

      if (skipProcessor) {
        var _skipData = rawSourceData[sheet.name].slice(0, skipProcessor.skipAfterRows);
        rawSourceData[sheet.name] = _skipData;
      }

      skipProcessor = map.sourcePreprocessor[sheet.name].find((preprocessor) => {
        return preprocessor.preprocessorType === 'Skip last N rows';
      })

      if (skipProcessor) {
        var _skipData = rawSourceData[sheet.name].slice(0, rawSourceData[sheet.name].length - skipProcessor.skipLastRows);
        rawSourceData[sheet.name] = _skipData;
      }      
    }
  })

  if (!map.mapConfig) {
    logger.error('Mapping not defined');
    saveJob(job, 'FAILED', 'Mapping failed', 'Mapping not defined');
    process.exit(1);
  }

  var sourceValidity = runSourceValidation(map, rawSourceData);
  if (!sourceValidity.valid) {
    logger.error('Source data validation failed on the input file with (', sourceValidity.errors.length + ') errors');
    sourceValidity.errors.map((error) => {
      logger.info(error);
    });
    saveJob(job, 'FAILED', 'Mapping failed', 'Source validation failed');
    process.exit(1);
  }

  logger.info('All seem to be well on the source file, will proceed further later');

  var sourceData = sourceValidity.data;

  var mapResult = runMapping(map, sourceData, lookupData);
  if (!mapResult.valid) {
    logger.error('Mapping failed for the input file with (', mapResult.errors.length, ') errors');
    mapResult.errors.map((error) => {
      logger.info(error);
    });
    saveJob(job, 'FAILED', 'Mapping failed', 'Mapping failed');
    process.exit(1);
  }

  return mapResult;
}

const isDiffRequired = (map) => {
  if (!map.diffSupported)
    return false;

  if (!map.diffProcessing || !Object.keys(map.diffProcessing).length)
    return false;

  var required = false;
  Object.keys(map.diffProcessing).map((processor) => {
    if (map.diffProcessing[processor] && map.diffProcessing[processor] !== 'No Action')
      required = true;
  });

  return required;
}

const processMerge = (result, data, lookupData, job, map) => {
  var jobId = job.id;

  if (map.mergeFiles && job.mergeFiles && job.mergeFiles.length > 0) {
    var sheets = getSheets(map);

    for (var index=0; index<job.mergeFiles.length; index++) {
      logger.info('Running merge on ' + job.mergeFiles[index]);

      saveJob(currentJob.job, 'RUNNING', 'Merging file ' + job.mergeFiles[index]);

      const excelToJson = require('convert-excel-to-json');
      try {
        data = excelToJson({
          // sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/chained-' + loop + '.xlsx',
          sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/' + job.mergeFiles[index],
        });
      } catch (error) {
        logger.error('ERROR: loading input file failed - ', error)
        saveJob(job, 'FAILED', 'Mapping failed', 'Error reading input file(s)');
        process.exit(1);
      }

      var mergeResult = runMapperTransformer(data, lookupData, job, map);
      if (!mergeResult.valid) {
        logger.error('Mapping failed while executing mapper for the input file with (', mergeResult.errors.length, ') errors');
        mergeResult.errors.map((error) => {
          logger.info(error);
        });
        saveJob(job, 'FAILED', 'Mapping failed', 'Mapping failed');
        process.exit(1);
      }

      var sheetData =  undefined;
      Object.keys(mergeResult.data).map((sheet, index) => {
        sheetData = result.data[sheet] ? result.data[sheet] : [];
        sheetData = sheetData.length > 0 ? sheetData.concat(mergeResult.data[sheet].slice(1)) : 
                                                sheetData.concat(mergeResult.data[sheet]);
        result.data[sheet] = sheetData;
      });

      saveIntermediateOutput(jobId, map, result.data, 'merged-'+(index+1));
    }
  } else {
    logger.info('No merge inputs found for ' + map.name );
  }
}

const processChainedMaps = (result, data, lookupData, job, map, parentMap, loop) => {
  var jobId = job.id;

  if (map.chainMaps && map.chainedMaps && map.chainedMaps.length > 0) {
    logger.info('Running chained maps of ' + map.name);

    for (var index=0; index<map.chainedMaps.length; index++) {
      saveJob(currentJob.job, 'RUNNING', 'Executing chained map - ' + map.chainedMaps[index].name);
      if (!parentMap.chainWaterfall) { 
        var sheets = getSheets(parentMap);

        const excelToJson = require('convert-excel-to-json');
        try {
          data = excelToJson({
            sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/' + job.inputFile,
            sheets: sheets
          });
        } catch (error) {
          logger.error('ERROR: loading input file failed - ', error)
          saveJob(job, 'FAILED', 'Mapping failed', 'Error reading input file(s)');
          process.exit(1);
        }
      } else { 
        // SChand - all chained child maps should obey the parent waterfall settings
        data = result.data;
      }
    
      logger.info('\n\n\n');
      logger.info('Fetching map chained mapper by specified name: ', map.chainedMaps[index].name);
      var chainedMap = getMapById(map.chainedMaps[index].id);
      if (!chainedMap) {
        logger.error('Could not find the chained mapper by name referred in the job: ', job.mapName);
        saveJob(job, 'FAILED', 'Mapping failed', 'Missing info on chained map');
        process.exit(1);
      }

      var chainedResult = runMapperTransformer(data, lookupData, job, chainedMap);
      if (!chainedResult.valid) {
        logger.error('Mapping failed while executing chained mapper for the input file with (', chainedResult.errors.length, ') errors');
        chainedResult.errors.map((error) => {
          logger.info(error);
        });
        saveJob(job, 'FAILED', 'Mapping failed', 'Mapping failed');
        process.exit(1);
      }

      if (map.chainWaterfall)
        result.data = {};

      var sheetData =  undefined;
      Object.keys(chainedResult.data).map((sheet, index) => {
        sheetData = result.data[sheet] ? result.data[sheet] : [];
        sheetData = sheetData.length > 0 ? sheetData.concat(chainedResult.data[sheet].slice(1)) : 
                                                sheetData.concat(chainedResult.data[sheet]);
        result.data[sheet] = sheetData;
      });

      saveIntermediateOutput(jobId, chainedMap, result.data, 'chained-'+loop+'-'+(index+1));

      if (chainedMap.chainMaps && chainedMap.chainedMaps && chainedMap.chainedMaps.length > 0)
        processChainedMaps(result, result.data, lookupData, job, chainedMap, map, loop);      
    }
  } else {
    logger.info('No chained maps found for ' + map.name );
  }
}

const currentJob = {};

const init = async () => {
  var args = process.argv;
  logger.info('ARGS', args);
  // jobId
  logger.info(args);
  if (args.length < 3) {
    logger.error('Invalid or missing arguments');
    process.exit(1);
  }

  var jobId = args[2];
  logger.info('Fetching job by specified id: ', jobId);
  var job = getJob(jobId);
  if (!job) {
    logger.error(`Could not find the job by specified id: {args[2]}`);
    process.exit(1);
  }
  saveJob(job, 'RUNNING', '');

  currentJob.job = job;

  logger.info('Fetching map by specified name: ', job.mapName);
  var map = getMapById(job.mapId);
  if (!map) {
    logger.error('Could not find the mapper by name referred in the job: ', job.mapName);
    saveJob(job, 'FAILED', 'Mapping failed', 'Missing map details');
    process.exit(1);
  }

  saveJob(job, 'RUNNING', 'Getting ready for transformation...');

  logger.info('Loading input file: ', job.inputFile);

  var sheets = getSheets(map);

  if (!fs.existsSync(process.env.FILESDIR + '/jobs/' + job.id + '/' + job.inputFile)) {
    logger.error('Missing input file');
    saveJob(job, 'FAILED', 'Mapping failed', 'Missing input file');
    process.exit(1);
  }

  const excelToJson = require('convert-excel-to-json');
  // construct source map
  var rawSourceData = undefined;
  if (job.useSheetNumbers) {
    try {
      rawSourceData  = excelToJson({
        sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/' + job.inputFile,
      });

      var sheetNames = Object.keys(rawSourceData);
      sheetNames.map((sheet, index) => {
        rawSourceData['NEW-' + index] = rawSourceData[sheet];
        delete rawSourceData[sheet];
      });
      sheets.map((sheet, index) => {
        rawSourceData[sheet.name] = rawSourceData['NEW-' + index];
        delete rawSourceData['NEW-' + index];
      });

      Object.keys(rawSourceData).map((sheet) => {
        if (!rawSourceData[sheet])
          rawSourceData[sheet] = [];
      })

      saveJob(job, 'RUNNING', 'Loaded input file...');
    } catch (error) {
      logger.error('ERROR: loading input file failed - ', error)
      saveJob(job, 'FAILED', 'Mapping failed', 'Error reading input file(s)');
      process.exit(1);
    }
  } else {
    try {
      rawSourceData  = excelToJson({
        sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/' + job.inputFile,
        sheets: sheets
      });
      saveJob(job, 'RUNNING', 'Loaded input file...');
    } catch (error) {
      logger.error('ERROR: loading input file failed - ', error)
      saveJob(job, 'FAILED', 'Mapping failed', 'Error reading input file(s)');
      process.exit(1);
    }
  }

  if (map.diffMandatory && !fs.existsSync(process.env.FILESDIR + '/jobs/' + job.id + '/' + job.diffFile)) {
    logger.error('ERROR: diff processing is marked as mandatory, but missing diff file');
    saveJob(job, 'FAILED', 'Mapping failed', 'Error reading diff file');
    process.exit(1);    
  }

  var lookupData = undefined;
  if (job.lookupFiles && Object.keys(job.lookupFiles).length) {
    saveJob(job, 'RUNNING', 'Loading lookup data');
    Object.keys(job.lookupFiles).map((lookupName) => {
      saveJob(job, 'RUNNING', 'Loading lookup data for ' + lookupName);
      logger.info('Loading look file for "' + lookupName + '": ', job.lookupFiles[lookupName]);
      if (job.lookupFiles[lookupName] === job.inputFile) {
        lookupData = lookupData ? lookupData : {};
        lookupData[lookupName] = rawSourceData;   
        return lookupName;       
      }

      if (!fs.existsSync(process.env.FILESDIR + '/jobs/' + job.id + '/LU-' + lookupName + '-' + job.lookupFiles[lookupName])) {
        logger.error('Missing lookup file for - ' + job.lookupFiles[lookupName]);
        saveJob(job, 'FAILED', 'Mapping failed', 'Missing lookup file for - ' + job.lookupFiles[lookupName]);
        process.exit(1);
      }

      const excelToJson = require('convert-excel-to-json');
      var rawLookupData = undefined;
      try {
        rawLookupData  = excelToJson({
          sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/LU-' + lookupName + '-' + job.lookupFiles[lookupName],
        });
        saveJob(job, 'RUNNING', 'Loaded lookup file...');
      } catch (error) {
        logger.error('ERROR: loading look file for "' + lookupName + '" failed - ', error);
        saveJob(job, 'FAILED', 'Mapping failed', 'Error reading lookup file(s)');
        process.exit(1);
      }

      lookupData = lookupData ? lookupData : {};
      lookupData[lookupName] = rawLookupData;
      return lookupName;       
    });
  }
  
  try {
    var result = runMapperTransformer(rawSourceData, lookupData, job, map);
    if (!result.valid) {
      logger.error('Mapping failed while executing mapper for the input file with (', result.errors.length, ') errors');
      result.errors.map((error) => {
        logger.info(error);
      });
      saveJob(job, 'FAILED', 'Mapping failed', 'Mapping failed');
      process.exit(1);
    }

    if (map.chainMaps) {
      saveIntermediateOutput(jobId, result, result.data, 'chained-1');
      processChainedMaps(result, result.data, lookupData, job, map, map, 1);
    }

    if (map.mergeFiles) {
      saveIntermediateOutput(jobId, result, result.data, 'merged-1');
      processMerge(result, result.data, lookupData, job, map);;
    }

    if (job.diffFile && map.diffMandatory &&
        !fs.existsSync(process.env.FILESDIR + '/jobs/' + job.id + '/' + job.diffFile)) {
      logger.error('Missing diff file');
      saveJob(job, 'FAILED', 'Mapping failed', 'Missing diff file');
      process.exit(1);
    }

    if (job.diffFile && fs.existsSync(process.env.FILESDIR + '/jobs/' + job.id + '/' + job.diffFile)) {
      saveJob(job, 'RUNNING', 'Loading diff file');
      const excelToJson = require('convert-excel-to-json');
      var diffData = undefined;
      try {
        diffData  = excelToJson({
          sourceFile: process.env.FILESDIR + '/jobs/' + job.id + '/' + job.diffFile,
        });
      } catch (error) {
        logger.error('ERROR: loading diff file failed - ', error)
        saveJob(job, 'FAILED', 'Mapping failed', 'Error reading diff file');
        process.exit(1);
      }

      var diffResult = runDetectDelta(result.data, diffData, lookupData, map);
      if (!diffResult.valid) {
        logger.error('Diff of input and last upload data failed', result.errors.length);
        result.errors.map((error) => {
          logger.info(error);
        });
        saveJob(job, 'FAILED', 'Mapping failed', 'Error running delta detection (diff) processing');
        process.exit(1);
      }
    }
     
    saveIntermediateOutput(jobId, map, result.data, 'mapped');      

    var targetValidity = runTargetValidation(map, result.data);
    if (!targetValidity.valid) {
      logger.error('Target data validation failed on the output file with (', targetValidity.errors.length + ') errors');
      targetValidity.errors.map((error) => {
        logger.info(error);
      });
      saveJob(job, 'FAILED', 'Mapping failed', 'Target validation failed');
      process.exit(1);
    }
    
    logger.info('Successfully completed');
    saveJob(job, 'SUCCESS', 'Completed successfully');
      
    process.exit(0);  
  } catch (error) {
    logger.error('ERROR: mapping failed  - ', error)
    logger.error('ERROR: mapping failed  - ', error.stack)

    saveJob(job, 'FAILED', 'Mapping Failed', 'Mapping failed');
    process.exit(1);    
  }
};


init();
