import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import uuidv4 from 'uuid/v4'; 
import PropTypes from 'prop-types';

import DialogModal from '../../components/dialog';
import DCMapper from './DCMapper';
import DCSourceValidation from './DCSourceValidation';
import DCMapAndTransform from './DCMapAndTransform';
import DCTargetValidation from './DCTargetValidation';
import DCPostProcessing from './DCPostProcessing';
import DCSummary from './DCSummary';
import LoaderPage from '../../components/loader';

const _ = require('lodash');
const { makeRequest } = require("../../utils/requestUtils");

class DesignContainer extends React.Component {
  static propTypes = {
    history: PropTypes.shape().isRequired,
  }

  constructor(props) {
    super(props);
    var id = this.props.match.params.id ? this.props.match.params.id : uuidv4();
    this.state = {
      abondon: undefined,
      error: undefined,
      result: null,
      sourceFileUploadInProgress: false,
      sourceFileReady: false,
      sourceFileError: undefined,
      sourceFile: undefined,
      targetFileUploadInProgress: false,
      targetFileReady: false,
      targetFileError: undefined,
      targetFile: undefined,
      ready: false,
      phase: 0,
      totalPhases: 6,
      newConfirm: false,
      validated: false,
      map: { id },
      designId: id,
      expanded: {},
    };
  }

  componentDidMount() {
    if (this.props.match.params.id)
      this.loadMapState(this.props.match.params.id);
    else
      this.setState({ready: true});
  }

  loadMapState = (id, phase = undefined) => {
    if (id !== undefined) {
      var _this = this;
      makeRequest('get', '/api/mapper/map?id=' + id)
        .then((result) => {
          if (result.data.success) {
            var map = result.data.map;

            _this.setState({
              error: undefined,
              result: null,
              sourceFileUploadInProgress: false,
              sourceFileReady: map.sourceFile ? true : false,
              sourceFileError: undefined,
              sourceFile: map.sourceFile,
              targetFileUploadInProgress: false,
              targetFileReady: map.targetFile ? true : false,
              targetFileError: undefined,
              targetFile: map.targetFile,
              ready: true,
              phase: phase === undefined ? 0 : phase,
              totalPhases: 6,
              newConfirm: false,
              validated: false,
              map: map,
              designId: map.id ,
              expanded: {},
            });
          } 
          return;        
        }).catch((error) => {
          this.setState({ready: true, error});          
          return;
        });
    }
  }

  updateAndLoadMapState = (id, state = {}, phase = undefined) => {
    if (id !== undefined) {
      var _this = this;
      makeRequest('get', '/api/mapper/map?id=' + id)
        .then((result) => {
          if (result.data.success) {
            var map = result.data.map;

            _this.setState({
              ...state,
              phase: phase === undefined ? 0 : phase,
              map: map,
              designId: map.id ,     
              sourceFile: map.sourceFile,
              targetFile: map.targetFile,                               
            });

            _this._validate(phase);
          } 
          return;        
        }).catch((error) => {
          return;
        });
    }
  }

  saveAndLoadMapState = (id, state = {}, phase = undefined) => {
    if (id !== undefined) {
      this._save();
      var _this = this;
      makeRequest('get', '/api/mapper/map?id=' + id)
        .then((result) => {
          if (result.data.success) {
            var map = result.data.map;

            _this.setState({
              ...state,
              phase: phase === undefined ? 0 : phase,
              map: map,
              designId: map.id ,     
              sourceFile: map.sourceFile,
              targetFile: map.targetFile,                               
            });

            _this._validate(phase);
          } 
          return;        
        }).catch((error) => {
          return;
        });
    }
  }  

  downloadFile = (e) => {
    e.preventDefault();
    window.location = '/api/mapper/download?id='+this.state.designId;
  }


  next = (e) => {
    var invalid = [];
    e.preventDefault();

    if (this.state.phase === 0 && this.state.map.namedlookups) {
      if (!this.state.map.namedlookupsList || !this.state.map.namedlookupsList.length) {
        invalid.push("Invalid Map Processor: Named lookups is defined, but no lookup names list specified");
        this.setState({validated: false, error: invalid});
        return;
      }
    }

    if (this.state.phase === 0 && this.state.customMapping) {
      if (!this.state.customMappingFile || !this.state.customMappingFile.length) {
        invalid.push("Invalid Map Processor: Custom map processing is defined, but there is no implementation file specified");
        this.setState({validated: false, error: invalid});
        return;
      }        
    }      
  
    if (this.state.phase+1 === this.state.totalPhases)
      return;

    var nextPhase = this.state.phase + 1;
    sessionStorage.removeItem('tabIndex');
    this.setState({phase: nextPhase, validated: undefined, error: undefined});
  }
  
  prev = (e) => {
    e.preventDefault();
    if (this.state.phase === 0)
      return;
      
    var prevPhase = this.state.phase - 1;
    sessionStorage.removeItem('tabIndex');
    this.setState({phase: prevPhase, validated: undefined, error: undefined});
  }

  jumpto = (phase) => {
    sessionStorage.removeItem('tabIndex');
    this.setState({phase: phase, validated: undefined, error: undefined});
  }

  _validate = (phase) => {
    var invalid = [];
    var _this = this;
    var lookupNames = [];
    var errorLength = undefined;

    if (_this.state.map.namedlookups && (!_this.state.map.namedlookupsList || !_this.state.map.namedlookupsList.length)) {
      invalid.push("Warning: Missing named lookups");
      this.setState({validated: false, error: invalid});
      return false;
    }      

    if (_this.state.map.customMapping && (!_this.state.map.customMappingFile || !_this.state.map.customMappingFile.length)) {
      invalid.push("Warning: Missing custom mapping file");
      this.setState({validated: false, error: invalid});
      return false;
    }      

    if (_this.state.map.namedlookups) {
      if (!_this.state.map.namedlookupsList || !_this.state.map.namedlookupsList.length) {
        invalid.push("Error: Invalid or incomplete named lookup configuration");
        this.setState({validated: false, error: invalid});
        return false;
      }      

      lookupNames = _this.state.map && _this.state.map.namedlookupsList && _this.state.map.namedlookupsList.length > 0 ?
                        _this.state.map.namedlookupsList.map((namedLookup) => { return namedLookup.lookupName }) : [];
      _this.state.map.namedlookupsList.map((namedLookup, index) => {
        if (!namedLookup.lookupName) {
          invalid.push("Error: Lookup[" + (index+1) + "]: Missing lookup name");
          this.setState({validated: false, error: invalid});
          return false;
        }

        if (lookupNames.filter((name) => { return name === namedLookup.lookupName; }).length > 1) {
          invalid.push("Error: Lookup[" + (index+1) + "] Duplicate lookup names found");
          this.setState({validated: false, error: invalid});
          return false;
        }

        if (!namedLookup.reuseSource && !namedLookup.externalLookupFile) {
          invalid.push("Error: [" + (index+1) + "]: Missing external lookup file");
          this.setState({validated: false, error: invalid});
          return false;
        }

        if (!namedLookup.reuseSource && (!namedLookup.externalLookupSheets || !namedLookup.externalLookupSheets.length)) {
          invalid.push("Error: [" + (index+1) + "]: Missing sheets on the loaded external lookup file ");
          this.setState({validated: false, error: invalid});
          return false;
        }          
        if (!namedLookup.reuseSource && namedLookup.externalLookupFileError !== undefined) {
          invalid.push("Error: [" + (index+1) + "]: External lookup file upload error detected");
          this.setState({validated: false, error: invalid});
          return false;
        }          

        return namedLookup;
      })
    }

    if (_this.state.map.sourceIgnoreMap && _this.state.map.sourceIgnoreMap.length === Object.keys(_this.state.map.sourceMap).length) {
      invalid.push("Warning: No source sheet considered for mapping");
      this.setState({validated: false, error: invalid});
      return false;
    }      

    if (_this.state.map.targetIgnoreMap && _this.state.map.targetIgnoreMap.length === Object.keys(_this.state.map.targetMap).length) {
      invalid.push("Invalid Mapping: No target sheet is mapped");
      this.setState({validated: false, error: invalid});
      return false;
    }
    
    if (!_this.state.map.mapConfig) {
      invalid.push("Warning: No mapping defined");
      this.setState({validated: false, error: invalid});
      return false;
    }

    if (!Object.keys(_this.state.map.mapConfig).length) {
      invalid.push("Warning: No mapping defined");
      this.setState({validated: false, error: invalid});
      return false;
    }

    if (this.state.map.sourcePreprocessor) {
      Object.keys(this.state.map.sourcePreprocessor).map((sheet) => {
        var preprocessors = this.state.map.sourcePreprocessor[sheet];
        preprocessors.map((preprocessor, index) => {
          var type = (this.state.map.sourceMapValidation &&
                      this.state.map.sourceMapValidation[sheet] &&
                      this.state.map.sourceMapValidation[sheet][preprocessor.leftPreprocessorValue.lookupKey] &&
                      this.state.map.sourceMapValidation[sheet][preprocessor.leftPreprocessorValue.lookupKey].type) ?
                      this.state.map.sourceMapValidation[sheet][preprocessor.leftPreprocessorValue.lookupKey].type : 'String';

          if ((preprocessor.preprocessorType === 'Number round up' || preprocessor.preprocessorType === 'Number round down') &&
              type !== 'Number') {
            invalid.push("Invalid Preprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return preprocessor;          
          } else if ((preprocessor.preprocessorType === 'Uppercase' || preprocessor.preprocessorType === 'Lowercase') &&
                      type !== 'String') {
            invalid.push("Invalid Preprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return preprocessor;          
          }

          return preprocessor;
        });

        return sheet;
      });
    }

    if (_this.state.map.chainMaps) {
      if (!_this.state.map.chainedMaps || !_this.state.map.chainedMaps.length) {
        invalid.push("Invalid Map Processor: Chained maps requested, but there is no maps for chaining identified");
      } else {
        _this.state.map.chainedMaps.map((cmap, cindex) => {
          if (!cmap.id || cmap.id === 'UNKNOWN')
            invalid.push("Invalid Map Processor: Chained map configuration [" + (cindex+1) + "] is invalid, a valid map for chaining required");
          return cmap;
        })
      }
    }
    
    if (this.state.map.targetMapValidation) {
      Object.keys(this.state.map.targetMapValidation).map((sheet) => {
        if ((_this.state.map.targetIgnoreMap && _this.state.map.targetIgnoreMap.indexOf(sheet) >= 0) ||
            (_this.state.map.mapIgnoreConfig && _this.state.map.mapIgnoreConfig.indexOf(sheet) >= 0))
          return sheet;

        var found = _this.state.map.mapConfig && Object.keys(_this.state.map.mapConfig).find((sheetName) => {
          return sheetName === sheet;
        });
        if (!found) { //} && _this.state.map.mapIgnoreConfig.indexOf(sheet) < 0) {
          invalid.push("Incomplete Mapping: '" + sheet + "' not mapped in the mapper");
          return sheet;
        }

        Object.keys(_this.state.map.targetMapValidation[sheet]).map((key) => {
          if (_this.state.map.targetMapValidation[sheet][key].required &&
              (!_this.state.map.mapConfig[sheet] ||
              Object.keys(_this.state.map.mapConfig[sheet]).indexOf(_this.state.map.targetMap[sheet][key]) < 0)) {
                invalid.push("Missing Attribute Mapping: '" + _this.state.map.targetMap[sheet][key] + "'  of sheet '" + sheet + "' not mapped in the mapper");
          }
          
          return key;
        });

        return sheet;
      });
    }

    lookupNames = _this.state.map && _this.state.map.namedlookups && _this.state.map.namedlookupsList &&
                      _this.state.map.namedlookupsList.length > 0 ?
                      _this.state.map.namedlookupsList.map((namedLookup) => { return namedLookup.lookupName }) : [];
    Object.keys(_this.state.map.mapConfig).map((sheet) => {
      if ((_this.state.map.targetIgnoreMap && _this.state.map.targetIgnoreMap.indexOf(sheet) >= 0) || 
          (_this.state.map.mapIgnoreConfig && _this.state.map.mapIgnoreConfig.indexOf(sheet) >= 0))
        return sheet;

      var config = _this.state.map.mapConfig[sheet]._config;
      if (!config) {
        invalid.push("Incomplete Mapping: '" + sheet + "' source sheet not defined in the mapper");
        return sheet;          
      }

      if (this.state.map.mapPreprocessor && Object.keys(this.state.map.mapPreprocessor).indexOf(sheet) >= 0) {
        var preprocessors = this.state.map.mapPreprocessor[sheet];
        preprocessors.map((preprocessor, index) => {
          var sourceSheet = preprocessor.leftPreprocessorValue.lookupSheet;
          var sourceType = (this.state.map.sourceMapValidation &&
                      this.state.map.sourceMapValidation[sourceSheet] &&
                      this.state.map.sourceMapValidation[sourceSheet][preprocessor.leftPreprocessorValue.lookupKey] &&
                      this.state.map.sourceMapValidation[sourceSheet][preprocessor.leftPreprocessorValue.lookupKey].type) ?
                      this.state.map.sourceMapValidation[sourceSheet][preprocessor.leftPreprocessorValue.lookupKey].type : 'String';

          if ((preprocessor.preprocessorType === 'Number round up' || preprocessor.preprocessorType === 'Number round down') &&
              sourceType !== 'Number') {
            invalid.push("Invalid Map Preprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return preprocessor;          
          } else if ((preprocessor.preprocessorType === 'Uppercase' || preprocessor.preprocessorType === 'Lowercase') &&
                      sourceType !== 'String') {
            invalid.push("Invalid Map Preprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return preprocessor;          
          }

          return preprocessor;
        });
      }

      if (this.state.map.mapPostprocessor && Object.keys(this.state.map.mapPostprocessor).indexOf(sheet) >= 0) {
        var postprocessors = this.state.map.mapPostprocessor[sheet];
        postprocessors.map((postprocessor, index) => {
          var sourceSheet = postprocessor.leftPostprocessorValue.lookupSheet;
          var sourceType = (this.state.map.sourceMapValidation &&
                      this.state.map.sourceMapValidation[sourceSheet] &&
                      this.state.map.sourceMapValidation[sourceSheet][postprocessor.leftPostprocessorValue.lookupKey] &&
                      this.state.map.sourceMapValidation[sourceSheet][postprocessor.leftPostprocessorValue.lookupKey].type) ?
                      this.state.map.sourceMapValidation[sourceSheet][postprocessor.leftPostprocessorValue.lookupKey].type : 'String';
          var targetSheet = postprocessor.rightPostprocessorValue.lookupSheet;
          var targetType = (this.state.map.targetMapValidation &&
                      this.state.map.targetMapValidation[targetSheet] &&
                      this.state.map.targetMapValidation[targetSheet][postprocessor.rightPostprocessorValue.lookupKey] &&
                      this.state.map.targetMapValidation[targetSheet][postprocessor.rightPostprocessorValue.lookupKey].type) ?
                      this.state.map.targetMapValidation[targetSheet][postprocessor.rightPostprocessorValue.lookupKey].type : 'String';

          if ((postprocessor.postprocessorType === 'Number round up' || postprocessor.postprocessorType === 'Number round down') &&
              sourceType !== 'Number') {
            invalid.push("Invalid Map Postprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return postprocessor;          
          } else if ((postprocessor.postprocessorType === 'Uppercase' || postprocessor.postprocessorType === 'Lowercase') &&
                      sourceType !== 'String') {
            invalid.push("Invalid Map Postprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
            return postprocessor;          
          } else if (postprocessor.postprocessorType === 'Date Range Fix') {
            if (sourceType !== 'Date') {
              invalid.push("Invalid Map Postprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported source datatype");
              return postprocessor;          
            } 
            
            if (targetType !== 'Date') {
              invalid.push("Invalid Map Postprocessor: Rule[" + (index+1) + "] of sheet '" + sheet + "' is invalid due to unsupported target datatype");
              return postprocessor;          
            }
          } 

          return postprocessor;
        });
      }        
      
      if (!(config.sourceSheet && config.sourceColumn)) {
        invalid.push("Incomplete Mapping: '" + sheet + "' source column sheet/column not defined in the mapper");
        return sheet;          
      }
    
      var conditionSourceKey, conditionTargetKey;
      var conditionSourceType, conditionTargetType;

      Object.keys(_this.state.map.mapConfig[sheet]).map((fieldKey) => {
        if (fieldKey === '_config')
          return fieldKey;
          
        var fieldConfig = _this.state.map.mapConfig[sheet][fieldKey];
        if (!fieldConfig)
          return fieldKey;

        delete fieldConfig.mapError;
        if (fieldConfig.mapMode === 'Computed') {
          var conditions = fieldConfig.computed.conditions;
          if (!conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' computed mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;            
          conditions.map((condition, index) => {
            // if (index !== conditions.length-1 && !(condition && condition.conditionType && condition.leftComputedMode)) {
            //   invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (LHS) not configured correctly");
            //   return condition;    
            // }
            if (condition.leftComputedMode === 'Static Value' &&
                  !(condition.leftComputedValue && condition.leftComputedValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (LHS) static mode not configured correctly");
              return condition;
            } else if (condition.leftComputedMode === 'Lookup Value' &&
                  !(condition.leftComputedValue && condition.leftComputedValue.lookupSheet &&
                    condition.leftComputedValue.lookupName && condition.leftComputedValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (LHS) lookup mode not configured correctly");
              return condition;
            }
  
            if (!(condition.conditionType === '' || 
                  condition.conditionType === 'Uppercase' || condition.conditionType === 'Lowercase' ||
                  condition.conditionType === 'Substring' || condition.conditionType === 'Convert To String' ||
                  condition.conditionType === 'MD5 Token')) {
              if (!(condition.rightComputedMode)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (RHS) not configured correctly");
                return condition;    
              } else if (condition.rightComputedMode === 'Static Value' &&
                    !(condition.rightComputedValue && condition.rightComputedValue.staticValue)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (RHS) static mode not configured correctly");
                return condition;
              } else if (condition.rightComputedMode === 'Lookup Value' &&
                    !(condition.rightComputedValue && condition.rightComputedValue.lookupSheet &&
                      condition.rightComputedValue.lookupName && condition.rightComputedValue.lookupKey)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' computed mapping (RHS) lookup mode not configured correctly");
                return condition;
              }    
            }

            conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );            

            conditionTargetType = 
                (_this.state.map.targetMapValidation &&
                  _this.state.map.targetMapValidation[sheet] &&
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey]) ?
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                  'String';

            if ((condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract') &&
                conditionTargetType !== 'Date') {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' date arithmetic operation not supported on the target field");
              return condition;        
            } 
                              
            if ((condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
                condition.conditionType === 'Multiply' || condition.conditionType === 'Divide') &&
                !(conditionTargetType === 'Number' || conditionTargetType === 'Date')) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' arithmetic operation not supported on the target field");
              return condition;        
            } 
              
            if (!(condition.conditionType === "" ||
                  condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
                  condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract' || 
                  condition.conditionType === 'Multiply' || condition.conditionType === 'Divide') &&
                  conditionTargetType !== 'String') {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' string operation not supported target on the field");
              return condition;        
            }

            if (condition.leftComputedMode === 'Lookup Value') {
              conditionSourceKey = _.findKey(_this.state.map.sourceMap[condition.leftComputedValue.lookupSheet], 
                function (o) { 
                  return o === condition.leftComputedValue.lookupName;
                }
              );
  
              conditionSourceType = 
                  (_this.state.map.sourceMapValidation &&
                    _this.state.map.sourceMapValidation[condition.leftComputedValue.lookupSheet] &&
                    _this.state.map.sourceMapValidation[condition.leftComputedValue.lookupSheet][conditionSourceKey]) &&
                    _this.state.map.sourceMapValidation[condition.leftComputedValue.lookupSheet][conditionSourceKey].type ?
                    _this.state.map.sourceMapValidation[condition.leftComputedValue.lookupSheet][conditionSourceKey].type :
                    'String';
                
              if ((condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
                  condition.conditionType === 'Multiply' || condition.conditionType === 'Divide') &&
                  !(conditionSourceType === 'Number' || conditionSourceType === 'Date')) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' arithmetic operation not supported on the (LHS) mapping field");
                return condition;        
              } 

              if ((condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract') &&
                  conditionSourceType !== 'Date') {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' arithmetic operation not supported on the (LHS) mapping field");
                return condition;        
              } 

              if (!(condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
                  condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract' || 
                  condition.conditionType === 'Multiply' || condition.conditionType === 'Divide' ||
                  condition.conditionType === 'Convert To String') &&
                  conditionSourceType !== 'String') {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' string operation not supported on the (LHS) mapping field");
                return condition;        
              }
            }
              
            if (condition.rightComputedMode === 'Lookup Value') {   
              conditionSourceKey = _.findKey(_this.state.map.sourceMap[condition.rightComputedValue.lookupSheet], 
                function (o) { 
                  return o === condition.rightComputedValue.lookupName;
                }
              );
  
              conditionSourceType = 
                  (_this.state.map.sourceMapValidation &&
                    _this.state.map.sourceMapValidation[condition.rightComputedValue.lookupSheet] &&
                    _this.state.map.sourceMapValidation[condition.rightComputedValue.lookupSheet][conditionSourceKey]) &&
                    _this.state.map.sourceMapValidation[condition.rightComputedValue.lookupSheet][conditionSourceKey].type ?
                    _this.state.map.sourceMapValidation[condition.rightComputedValue.lookupSheet][conditionSourceKey].type :
                    'String';
                
              if ((condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
                  condition.conditionType === 'Multiply' || condition.conditionType === 'Divide') &&
                  conditionSourceType !== 'Number') {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' arithmetic operation not supported on the (RHS) mapping field");
                return condition;        
              } 
                
              if ((condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract') &&
                  conditionSourceType !== 'Number') {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' date arithmetic operation not supported on the (RHS) mapping field");
                return condition;        
              } 
                
              // if (!(condition.conditionType === 'Add' || condition.conditionType === 'Subtract' || 
              //     condition.conditionType === 'Date Add' || condition.conditionType === 'Date Subtract' || 
              //     condition.conditionType === 'Multiply' || condition.conditionType === 'Divide') &&
              //     conditionSourceType !== 'String') {
              //   invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' string operation not supported on the (RHS) mapping field");
              //   return condition;        
              // }
            }

            if (conditions.length === 1 && (condition.connector && condition.connector.length)) {
              invalid.push("Invalid Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operators not required for single condition configuration");
              return condition;            
            }

            if (index < conditions.length-1 && !(condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', multiple conditions are found with missing connecting operators");
              return condition;            
            }

            if (conditions.length > 1 && index === conditions.length-1 && (condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operator cannot be defined on the last condition");
              return condition;            
            }

            return condition;            
          });
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;            
        } else if (fieldConfig.mapMode === 'Conditional') {
          if (!fieldConfig.conditional.conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          }

          if (!(fieldConfig.conditional && fieldConfig.conditional.trueCondition &&
                fieldConfig.conditional.falseCondition)) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping results not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 
          
          if (fieldConfig.conditional.trueCondition.mode === 'Empty Value' && 
              fieldConfig.conditional.falseCondition.mode === 'Empty Value') {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping both results cannot be empty");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;
          conditions = fieldConfig.conditional.conditions;
          conditions.map((condition, index) => {
            if (!(condition && condition.conditionType && condition.leftConditionMode)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (LHS) not configured correctly");
              return condition;    
            } else if (condition.leftConditionMode === 'Static Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (LHS) static mode not configured correctly");
              return condition;
            } else if (condition.leftConditionMode === 'Lookup Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.lookupSheet &&
                    condition.leftConditionValue.lookupName && condition.leftConditionValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (LHS) lookup mode not configured correctly");
              return condition;
            }
  
            if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty' ||
                  condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
                  condition.conditionType === 'Contains')) {
              if (!(condition.rightConditionMode)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (RHS) not configured correctly");
                return condition;    
              } else if (condition.rightConditionMode === 'Static Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.staticValue)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (RHS) static mode not configured correctly");
                return condition;
              } else if (condition.rightConditionMode === 'Lookup Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.lookupSheet &&
                      condition.rightConditionValue.lookupName && condition.rightConditionValue.lookupKey)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping (RHS) lookup mode not configured correctly");
                return condition;
              }    
            }

            // DATA CHECK
            var conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );
          
            if (!_this.state.map.targetMapValidation || !_this.state.map.targetMapValidation[sheet] || 
                !_this.state.map.targetMapValidation[sheet][conditionTargetKey] ||
                _this.state.map.targetMapValidation[sheet][conditionTargetKey].type !== 'String') {
              if (condition.resultMode === 'Lookup Value') {
                if (!_this.state.map.targetMapValidation || 
                    !_this.state.map.targetMapValidation[condition.resultValue.lookupSheet] || 
                    !_this.state.map.targetMapValidation[condition.resultValue.lookupSheet][condition.resultValue.lookupKey] ||
                    _this.state.map.targetMapValidation[condition.resultValue.lookupSheet][condition.resultValue.lookupKey].type !== _this.state.map.targetMapValidation[sheet][conditionTargetKey].type) {
                  invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' conditional mapping result data type does not match the target field");
                  return condition;        
                }
              }
            }

            if (conditions.length === 1 && (condition.connector && condition.connector.length)) {
              invalid.push("Invalid Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operators not required for single condition configuration");
              return condition;            
            }

            if (index < conditions.length-1 && !(condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', multiple conditions are found with missing connecting operators");
              return condition;            
            }

            if (conditions.length > 1 && index === conditions.length-1 && (condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operator cannot be defined on the last condition");
              return condition;            
            }

            return condition;            
          });
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;

          if (fieldConfig.conditional.trueCondition.mode === 'Static Value' &&
                !fieldConfig.conditional.trueCondition.result.staticValue) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping true (static) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.trueCondition.mode === 'vLookup Name' &&
                !fieldConfig.conditional.trueCondition.result.lookedupName) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping true (lookup) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.trueCondition.mode === 'Lookup Value' &&
                      !(fieldConfig.conditional.trueCondition.result.lookupSheet &&
                      fieldConfig.conditional.trueCondition.result.lookupName &&
                      fieldConfig.conditional.trueCondition.result.lookupKey)) {
            invalid.push("Incomplete Mapping Condition: '" + sheet + "', '" + fieldKey + "' conditional mapping true (lookup) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.trueCondition.mode === 'Lookup Value') {
            conditionSourceKey = _.findKey(_this.state.map.sourceMap[fieldConfig.conditional.trueCondition.result.lookupSheet], 
              function (o) { 
                return o === fieldConfig.conditional.trueCondition.result.lookupName;
              }
            );

            conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );            

            conditionSourceType = 
                (_this.state.map.sourceMapValidation &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.trueCondition.result.lookupSheet] &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.trueCondition.result.lookupSheet][conditionSourceKey]) &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.trueCondition.result.lookupSheet][conditionSourceKey].type ?
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.trueCondition.result.lookupSheet][conditionSourceKey].type :
                  'String';

            conditionTargetType = 
                (_this.state.map.targetMapValidation &&
                  _this.state.map.targetMapValidation[sheet] &&
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey]) ?
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                  'String';
                  
            if (conditionSourceType !== conditionTargetType) {
              invalid.push("Incomplete Mapping Condition: '" + sheet + "', '" + fieldKey + "' conditional mapping true condition result data type does not match the target field");
              fieldConfig.mapError = true;
              return fieldKey;        
            }
          }

          if (fieldConfig.conditional.falseCondition.mode === 'Static Value' &&
                !fieldConfig.conditional.falseCondition.result.staticValue) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping false (static) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.falseCondition.mode === 'vLookup Name' &&
                !fieldConfig.conditional.falseCondition.result.lookedupName) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' conditional mapping false (lookup) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.falseCondition.mode === 'Lookup Value' &&
                      !(fieldConfig.conditional.falseCondition.result.lookupSheet &&
                      fieldConfig.conditional.falseCondition.result.lookupName &&
                      fieldConfig.conditional.falseCondition.result.lookupKey)) {
            invalid.push("Incomplete Mapping Condition: '" + sheet + "', '" + fieldKey + "' conditional mapping false (lookup) condition not configured correctly");
            fieldConfig.mapError = true;
            return fieldKey;    
          } else if (fieldConfig.conditional.falseCondition.mode === 'Lookup Value') {
            conditionSourceKey = _.findKey(_this.state.map.sourceMap[fieldConfig.conditional.falseCondition.result.lookupSheet], 
              function (o) { 
                return o === fieldConfig.conditional.falseCondition.result.lookupName;
              }
            );

            conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );            

            conditionSourceType = 
                (_this.state.map.sourceMapValidation &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.falseCondition.result.lookupSheet] &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.falseCondition.result.lookupSheet][conditionSourceKey]) &&
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.falseCondition.result.lookupSheet][conditionSourceKey].type ?
                  _this.state.map.sourceMapValidation[fieldConfig.conditional.falseCondition.result.lookupSheet][conditionSourceKey].type :
                  'String';

            conditionTargetType = 
                (_this.state.map.targetMapValidation &&
                  _this.state.map.targetMapValidation[sheet] &&
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey]) ?
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                  'String';
                  
            if (conditionSourceType !== conditionTargetType) {
              invalid.push("Incomplete Mapping Condition: '" + sheet + "', '" + fieldKey + "' conditional mapping false condition result data type does not match the target field");
              fieldConfig.mapError = true;
              return fieldKey;        
            }
          }
        } else if (fieldConfig.mapMode === 'Switch') {
          conditions = fieldConfig.switch.conditions;
          if (!conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' switch mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;
          conditions.map((condition, index) => {
            if (!(condition && condition.conditionType && condition.leftConditionMode)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (LHS) not configured correctly");
              return condition;    
            } else if (condition.leftConditionMode === 'Static Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (LHS) static mode not configured correctly");
              return condition;
            } else if (condition.leftConditionMode === 'Lookup Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.lookupSheet &&
                    condition.leftConditionValue.lookupName && condition.leftConditionValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (LHS) lookup mode not configured correctly");
              return condition;
            }
  
            if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty' ||
                  condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
                  condition.conditionType === 'Contains')) {
              if (!(condition.rightConditionMode)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (RHS) not configured correctly");
                return condition;    
              } else if (condition.rightConditionMode === 'Static Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.staticValue)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (RHS) static mode not configured correctly");
                return condition;
              } else if (condition.rightConditionMode === 'Lookup Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.lookupSheet &&
                      condition.rightConditionValue.lookupName && condition.rightConditionValue.lookupKey)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping (RHS) lookup mode not configured correctly");
                return condition;
              }    
            }

            if (condition.resultMode === 'Static Value' &&
                !(condition.resultValue && condition.resultValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping result static value not configured correctly");
              return condition;
            } else if (condition.resultMode === 'Lookup Value' &&
                  !(condition.resultValue && condition.resultValue.lookupSheet &&
                    condition.resultValue.lookupName && condition.resultValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping result lookup value not configured correctly");
              return condition;
            } else if (condition.resultMode === 'vLookup Name' &&
                  !(condition.resultValue && condition.resultValue.lookedupName)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping result lookup value not configured correctly");
              return condition;
            }
            
            // DATA CHECK
            var conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );
          
            if (condition.resultMode === 'Lookup Value') {
              conditionSourceKey = _.findKey(_this.state.map.sourceMap[condition.resultValue.lookupSheet], 
                function (o) { 
                  return o === condition.resultValue.lookupName;
                }
              );

              conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
                function (o) { 
                  return o === fieldKey;
                }
              );            

              conditionSourceType = 
                  (_this.state.map.sourceMapValidation &&
                    _this.state.map.sourceMapValidation[condition.resultValue.lookupSheet] &&
                    _this.state.map.sourceMapValidation[condition.resultValue.lookupSheet][conditionSourceKey]) &&
                    _this.state.map.sourceMapValidation[condition.resultValue.lookupSheet][conditionSourceKey].type ?
                    _this.state.map.sourceMapValidation[condition.resultValue.lookupSheet][conditionSourceKey].type :
                    'String';

              conditionTargetType = 
                  (_this.state.map.targetMapValidation &&
                    _this.state.map.targetMapValidation[sheet] &&
                    _this.state.map.targetMapValidation[sheet][conditionTargetKey]) ?
                    _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                    'String';
                    
              if (conditionSourceType !== conditionTargetType) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' switch mapping result data type does not match the target field");
                return fieldKey;        
              }
            }                   

            return condition;            
          });  
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;
        } else if (fieldConfig.mapMode === 'Aggregated') {
          conditions = fieldConfig.aggregated.conditions;
          if (!conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' aggregated mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;
          conditions.map((condition, index) => {
            if (!(condition && condition.conditionType && condition.leftAggregatedMode)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' aggregated mapping (LHS) not configured correctly");
              return condition;    
            } else if (condition.leftAggregatedMode === 'Lookup Value' &&
                  !(condition.leftAggregatedValue && condition.leftAggregatedValue.lookupSheet &&
                    condition.leftAggregatedValue.lookupName && condition.leftAggregatedValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' aggregated mapping (LHS) lookup mode not configured correctly");
              return condition;
            }
  
            conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );            

            conditionTargetType = 
                (_this.state.map.targetMapValidation &&
                  _this.state.map.targetMapValidation[sheet] &&
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey]) ?
                  _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                  'String';

            // if (conditionTargetType !== 'Number') {
            //   invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' aggregate operation not supported on the target field");
            //   return condition;        
            // } 
            
            if (condition.leftAggregatedMode === 'Lookup Value') {
              conditionSourceKey = _.findKey(_this.state.map.sourceMap[condition.leftAggregatedValue.lookupSheet], 
                function (o) { 
                  return o === condition.leftAggregatedValue.lookupName;
                }
              );
  
              conditionSourceType = 
                  (_this.state.map.sourceMapValidation &&
                    _this.state.map.sourceMapValidation[condition.leftAggregatedValue.lookupSheet] &&
                    _this.state.map.sourceMapValidation[condition.leftAggregatedValue.lookupSheet][conditionSourceKey]) &&
                    _this.state.map.sourceMapValidation[condition.leftAggregatedValue.lookupSheet][conditionSourceKey].type ?
                    _this.state.map.sourceMapValidation[condition.leftAggregatedValue.lookupSheet][conditionSourceKey].type :
                    'String';
                
              if (conditionSourceType !== 'Number') {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' aggregate operation not supported on the (LHS) mapping field");
                return condition;        
              } 

              if (conditions.length === 1 && (condition.connector && condition.connector.length)) {
                invalid.push("Invalid Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operators not required for single aggregate condition configuration");
                return condition;            
              }

              if (index < conditions.length-1 && !(condition.connector && condition.connector.length)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', multiple aggregate conditions are found with missing connecting operators");
                return condition;            
              }

              if (conditions.length > 1 && index === conditions.length-1 && (condition.connector && condition.connector.length)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operator cannot be defined on the last aggregate condition");
                return condition;            
              }
            }
            
            return condition;            
          });
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;
          
          errorLength = invalid.length;
          conditions = fieldConfig.aggregated.skipConditions ? fieldConfig.aggregated.skipConditions : [];
          conditions.map((condition, index) => {
            if (!(condition && condition.conditionType && condition.leftConditionMode)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (LHS) not configured correctly");
              return condition;    
            } else if (condition.leftConditionMode === 'Static Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (LHS) static mode not configured correctly");
              return condition;
            } else if (condition.leftConditionMode === 'Lookup Value' &&
                  !(condition.leftConditionValue && condition.leftConditionValue.lookupSheet &&
                    condition.leftConditionValue.lookupName && condition.leftConditionValue.lookupKey)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (LHS) lookup mode not configured correctly");
              return condition;
            }
  
            if (!(condition.conditionType === 'Is Empty' || 
                  condition.conditionType === 'Is Not Empty')) {
              if (!(condition.rightConditionMode)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (RHS) not configured correctly");
                return condition;    
              } else if (condition.rightConditionMode === 'Static Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.staticValue)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (RHS) static mode not configured correctly");
                return condition;
              } else if (condition.rightConditionMode === 'Lookup Value' &&
                    !(condition.rightConditionValue && condition.rightConditionValue.lookupSheet &&
                      condition.rightConditionValue.lookupName && condition.rightConditionValue.lookupKey)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping (RHS) lookup mode not configured correctly");
                return condition;
              }    
            }

            // DATA CHECK
            var conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
              function (o) { 
                return o === fieldKey;
              }
            );
          
            if (!_this.state.map.targetMapValidation || !_this.state.map.targetMapValidation[sheet] || 
                !_this.state.map.targetMapValidation[sheet][conditionTargetKey] ||
                _this.state.map.targetMapValidation[sheet][conditionTargetKey].type !== 'String') {
              if (condition.resultMode === 'Lookup Value') {
                if (!_this.state.map.targetMapValidation || 
                    !_this.state.map.targetMapValidation[condition.resultValue.lookupSheet] || 
                    !_this.state.map.targetMapValidation[condition.resultValue.lookupSheet][condition.resultValue.lookupKey] ||
                    _this.state.map.targetMapValidation[condition.resultValue.lookupSheet][condition.resultValue.lookupKey].type !== _this.state.map.targetMapValidation[sheet][conditionTargetKey].type) {
                  invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' skip condition mapping result data type does not match the target field");
                  return condition;        
                }
              }
            }

            if (conditions.length === 1 && (condition.connector && condition.connector.length)) {
              invalid.push("Invalid Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operators not required for single skip condition configuration");
              return condition;            
            }

            if (index < conditions.length-1 && !(condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', multiple skip conditions are found with missing connecting operators");
              return condition;            
            }

            if (conditions.length > 1 && index === conditions.length-1 && (condition.connector && condition.connector.length)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "', connecting operator cannot be defined on the last skip condition");
              return condition;            
            }

            return condition;            
          });   
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;                                      
        } else if (fieldConfig.mapMode === 'Simple') {
          conditions = fieldConfig.simple.conditions;
          if (!conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' simple mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;
          conditions.map((condition, index) => {
            if (!(condition && condition.leftSimpleMode)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' simple mapping (LHS) not configured correctly");
              return condition;    
            } else if (condition.leftSimpleMode === 'Static Value' &&
                  !(condition.leftSimpleValue && condition.leftSimpleValue.staticValue)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' simple mapping (LHS) static mode not configured correctly");
              return condition;
            } else if (condition.leftSimpleMode === 'vLookup Name') {
              if (!(condition.leftSimpleValue && condition.leftSimpleValue.lookedupName)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' simple mapping (LHS) lookup mode not configured correctly");
                return condition;
              } else if (lookupNames.indexOf(condition.leftSimpleValue.lookedupName) < 0) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' simple mapping (LHS) missing or invalid lookup name");
                return condition;
              }
            } else if (condition.leftSimpleMode === 'Lookup Value') {
              if (!(condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet &&
                    condition.leftSimpleValue.lookupName && condition.leftSimpleValue.lookupKey)) {
                invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' simple mapping (LHS) lookup mode not configured correctly");
                return condition;
              } 
  
              conditionTargetKey = _.findKey(_this.state.map.targetMap[sheet], 
                function (o) { 
                  return o === fieldKey;
                }
              );            

              conditionTargetType = 
                  (_this.state.map.targetMapValidation &&
                    _this.state.map.targetMapValidation[sheet] &&
                    _this.state.map.targetMapValidation[sheet][conditionTargetKey] &&
                    _this.state.map.targetMapValidation[sheet][conditionTargetKey].type) ?
                    _this.state.map.targetMapValidation[sheet][conditionTargetKey].type :
                    'String';

              if (condition.leftSimpleMode === 'Lookup Value') {
                conditionSourceKey = _.findKey(_this.state.map.sourceMap[condition.leftSimpleValue.lookupSheet], 
                  function (o) { 
                    return o === condition.leftSimpleValue.lookupName;
                  }
                );
    
                conditionSourceType = 
                    (_this.state.map.sourceMapValidation &&
                      _this.state.map.sourceMapValidation[condition.leftSimpleValue.lookupSheet] &&
                      _this.state.map.sourceMapValidation[condition.leftSimpleValue.lookupSheet][conditionSourceKey]) &&
                      _this.state.map.sourceMapValidation[condition.leftSimpleValue.lookupSheet][conditionSourceKey].type ?
                      _this.state.map.sourceMapValidation[condition.leftSimpleValue.lookupSheet][conditionSourceKey].type :
                      'String';
                  
                if (conditionTargetType !== conditionSourceType) {
                  invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' cannot map incompatible data types");
                  return condition;        
                } 
              }
            }
              
            return condition;            
          });                  
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;
        } else if (fieldConfig.mapMode === 'Custom') {
          conditions = fieldConfig.custom.conditions;
          if (!conditions.length) {
            invalid.push("Incomplete Mapping: '" + sheet + "', '" + fieldKey + "' custom mapping missing conditions");
            fieldConfig.mapError = true;
            return fieldKey;    
          } 

          errorLength = invalid.length;
          conditions.map((condition, index) => {
            if (!(condition && condition.code && condition.code.length > 0)) {
              invalid.push("Incomplete Mapping Condition[" + (index+1) + "]: '" + sheet + "', '" + fieldKey + "' custom mapping not configured correctly");
              return condition;    
            }
            
            return condition;            
          }); 
          if (errorLength !== invalid.length)
            fieldConfig.mapError = true;                
        }

        return fieldKey;
      });

      return sheet;
    });
    
    if (invalid.length)
      this.setState({validated: false, error: invalid});
    else
      this.setState({validated: true, error: undefined});
      
    return invalid.length === 0;
  }

  validate = (e) => {
    e.preventDefault();
    this._validate();
  }  

  save = (e, phase = undefined) => {
    e.preventDefault();
    try {
      this._save();
      this.props.history.push('/repository');
      this.loadMapState(phase);
    } catch (error) {
      this.setState({ error: [error.message] });      
    }
  }
  
  _save = (phase = undefined) => {
    var map = this.state.map;
    if (!map)
      return;

    map.status = this._validate(phase) ? 'VALID' : 'INVALID';
    makeRequest('post', '/api/mapper/update', {map: map});
  }  
  
  start = (action, checked, args) => {
    if (action === 'START NEW') {
      this.setState({newConfirm: true});
    } else if (action === 'YES') {
      makeRequest('post', '/api/mapper/abandon', {id: this.state.designId})
      window.location = '/design';
    } else if (action === 'NO') {
      this.setState({newConfirm: false})
    }
  }

  updateState = (obj) => {
    this.setState(obj);
  }

  render() {  
    if (!this.state.ready) {
      return (<LoaderPage show={true} />);
    }    

    console.log('PHASE: ', this.state.phase)
    var elems = [];
    if (this.state.newConfirm) {
      elems.push(
        <div key={uuidv4()} style={{ display: 'flex', flexDirection: 'row', padding: 10, fontSize: '14px', fontWeight: 'bold',  
                    alignItems: 'center', color: '#e0e0e0' }}>
          <DialogModal 
            style={{display: 'inline'}}
            needYes={true}
            needNo={true}
            open={true}
            title={"Abort mapper"}
            handleAction={this.start}
            content={'Are you sure you want to abort the current changes and start a new mapper?'}
          />);
        </div>);
    }

    {this.state.phase === 0 &&
      elems.push(<DCMapper 
        key={uuidv4()}
        _state={this.state} 
        start={this.start}
        save={this.save} 
        validate={this.validate}
        prev={this.prev} 
        next={this.next}
        jumpto={this.jumpto}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        saveAndLoadMapState={this.saveAndLoadMapState}
        updateState={this.updateState}
      />)
    }
    {this.state.ready && this.state.phase === 1 &&
      elems.push(<DCSourceValidation 
        key={uuidv4()}
        _state={this.state} 
        prev={this.prev} 
        save={this.save} 
        validate={this.validate}
        next={this.next}              
        jumpto={this.jumpto}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        updateState={this.updateState}
      />)
    }
    {this.state.ready && this.state.phase === 2 &&
      elems.push(<DCTargetValidation
        key={uuidv4()}
        _state={this.state} 
        prev={this.prev} 
        save={this.save} 
        validate={this.validate}
        next={this.next}
        jumpto={this.jumpto}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        updateState={this.updateState}
      />)
    }
    {this.state.ready && this.state.phase === 3 &&
      elems.push(<DCMapAndTransform
        key={uuidv4()}
        _state={this.state} 
        prev={this.prev} 
        save={this.save} 
        validate={this.validate}
        next={this.next}
        jumpto={this.jumpto}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        updateState={this.updateState}
      />)
    }
    {this.state.ready && this.state.phase === 4 &&
      elems.push(<DCPostProcessing
        key={uuidv4()}
        _state={this.state} 
        prev={this.prev} 
        save={this.save} 
        jumpto={this.jumpto}
        validate={this.validate}
        next={this.next}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        updateState={this.updateState}
      />)
    }
    {this.state.ready && this.state.phase === 5 &&
      elems.push(<DCSummary
        key={uuidv4()}
        _state={this.state} 
        prev={this.prev} 
        save={this.save} 
        jumpto={this.jumpto}
        validate={this.validate}
        next={this.next}
        loadMapState={this.loadMapState}
        updateAndLoadMapState={this.updateAndLoadMapState}
        updateState={this.updateState}
      />)
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                          overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          {elems}                  
        </div>
      </MuiThemeProvider>
    );    
  }
}


export default compose(
  connect(
    state => ({
      user: state.app.company.user
    }),
    null),
    withRouter
)(DesignContainer);
