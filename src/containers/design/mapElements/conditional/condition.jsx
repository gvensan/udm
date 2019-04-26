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
  'Is Empty',
  'Is Not Empty',
  'Equals to',
  'Not Equals to',
  'Less than',
  'Less than or Equals to',
  'Greater than',
  'Greater than or Equals to',
  'Starts With',
  'Ends With',
  'Contains',
  'Substring'
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

export default class Condition extends React.Component {
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
    rightError: undefined,
    rigthSheetError: undefined,
    rightKeyError: undefined,
    subStringError: undefined,
    stringPositionError: undefined,
    stringLengthError: undefined,
    map: this.props._state.map
  }

  initCondition(cond) {
    if (cond) {
      return ({
        conditionType: cond.conditionType,
        leftConditionMode: cond.leftConditionMode,
        leftConditionValue: cond.leftConditionValue,
        rightConditionMode: cond.rightConditionMode,
        rightConditionValue: cond.rightConditionValue,
        subString: cond.subString,
        stringPosition: cond.stringPosition,
        stringLength: cond.stringLength
      });
    }

    var sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = sheet ? Object.keys(this.props._state.map.sourceMap[sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[sheet][colKey] : undefined;

    return ({
      conditionType: 'Is Empty',
      leftConditionMode: 'Lookup Value',
      leftConditionValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      },
      rightConditionMode: 'Static Value',
      rightConditionValue:  {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      },
      subString: '',
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
    if (condition.leftConditionMode === 'Lookup Value' || condition.leftConditionMode === 'vLookup Name') {
      if (condition.leftConditionValue && !condition.leftConditionValue.lookupSheet && this.refs.leftSheetValue.props.value)
        condition.leftConditionValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (condition.leftConditionValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (condition.leftConditionValue.lookupKey === undefined) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    } 

    if (condition.leftConditionMode === 'vLookup Name') {
      condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}      
      if (condition.leftConditionValue.lookedupName === undefined) {
        this.setState({condition: condition, 
          leftNameError: 'Choose a vLookup Name',
          leftLookedupSheetError: undefined,
          leftLookedupKeyError: undefined, 
          leftLookedupValueError: undefined});
        return;
      }

      if (condition.leftConditionValue.lookedupSheetName === undefined) {
        this.setState({condition: condition, 
                      leftNameError: undefined,
                      leftLookedupSheetError: 'Invalid vLookup Sheet Name specified',
                      leftLookedupKeyError: undefined, 
                      leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftConditionValue.lookedupKey === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        leftLookedupSheetError: undefined,
                        leftLookedupKeyError: 'Invalid vLookup key column position specified', 
                        leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftConditionValue.lookedupValue === undefined) {
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

    if (this.refs.subString)
      condition.subString = this.refs.subString.getValue();
    if (this.refs.stringPosition)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength)
      condition.stringLength = this.refs.stringLength.getValue();

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

    if ((condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
        condition.conditionType === 'Contains') && this.refs.subString) {
      if (this.refs.subString.getValue().length > 0) {
        condition.subString = this.refs.subString.getValue();
        this.setState({subStringError: undefined});        
      } else {
        this.setState({subStringError: 'Specify a valid string'});
        return;      
      }
    }    
        
    if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty' ||
          condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
          condition.conditionType === 'Contains')) {
      if (condition.rightConditionMode === 'Static Value') {
        if (this.refs.rightStaticValue === undefined || this.refs.rightStaticValue.getValue().length === 0) {
          this.setState({rightError: 'Enter a value'});
          return;
        }
        condition.rightConditionValue = condition.rightConditionValue ? condition.rightConditionValue : {}      
        condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();
        this.setState({rightError: undefined});      
      }

      if (condition.rightConditionMode === 'Lookup Value') {
        if (condition.rightConditionValue && !condition.rightConditionValue.lookupSheet && this.refs.rightSheetValue.props.value)
          condition.rightConditionValue = { lookupSheet: this.refs.rightSheetValue.props.value};

        if (condition.rightConditionValue.lookupSheet === undefined) {
          this.setState({rightSheetError: 'Choose a source sheet'});
          return;
        } else {
          this.setState({rightSheetError: undefined});              
        }

        if (condition.rightConditionValue.lookupKey === undefined) {
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
    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      else
        condition.stringPosition = 0;
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
      else
        condition.stringLength = 1;
    }    

    if (condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
        condition.conditionType === 'Contains') {
      if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();
      else
        condition.subString = '';
    }
    
    this.setState({condition: condition});
  }  
  
  updateAdvancedLeftConditionMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftConditionMode = value;
    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {};
    if (value === 'Lookup Value') {
      condition.leftConditionValue.lookupSheet = condition.leftConditionValue.lookupSheet ? 
        condition.leftConditionValue.lookupSheet : undefined;
      condition.leftConditionValue.lookupKey = condition.leftConditionValue.lookupKey ? 
        condition.leftConditionValue.lookupKey : undefined;
      condition.leftConditionValue.lookupName = condition.leftConditionValue.lookupName ? 
        condition.leftConditionValue.lookupName : undefined;
    } else if (value === 'vLookup Name') {
      condition.leftConditionValue.lookedupName = condition.leftConditionValue.lookedupName ? 
        condition.leftConditionValue.lookedupName : undefined ;
    } else if (value === 'Static Value') {
      condition.leftConditionValue.staticValue = condition.leftConditionValue.staticValue ? 
        condition.leftConditionValue.staticValue : undefined ;
    }

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});
  }  

  updateAdvancedLeftConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    condition.leftConditionValue.lookupSheet = value;
    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();
    
    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();
    
    this.setState({condition: condition});    
  }
    
  updateAdvancedLeftConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    condition.leftConditionValue.lookupSheet = condition.leftConditionValue.lookupSheet ? 
        condition.leftConditionValue.lookupSheet : sourceSheet;
    condition.leftConditionValue.lookupKey = value;
    condition.leftConditionValue.lookupName = this.state.map.sourceMap[condition.leftConditionValue.lookupSheet][value];
    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();
    
    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();
    
    this.setState({condition: condition});    
  }    

  updateAdvancedRightConditionMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.rightConditionMode = value;
    condition.rightConditionValue = condition.rightConditionValue ? condition.rightConditionValue : {};
    if (value === 'Lookup Value') {
      condition.rightConditionValue.lookupSheet = condition.rightConditionValue.lookupSheet ? 
        condition.rightConditionValue.lookupSheet : undefined;
      condition.rightConditionValue.lookupKey = condition.rightConditionValue.lookupKey ? 
        condition.rightConditionValue.lookupKey : undefined;
      condition.rightConditionValue.lookupName = condition.rightConditionValue.lookupName ? 
        condition.rightConditionValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      condition.rightConditionValue.staticValue = condition.rightConditionValue.staticValue ? 
        condition.rightConditionValue.staticValue : undefined ;
    }

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});
  }  

  updateAdvancedRightConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.rightConditionValue = condition.rightConditionValue ? condition.rightConditionValue : {}
    condition.rightConditionValue.lookupSheet = value;
    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();
    
    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();
    
    this.setState({condition: condition});    
  }
    
  updateAdvancedRightConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.rightConditionValue = condition.rightConditionValue ? condition.rightConditionValue : {}
    condition.rightConditionValue.lookupSheet = condition.rightConditionValue.lookupSheet ? 
        condition.rightConditionValue.lookupSheet : sourceSheet;
    condition.rightConditionValue.lookupKey = value;
    condition.rightConditionValue.lookupName = this.state.map.sourceMap[condition.rightConditionValue.lookupSheet][value];
    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();
    
    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();
    
    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupName = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    condition.leftConditionValue.lookedupName = value;
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === value;
    })

    var sourceSheets = nlup.reuseSource ? 
                        Object.keys(this.props._state.map.sourceMap) :
                        Object.keys(nlup.externalLookupSourceMap);
    condition.leftConditionValue.lookedupSheetName = sourceSheets[0];

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftConditionValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftConditionValue.lookedupSheetName];

    condition.leftConditionValue.lookedupKey = 'A';
    condition.leftConditionValue.lookedupKeyName = sourceMap.A;
    condition.leftConditionValue.lookedupValue = 'A';
    condition.leftConditionValue.lookedupValueName = sourceMap.A;

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

      if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupSheet = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftConditionValue.lookedupName;
    })

    condition.leftConditionValue.lookedupSheetName = value;
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftConditionValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftConditionValue.lookedupSheetName];

    condition.leftConditionValue.lookedupKey = 'A';
    condition.leftConditionValue.lookedupKeyName = sourceMap.A;
    condition.leftConditionValue.lookedupValue = 'A';
    condition.leftConditionValue.lookedupValueName = sourceMap.A;

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupKey = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftConditionValue.lookedupName;
    })

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftConditionValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftConditionValue.lookedupSheetName];

    condition.leftConditionValue.lookedupKey = CHARCODES[index];
    condition.leftConditionValue.lookedupKeyName = sourceMap[CHARCODES[index]];

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftConditionLookedupValue = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftConditionValue.lookedupName;
    })
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftConditionValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftConditionValue.lookedupSheetName];

    condition.leftConditionValue.lookedupValue = CHARCODES[index];
    condition.leftConditionValue.lookedupValueName = sourceMap[CHARCODES[index]];

    if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
      condition.stringPosition = this.refs.stringPosition.getValue();
    if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
      condition.stringLength = this.refs.stringLength.getValue();
    if (this.refs.subString && this.refs.subString.getValue().length > 0)
        condition.subString = this.refs.subString.getValue();

    if (this.refs.rightStaticValue) 
      condition.rightConditionValue.staticValue = this.refs.rightStaticValue.getValue();

    this.setState({condition: condition});    
  }      
  
  getLookedupSheets = (condition) => {
    if (!condition.leftConditionValue.lookedupName)
      return '';
    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftConditionValue.lookedupName;
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
    if (!condition.leftConditionValue.lookedupName)
      return '';

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftConditionValue.lookedupName;
    });

    if (!nlup)
      return '';

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftConditionValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftConditionValue.lookedupSheetName];
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
    var rhsConditionalAbsent = (conditionType === 'Is Empty' || conditionType === 'Is Not Empty');
    var rightConditionMode = condition && condition.rightConditionMode ? condition.rightConditionMode : 'Lookup Value';
    var leftConditionMode = condition && condition.leftConditionMode ? condition.leftConditionMode : 'Lookup Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}} >
        <div key={uuidv4()} {...Styles.conditionContainer}> 
          <div key={uuidv4()} style={{flex: 0.4, display: 'flex', flexDirection: 'column'}}> 
            <div style={{margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>LHS</div>
              <RadioButtonGroup name="leftConditionMode" 
                defaultSelected={leftConditionMode}
                data-sheet={sheet} data-key={fields[mapkey]} 
                style={{display: 'flex', flexDirection: 'row'}}
                onChange={this.updateAdvancedLeftConditionMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
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
              {leftConditionMode === 'Lookup Value' &&
                <div style={{margin: 5}}>
                  <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                    <SelectField 
                      floatingLabelText="Sheet"
                      errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                      errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                      value={condition && condition.leftConditionValue.lookupSheet ? condition.leftConditionValue.lookupSheet : sourceSheet}
                      onChange={this.updateAdvancedLeftConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="leftSheetValue"
                    >
                      <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                    </SelectField>
                    <SelectField 
                      floatingLabelText="Attribute"
                      errorText={this.state.leftKeyError ? this.state.leftKeyError : 
                        "The looked up value will be " + (rhsConditionalAbsent ? "checked" : "compared")}
                      errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                      value={condition && condition.leftConditionValue.lookupKey ? condition.leftConditionValue.lookupKey : ''}
                      onChange={this.updateAdvancedLeftConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="leftKeyValue"
                    >
                      {condition && condition.leftConditionValue && condition.leftConditionValue.lookupSheet &&
                        Object.keys(this.props._state.map.sourceMap[condition.leftConditionValue.lookupSheet])
                          .map((sourceKey) => {
                            return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftConditionValue.lookupSheet][sourceKey]}  />  
                          })
                      }
                      {condition && !(condition.leftConditionValue && condition.leftConditionValue.lookupSheet) &&
                        Object.keys(this.props._state.map.sourceMap[sourceSheet])
                          .map((sourceKey) => {
                            return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                          })
                      }
                    </SelectField>
                  </div>
                </div>
              }

              {leftConditionMode === 'vLookup Name' &&
                <div style={{margin: 5, display: 'flex', flexDirection: 'row'}}>
                  <div style={{margin: 5, display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                      <SelectField 
                        floatingLabelText="Sheet"
                        errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                        errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookupSheet ?
                                condition.leftConditionValue.lookupSheet : sourceSheet}
                        onChange={this.updateAdvancedLeftConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="leftSheetValue"
                      >
                        <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                      </SelectField>
                      <SelectField 
                        floatingLabelText="Attribute"
                        errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up cell value will be used in mapping"}
                        errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookupKey ? 
                                  condition.leftConditionValue.lookupKey : ''}
                        onChange={this.updateAdvancedLeftConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="leftKeyValue"
                      >
                        {condition && condition.leftConditionValue && condition.leftConditionValue.lookupSheet &&
                          Object.keys(this.props._state.map.sourceMap[condition.leftConditionValue.lookupSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftConditionValue.lookupSheet][sourceKey]}  />  
                            })
                        }
                        {!(condition && condition.leftConditionValue && condition.leftConditionValue.lookupSheet) &&
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
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookedupName ? 
                                  condition.leftConditionValue.lookedupName : ''}
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
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookedupSheetName !== undefined ? 
                                condition.leftConditionValue.lookedupSheetName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupSheet.bind(this, condition)}
                        ref="leftLookedupSheetValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftConditionValue && 
                          condition.leftConditionValue.lookedupName !== undefined &&
                          this.getLookedupSheets(condition)
                        }
                      </SelectField>   
                      <SelectField 
                        floatingLabelText="vLookup Key"
                        errorText={this.state.leftLookedupKeyError ? this.state.leftLookedupKeyError : "vLookup Key"}
                        errorStyle={{color: this.state.leftLookedupKeyError ? 'red' : 'unset'}}
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookedupKeyName !== undefined ? 
                                condition.leftConditionValue.lookedupKeyName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupKey.bind(this, condition)}
                        ref="leftLookedupKeyValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftConditionValue && 
                          condition.leftConditionValue.lookedupName !== undefined &&
                          this.getLookedupMenuItems(condition)
                        }
                      </SelectField>
                      <SelectField 
                        floatingLabelText="vLookup Value"
                        errorText={this.state.leftLookedupValueError ? this.state.leftLookedupValueError : "vLookup Value"}
                        errorStyle={{color: this.state.leftLookedupValueError ? 'red' : 'unset'}}
                        value={condition && condition.leftConditionValue && condition.leftConditionValue.lookedupValueName !== undefined ? 
                                condition.leftConditionValue.lookedupValueName : ''}
                        onChange={this.updateAdvancedLeftConditionLookedupValue.bind(this, condition)}
                        ref="leftLookedupValueValue"
                      >
                        {namedlookups && namedlookups.length > 0 && condition.leftConditionValue && 
                          condition.leftConditionValue.lookedupName !== undefined &&
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
                  errorText={<div>Supports empty and comparison checks</div>}
                  errorStyle={{color: 'unset'}}
                  autoWidth={true}
                  value={conditionType}
                  onChange={this.updateAdvancedConditionType.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="conditionValue"              
                >
                  {simpleConditionsList.map((condition, index) => {
                    return <MenuItem key={simpleConditionsList[index]} value={simpleConditionsList[index]} primaryText={simpleConditionsList[index]}  />  
                  })}
                </SelectField>
                {(conditionType === 'Starts With' || conditionType === 'Ends With' || conditionType === 'Contains') &&
                  <div>
                    <TextField
                      errorText={this.state.subStringError ? this.state.subStringError : "Specify a valid string"}
                      errorStyle={{color: this.state.subStringError ? 'red' : 'unset'}}
                      hintText="Substring"
                      floatingLabelText="Substring"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.subString !== undefined ? condition.subString : 0}
                      ref="subString"
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
          {!(conditionType === 'Is Empty' || conditionType === 'Is Not Empty' || 
            conditionType === 'Starts With' || conditionType === 'Ends With' || conditionType === 'Contains') &&
          <div key={uuidv4()} style={{flex: 0.4, display: 'flex', flexDirection: 'column'}}> 
            <div style={{margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>RHS</div>
              <RadioButtonGroup name="rightConditionMode" 
                defaultSelected={rightConditionMode}
                data-sheet={sheet} data-key={fields[mapkey]} 
                style={{display: 'flex', flexDirection: 'row'}}
                onChange={this.updateAdvancedRightConditionMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
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
                {rightConditionMode !== 'Lookup Value' && !(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
                  <div style={{margin: 5}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
                    <TextField
                      errorText={this.state.rightError ? this.state.rightError : "This value will be used in comparison"}
                      errorStyle={{color: this.state.rightError ? 'red' : 'unset'}}
                      fullWidth={true}
                      hintText="Value"
                      floatingLabelText="Compared"
                      data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                      defaultValue={condition && condition.rightConditionValue && condition.rightConditionValue.staticValue ? 
                            condition.rightConditionValue.staticValue : ''}
                      ref="rightStaticValue"
                    />
                  </div>
                }

                {rightConditionMode === 'Lookup Value' && !(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
                  <div style={{margin: 5, marginBottom: 40}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                      <SelectField 
                        floatingLabelText="Sheet"
                        errorText={this.state.rightSheetError ? this.state.rightSheetError : ""}
                        errorStyle={{color: this.state.rightSheetError ? 'red' : 'unset'}}
                        value={condition && condition.rightConditionValue.lookupSheet ? condition.rightConditionValue.lookupSheet : sourceSheet}
                        onChange={this.updateAdvancedRightConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="rightSheetValue"
                      >
                        <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                      </SelectField>
                      <SelectField 
                        floatingLabelText="Attribute"
                        errorText={this.state.rightKeyError ? this.state.rightKeyError : "Looked up value will be used in comparison"}
                        errorStyle={{color: this.state.rightKeyError ? 'red' : 'unset'}}
                        value={condition && condition.rightConditionValue.lookupKey ? condition.rightConditionValue.lookupKey : ''}
                        onChange={this.updateAdvancedRightConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                        ref="rightKeyValue"
                      >
                        {condition && condition.rightConditionValue.lookupSheet &&
                          Object.keys(this.props._state.map.sourceMap[condition.rightConditionValue.lookupSheet])
                            .map((sourceKey) => {
                              return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.rightConditionValue.lookupSheet][sourceKey]}  />  
                            })
                        }
                        {condition && !(condition.rightConditionValue && condition.rightConditionValue.lookupSheet) &&
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
