import React from 'react';
import uuidv4 from 'uuid/v4'; 
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import PropTypes from 'prop-types';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const _ = require('lodash');
const simpleConditionsList = [
  '',
  'Uppercase',
  'Lowercase',
  'Concatenate',
  'Substring',
  'Convert To String',
  'Convert To Number',
  'MD5 Token',
  'Add',
  'Subtract',
  'Multiply',
  'Divide',
];
const CHARCODES = {
  "0": "A","1": "B","2": "C","3": "D","4": "E","5": "F","6": "G","7": "H","8": "I","9": "J","10": "K","11": "L","12": "M","13": "N","14": "O","15": "P","16": "Q","17": "R","18": "S","19": "T","20": "U","21": "V","22": "W","23": "X","24": "Y","25": "Z","26": "AA","27": "AB","28": "AC","29": "AD","30": "AE","31": "AF","32": "AG","33": "AH","34": "AI","35": "AJ","36": "AK","37": "AL","38": "AM","39": "AN","40": "AO","41": "AP","42": "AQ","43": "AR","44": "AS","45": "AT","46": "AU","47": "AV","48": "AW","49": "AX","50": "AY","51": "AZ","52": "BA","53": "BB","54": "BC","55": "BD","56": "BE","57": "BF","58": "BG","59": "BH","60": "BI","61": "BJ","62": "BK","63": "BL","64": "BM","65": "BN","66": "BO","67": "BP","68": "BQ","69": "BR","70": "BS","71": "BT","72": "BU","73": "BV","74": "BW","75": "BX","76": "BY","77": "BZ"
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

export default class ComputedCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    condition: this.initCondition(this.props.condition),
    leftError: undefined,
    leftSheetError: undefined,
    leftKeyError: undefined,
    leftNameError: undefined,
    leftLookedupSheetError: undefined,
    leftLookedupKeyError: undefined,
    leftLookedupValueError: undefined,
    conditionError: undefined,
    rightError: undefined,
    rightSheetError: undefined,
    rightKeyError: undefined,
    rightNameError: undefined,
    rightLookedupSheetError: undefined,
    rightLookedupKeyError: undefined,
    rightLookedupValueError: undefined,    
    joinerError: undefined,
    stringPositionError: undefined,
    stringLengthError: undefined,
    map: this.props._state.map
  }

  initCondition(cond) {
    if (cond) {
      return ({
        conditionType: cond.conditionType,
        computedJoiner: cond.computedJoiner,
        stringPosition: cond.stringPosition,
        stringLength: cond.stringLength,
        leftComputedMode: cond.leftComputedMode,
        leftComputedValue: cond.leftComputedValue,
        rightComputedMode: cond.rightComputedMode,
        rightComputedValue: cond.rightComputedValue,
      });
    }

    var sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = sheet ? Object.keys(this.props._state.map.sourceMap[sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[sheet][colKey] : undefined;

    return ({
      conditionType: '',
      computedJoiner: '',
      leftComputedMode: 'Lookup Value',
      leftComputedValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      },
      rightComputedMode: 'Static Value',
      rightComputedValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      },
      stringPosition: 0,
      stringLength: 1    
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({condition: this.initCondition(this.props.condition)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var condition = this.state.condition ? this.state.condition : {};
    
    if (condition.leftComputedMode === 'Static Value') {
      if (this.refs.leftStaticValue === undefined || this.refs.leftStaticValue.getValue().length === 0) {
        this.setState({leftError: 'Enter a value'});
        return;
      }
      condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}      
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
      this.setState({leftError: undefined});      
    }
    if (condition.leftComputedMode === 'Lookup Value' || condition.leftComputedMode === 'vLookup Name') {
      if (condition.leftComputedValue && !condition.leftComputedValue.lookupSheet && this.refs.leftSheetValue.props.value)
        condition.leftComputedValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (condition.leftComputedValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (condition.leftComputedValue.lookupKey === undefined) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    } 

    if (condition.leftComputedMode === 'vLookup Name') {
      condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}      
      if (condition.leftComputedValue.lookedupName === undefined) {
        this.setState({condition: condition, 
          leftNameError: 'Choose a vLookup Name',
          leftLookedupSheetError: undefined,
          leftLookedupKeyError: undefined, 
          leftLookedupValueError: undefined});
        return;
      }

      if (condition.leftComputedValue.lookedupSheetName === undefined) {
        this.setState({condition: condition, 
                      leftNameError: undefined,
                      leftLookedupSheetError: 'Invalid vLookup Sheet Name specified',
                      leftLookedupKeyError: undefined, 
                      leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftComputedValue.lookedupKey === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        leftLookedupSheetError: undefined,
                        leftLookedupKeyError: 'Invalid vLookup key column position specified', 
                        leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftComputedValue.lookedupValue === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        leftLookedupSheetError: undefined,
                        leftLookedupKeyError: undefined,
                        leftLookedupValueError: 'Invalid vLookup value column position specified'});
        return;
      }
      this.setState({condition: condition, 
                    leftNameError: undefined,
                    leftLookedupSheetError: undefined,
                    leftLookedupKeyError: undefined, 
                    leftLookedupValueError: undefined});
    }
        
    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();

    if (condition.conditionType === 'Substring' && this.refs.stringPosition) {
      if (this.refs.stringPosition.getValue().length > 0 && isValidNumber(this.refs.stringPosition.getValue()) &&
          this.refs.stringPosition.getValue() >= -1) {
        condition.stringPosition = this.refs.stringPosition.getValue();
        this.setState({stringPositionError: undefined});
      } else {
        this.setState({stringPositionError: 'Specify a valid position (>= -1)'});
        return;      
      }
    }

    if (condition.conditionType === 'Substring' && this.refs.stringLength) {
      if (this.refs.stringLength.getValue().length > 0 && isValidNumber(this.refs.stringLength.getValue()) &&
          this.refs.stringLength.getValue() >= 1) {
        condition.stringLength = this.refs.stringLength.getValue();
        this.setState({stringLengthError: undefined});        
      } else {
        this.setState({stringLengthError: 'Specify a valid length'});
        return;      
      }
    }    

    // if (!(this.props.index < 0 || this.props.index+1 !== this.props.numConditions) && condition.conditionType === '') {
    //   this.setState({conditionError: 'Specify a valid computing function'});
    //   return;      
    // } else {
    //   this.setState({conditionError: undefined});
    // }
    
    if (!(condition.conditionType === '' || 
          condition.conditionType === 'Uppercase' || condition.conditionType === 'Lowercase' || 
          condition.conditionType === 'Substring' || condition.conditionType === 'Convert To String' ||
          condition.conditionType === 'Convert To Number' || condition.conditionType === 'MD5 Token')) {
      if (condition.rightComputedMode === 'Static Value') {
        if (this.refs.rightStaticValue === undefined || this.refs.rightStaticValue.getValue().length === 0) {
          this.setState({rightError: 'Enter a value'});
          return;
        }
        condition.rightComputedValue = condition.rightComputedValue ? condition.rightComputedValue : {}      
        condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
        this.setState({rightError: undefined});      
      }

      if (condition.rightComputedMode === 'Lookup Value') {
        if (condition.rightComputedValue && !condition.rightComputedValue.lookupSheet && this.refs.rightSheetValue.props.value)
          condition.rightComputedValue = { lookupSheet: this.refs.rightSheetValue.props.value};

        if (condition.rightComputedValue.lookupSheet === undefined) {
          this.setState({rightSheetError: 'Choose a source sheet'});
          return;
        } else {
          this.setState({rightSheetError: undefined});              
        }

        if (condition.rightComputedValue.lookupKey === undefined) {
          this.setState({rightKeyError: 'Choose an attribute'});
          return;
        } else {
          this.setState({rightKeyError: undefined});              
        }
      } 
    }
        
    this.props.submit(condition, this.props.index);    
  }

  updateAdvancedConditionType = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.conditionType = value;

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
    
    this.setState({condition: condition});
  }  
  
  updateAdvancedLeftComputedMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftComputedMode = value;
    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {};
    if (value === 'Lookup Value') {
      condition.leftComputedValue.lookupSheet = condition.leftComputedValue.lookupSheet ? 
        condition.leftComputedValue.lookupSheet : undefined;
      condition.leftComputedValue.lookupKey = condition.leftComputedValue.lookupKey ? 
        condition.leftComputedValue.lookupKey : undefined;
      condition.leftComputedValue.lookupName = condition.leftComputedValue.lookupName ? 
        condition.leftComputedValue.lookupName : undefined;
    } else if (value === 'vLookup Name') {
      condition.leftComputedValue.lookedupName = condition.leftComputedValue.lookedupName ? 
        condition.leftComputedValue.lookedupName : undefined ;
    } else if (value === 'Static Value') {
      condition.leftComputedValue.staticValue = condition.leftComputedValue.staticValue ? 
        condition.leftComputedValue.staticValue : undefined ;
    }

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();

    this.setState({condition: condition});
  }  

  updateAdvancedLeftConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    condition.leftComputedValue.lookupSheet = value;

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();

    this.setState({condition: condition});    
  }
    
  updateAdvancedLeftConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    condition.leftComputedValue.lookupSheet = condition.leftComputedValue.lookupSheet ? 
        condition.leftComputedValue.lookupSheet : sourceSheet;
    condition.leftComputedValue.lookupKey = value;
    condition.leftComputedValue.lookupName = this.state.map.sourceMap[condition.leftComputedValue.lookupSheet][value];

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});    
  }    

  updateAdvancedRightComputedMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.rightComputedMode = value;
    condition.rightComputedValue = condition.rightComputedValue ? condition.rightComputedValue : {};
    if (value === 'Lookup Value') {
      condition.rightComputedValue.lookupSheet = condition.rightComputedValue.lookupSheet ? 
        condition.rightComputedValue.lookupSheet : undefined;
      condition.rightComputedValue.lookupKey = condition.rightComputedValue.lookupKey ? 
        condition.rightComputedValue.lookupKey : undefined;
      condition.rightComputedValue.lookupName = condition.rightComputedValue.lookupName ? 
        condition.rightComputedValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      condition.rightComputedValue.staticValue = condition.rightComputedValue.staticValue ? 
        condition.rightComputedValue.staticValue : undefined ;
    }

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});
  }  

  updateAdvancedRightConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.rightComputedValue = condition.rightComputedValue ? condition.rightComputedValue : {}
    condition.rightComputedValue.lookupSheet = value;

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
          
    this.setState({condition: condition});    
  }
    
  updateAdvancedRightConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.rightComputedValue = condition.rightComputedValue ? condition.rightComputedValue : {}
    condition.rightComputedValue.lookupSheet = condition.rightComputedValue.lookupSheet ? 
        condition.rightComputedValue.lookupSheet : sourceSheet;
    condition.rightComputedValue.lookupKey = value;
    condition.rightComputedValue.lookupName = this.state.map.sourceMap[condition.rightComputedValue.lookupSheet][value];

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
          
    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupName = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    condition.leftComputedValue.lookedupName = value;
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === value;
    })

    var sourceSheets = nlup.reuseSource ? 
                        Object.keys(this.props._state.map.sourceMap) :
                        Object.keys(nlup.externalLookupSourceMap);
    condition.leftComputedValue.lookedupSheetName = sourceSheets[0];

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftComputedValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftComputedValue.lookedupSheetName];

    condition.leftComputedValue.lookedupKey = 'A';
    condition.leftComputedValue.lookedupKeyName = sourceMap.A;
    condition.leftComputedValue.lookedupValue = 'A';
    condition.leftComputedValue.lookedupValueName = sourceMap.A;

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupSheet = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftComputedValue.lookedupName;
    })

    condition.leftComputedValue.lookedupSheetName = value;
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftComputedValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftComputedValue.lookedupSheetName];

    condition.leftComputedValue.lookedupKey = 'A';
    condition.leftComputedValue.lookedupKeyName = sourceMap.A;
    condition.leftComputedValue.lookedupValue = 'A';
    condition.leftComputedValue.lookedupValueName = sourceMap.A;

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupKey = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftComputedValue.lookedupName;
    })

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftComputedValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftComputedValue.lookedupSheetName];

    condition.leftComputedValue.lookedupKey = CHARCODES[index];
    condition.leftComputedValue.lookedupKeyName = sourceMap[CHARCODES[index]];

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupValue = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftComputedValue = condition.leftComputedValue ? condition.leftComputedValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftComputedValue.lookedupName;
    })
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftComputedValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftComputedValue.lookedupSheetName];

    condition.leftComputedValue.lookedupValue = CHARCODES[index];
    condition.leftComputedValue.lookedupValueName = sourceMap[CHARCODES[index]];

    if (this.refs.leftStaticValue) 
      condition.leftComputedValue.staticValue = this.refs.leftStaticValue.getValue();
    if (this.refs.rightStaticValue) 
      condition.rightComputedValue.staticValue = this.refs.rightStaticValue.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.computedJoiner)
      condition.computedJoiner = this.refs.computedJoiner.getValue();
      
    this.setState({condition: condition});    
  }      
  
  getLookedupSheets = (condition) => {
    if (!condition.leftComputedValue.lookedupName)
      return '';
    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftComputedValue.lookedupName;
    });

    if (!nlup)
      return '';

      var sheets = nlup.reuseSource ? Object.keys(this.props._state.map.sourceMap) : Object.keys(nlup.externalLookupSourceMap);
    if (!sheets)
      return '';

    return sheets.map((sheet) => {
      return <MenuItem key={sheet} value={sheet} primaryText={sheet}  />  
    })
  }

  getLookedupMenuItems = (condition) => {
    if (!condition.leftComputedValue.lookedupName)
      return '';

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftComputedValue.lookedupName;
    });

    if (!nlup)
      return '';

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftComputedValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftComputedValue.lookedupSheetName];
    if (!sourceMap)
      return '';

    return Object.entries(sourceMap).map((entry) => {
      return <MenuItem key={entry[0]} value={entry[1]} primaryText={entry[1]}  />  
    })
  }

  render() {
    const { sourceSheet, sheet, mapkey, fields, namedlookups } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;

    var conditionType = condition && condition.conditionType ? condition.conditionType : simpleConditionsList[0];
    var rhsComputedAbsent = (conditionType === '' || 
                            conditionType === 'Uppercase' || conditionType === 'Lowercase' || 
                            conditionType === 'Substring' || conditionType === 'Convert To String' ||
                            conditionType === 'Convert To Number' || conditionType === 'MD5 Token');
    var rightComputedMode = condition && condition.rightComputedMode ? condition.rightComputedMode : 'Static Value';
    var leftComputedMode = condition && condition.leftComputedMode ? condition.leftComputedMode : 'Lookup Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}} >
        <div key={uuidv4()} {...Styles.conditionContainer}> 
          <div key={uuidv4()} style={{flex: 0.4, display: 'flex', flexDirection: 'column'}}> 
            <div style={{margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>LHS</div>
              <RadioButtonGroup name="leftComputedMode" 
                defaultSelected={leftComputedMode}
                data-sheet={sheet} data-key={fields[mapkey]} 
                style={{display: 'flex', flexDirection: 'row'}}
                onChange={this.updateAdvancedLeftComputedMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
              >
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="Lookup Value"
                  label="Lookup Value"
                  style={{marginBottom: 16}}
                />
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="vLookup Name"
                  label="vLookup Name"
                  style={{marginBottom: 16}}
                />
              </RadioButtonGroup>
            </div>
            <div key={uuidv4()} style={{display: 'flex', flexDirection: 'row'}}> 
              {leftComputedMode === 'Lookup Value' &&
                <div style={{margin: 5}}>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                    <SelectField 
                      floatingLabelText="Sheet"
                      errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                      errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                      value={condition && condition.leftComputedValue.lookupSheet ? condition.leftComputedValue.lookupSheet : sourceSheet}
                      onChange={this.updateAdvancedLeftConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="leftSheetValue"
                    >
                      <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                    </SelectField>
                    <SelectField 
                      floatingLabelText="Attribute"
                      errorText={this.state.leftKeyError ? this.state.leftKeyError : 
                        "The looked up value will be used in the computing function"}
                      errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                      value={condition && condition.leftComputedValue.lookupKey ? condition.leftComputedValue.lookupKey : ''}
                      onChange={this.updateAdvancedLeftConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="leftKeyValue"
                    >
                      {condition && condition.leftComputedValue && condition.leftComputedValue.lookupSheet &&
                        Object.keys(this.props._state.map.sourceMap[condition.leftComputedValue.lookupSheet])
                          .map((sourceKey) => {
                            return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftComputedValue.lookupSheet][sourceKey]}  />  
                          })
                      }
                      {condition && !(condition.leftComputedValue && condition.leftComputedValue.lookupSheet) &&
                        Object.keys(this.props._state.map.sourceMap[sourceSheet])
                          .map((sourceKey) => {
                            return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                          })
                      }
                    </SelectField>
                  </div>
                </div>
              }

              {leftComputedMode === 'vLookup Name' &&
                <div style={{margin: 5, display: 'flex', flexDirection: 'row'}}>
                  <div style={{margin: 5, display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                      <SelectField 
                        floatingLabelText="Sheet"
                        errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                        errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookupSheet ?
                                condition.leftComputedValue.lookupSheet : sourceSheet}
                        onChange={this.updateAdvancedLeftConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="leftSheetValue"
                      >
                        <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                      </SelectField>
                      <SelectField 
                        floatingLabelText="Attribute"
                        errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up cell value will be used in mapping"}
                        errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookupKey ? 
                                  condition.leftComputedValue.lookupKey : ''}
                        onChange={this.updateAdvancedLeftConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="leftKeyValue"
                      >
                        {condition && condition.leftComputedValue && condition.leftComputedValue.lookupSheet &&
                          Object.keys(this.props._state.map.sourceMap[condition.leftComputedValue.lookupSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftComputedValue.lookupSheet][sourceKey]}  />  
                            })
                        }
                        {!(condition && condition.leftComputedValue && condition.leftComputedValue.lookupSheet) &&
                          Object.keys(this.props._state.map.sourceMap[sourceSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                            })
                        }
                      </SelectField>  
                    </div>
                  </div>
                  <div style={{margin: 5}}>
                    <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup Name</div>
                      <SelectField 
                        floatingLabelText="vLookup Name"
                        errorText={this.state.leftNameError ? this.state.leftNameError : "vLookup Name"}
                        errorStyle={{color: this.state.leftNameError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookedupName ? 
                                  condition.leftComputedValue.lookedupName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupName.bind(this, condition)}
                        ref="leftLookedupNameValue"
                      >
                        {namedlookups && namedlookups.length > 0 && 
                          namedlookups.map((nlup) => {
                              return <MenuItem key={nlup.lookupName} value={nlup.lookupName} primaryText={nlup.lookupName}  />  
                            })
                        }
                      </SelectField>
                      <SelectField 
                        floatingLabelText="vLookup Sheet"
                        errorText={this.state.leftLookedupSheetError ? this.state.leftLookedupSheetError : "vLookup Sheet"}
                        errorStyle={{color: this.state.leftLookedupSheetError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookedupSheetName !== undefined ? 
                                condition.leftComputedValue.lookedupSheetName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupSheet.bind(this, condition)}
                        ref="leftLookedupSheetValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftComputedValue && 
                          condition.leftComputedValue.lookedupName !== undefined &&
                          this.getLookedupSheets(condition)
                        }
                      </SelectField>   
                      <SelectField 
                        floatingLabelText="vLookup Key"
                        errorText={this.state.leftLookedupKeyError ? this.state.leftLookedupKeyError : "vLookup Key"}
                        errorStyle={{color: this.state.leftLookedupKeyError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookedupKeyName !== undefined ? 
                                condition.leftComputedValue.lookedupKeyName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupKey.bind(this, condition)}
                        ref="leftLookedupKeyValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftComputedValue && 
                          condition.leftComputedValue.lookedupName !== undefined &&
                          this.getLookedupMenuItems(condition)
                        }
                      </SelectField>
                      <SelectField 
                        floatingLabelText="vLookup Value"
                        errorText={this.state.leftLookedupValueError ? this.state.leftLookedupValueError : "vLookup Value"}
                        errorStyle={{color: this.state.leftLookedupValueError ? 'red' : 'unset'}}
                        value={condition && condition.leftComputedValue && condition.leftComputedValue.lookedupValueName !== undefined ? 
                                condition.leftComputedValue.lookedupValueName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupValue.bind(this, condition)}
                        ref="leftLookedupValueValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftComputedValue && 
                          condition.leftComputedValue.lookedupName !== undefined &&
                          this.getLookedupMenuItems(condition)
                        }
                      </SelectField>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
          <div key={uuidv4()} style={{flex: 0.2, display: 'flex', flexDirection: 'column'}}> 
            <div style={{margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Comparison </div>
              <div style={{margin: 5, marginTop: 82}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Condition </div>
                <SelectField 
                  floatingLabelText="Condition"
                  errorText={this.state.conditionError ? this.state.conditionError : "Choose a computing function"}
                  errorStyle={{color: this.state.conditionError ? 'red' : 'unset'}}
                  autoWidth={true}
                  value={conditionType}
                  onChange={this.updateAdvancedConditionType.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="conditionValue"              
                >
                  {simpleConditionsList.map((condition, index) => {
                    return <MenuItem key={simpleConditionsList[index]} value={simpleConditionsList[index]} primaryText={simpleConditionsList[index]}  />  
                  })}
                </SelectField>
                {conditionType === 'Concatenate' &&
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Joiner: </div>
                    <TextField
                      errorText={this.state.joinerError ? this.state.joinerError : "This value will delimit the concatenated output"}
                      errorStyle={{color: this.state.joinerError ? 'red' : 'unset'}}
                      style={{width: '90%'}}
                      hintText="Value"
                      floatingLabelText="Joiner"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.computedJoiner ? condition.computedJoiner : ''}
                      ref="computedJoiner"
                    />
                  </div>}                      
                {conditionType === 'Substring' &&
                  <div>
                    <TextField
                      type="number"
                      errorText={this.state.stringPositionError ? this.state.stringPositionError : "Starting position (0 for Start or -1 for End of the string and any other +ve value)"}
                      errorStyle={{color: this.state.stringPositionError ? 'red' : 'unset'}}
                      hintText="Value"
                      floatingLabelText="Position"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.stringPosition !== undefined ? condition.stringPosition : 0}
                      ref="stringPosition"
                    />
                  </div>} 
                  {conditionType === 'Substring' &&
                  <div>
                    <TextField
                      type="number"
                      errorText={this.state.stringLengthError ? this.state.stringLengthError : "Number of characters"}
                      errorStyle={{color: this.state.stringLengthError ? 'red' : 'unset'}}
                      hintText="Value"
                      floatingLabelText="Length"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.stringLength !== undefined  ? condition.stringLength : 1}
                      ref="stringLength"
                    />
                  </div>}                                       
              </div>
            </div>
          </div>
          {!rhsComputedAbsent &&
          <div key={uuidv4()} style={{flex: 0.4, display: 'flex', flexDirection: 'column'}}> 
            <div style={{margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>RHS</div>
              <RadioButtonGroup name="rightComputedMode" 
                defaultSelected={rightComputedMode}
                data-sheet={sheet} data-key={fields[mapkey]} 
                style={{display: 'flex', flexDirection: 'row'}}
                onChange={this.updateAdvancedRightComputedMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
              >
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="Static Value"
                  label="Static Value"
                  style={{marginBottom: 16}}
                />
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="Lookup Value"
                  label="Lookup Value"
                  style={{marginBottom: 16}}
                />
              </RadioButtonGroup>  
              <div key={uuidv4()} style={{display: 'flex', flexDirection: 'row'}}> 
                {rightComputedMode !== 'Lookup Value' && !(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
                  <div style={{margin: 5}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
                    <TextField
                      errorText={this.state.rightError ? this.state.rightError : "This value will be used in comparison"}
                      errorStyle={{color: this.state.rightError ? 'red' : 'unset'}}
                      fullWidth={true}
                      hintText="Value"
                      floatingLabelText="Compared"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.rightComputedValue && condition.rightComputedValue.staticValue ? 
                            condition.rightComputedValue.staticValue : ''}
                      ref="rightStaticValue"
                    />
                  </div>
                }

                {rightComputedMode === 'Lookup Value' && !(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
                  <div style={{margin: 5, marginBottom: 40}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                      <SelectField 
                        floatingLabelText="Sheet"
                        errorText={this.state.rightSheetError ? this.state.rightSheetError : ""}
                        errorStyle={{color: this.state.rightSheetError ? 'red' : 'unset'}}
                        value={condition && condition.rightComputedValue.lookupSheet ? condition.rightComputedValue.lookupSheet : sourceSheet}
                        onChange={this.updateAdvancedRightConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="rightSheetValue"
                      >
                        <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                      </SelectField>
                      <SelectField 
                        floatingLabelText="Attribute"
                        errorText={this.state.rightKeyError ? this.state.rightKeyError : "Looked up value will be used in comparison"}
                        errorStyle={{color: this.state.rightKeyError ? 'red' : 'unset'}}
                        value={condition && condition.rightComputedValue.lookupKey ? condition.rightComputedValue.lookupKey : ''}
                        onChange={this.updateAdvancedRightConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="rightKeyValue"
                      >
                        {condition && condition.rightComputedValue.lookupSheet &&
                          Object.keys(this.props._state.map.sourceMap[condition.rightComputedValue.lookupSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.rightComputedValue.lookupSheet][sourceKey]}  />  
                            })
                        }
                        {condition && !(condition.rightComputedValue && condition.rightComputedValue.lookupSheet) &&
                          Object.keys(this.props._state.map.sourceMap[sourceSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                            })
                        }
                      </SelectField>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 60, margin: 10 }}>
          <div onClick={e => this.cancel(e)}>
            <label {...Styles.importButtonStyle}  >CANCEL </label>
          </div>
          <div onClick={e => this.submit(e)}>
            <label {...Styles.importButtonStyle}  >SUBMIT </label>
          </div>
        </div> 
      </div>                        
    )
  }
}
