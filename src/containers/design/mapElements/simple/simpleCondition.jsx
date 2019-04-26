import React from 'react';
import uuidv4 from 'uuid/v4'; 
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import PropTypes from 'prop-types';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const CHARCODES = {
  "0": "A","1": "B","2": "C","3": "D","4": "E","5": "F","6": "G","7": "H","8": "I","9": "J","10": "K","11": "L","12": "M","13": "N","14": "O","15": "P","16": "Q","17": "R","18": "S","19": "T","20": "U","21": "V","22": "W","23": "X","24": "Y","25": "Z","26": "AA","27": "AB","28": "AC","29": "AD","30": "AE","31": "AF","32": "AG","33": "AH","34": "AI","35": "AJ","36": "AK","37": "AL","38": "AM","39": "AN","40": "AO","41": "AP","42": "AQ","43": "AR","44": "AS","45": "AT","46": "AU","47": "AV","48": "AW","49": "AX","50": "AY","51": "AZ","52": "BA","53": "BB","54": "BC","55": "BD","56": "BE","57": "BF","58": "BG","59": "BH","60": "BI","61": "BJ","62": "BK","63": "BL","64": "BM","65": "BN","66": "BO","67": "BP","68": "BQ","69": "BR","70": "BS","71": "BT","72": "BU","73": "BV","74": "BW","75": "BX","76": "BY","77": "BZ"
}

export default class SimpleCondition extends React.Component {
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
    map: this.props._state.map
  }

  initCondition(cond) {
    if (cond) {
      return ({
        leftSimpleMode: cond.leftSimpleMode,
        leftSimpleValue: cond.leftSimpleValue,
      });
    }

    var sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = sheet ? Object.keys(this.props._state.map.sourceMap[sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[sheet][colKey] : undefined;

    return ({
      leftSimpleMode: 'Lookup Value',
      leftSimpleValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      }
    });
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({condition: this.initCondition(this.props.condition)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var condition = this.state.condition ? this.state.condition : {};

    
    if (condition.leftSimpleMode === 'Static Value') {
      if (this.refs.leftStaticValue === undefined || this.refs.leftStaticValue.getValue().length === 0) {
        this.setState({leftError: 'Enter a value'});
        return;
      }
      condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}      
      condition.leftSimpleValue.staticValue = this.refs.leftStaticValue.getValue();
      this.setState({leftError: undefined});      
    }

    if (condition.leftSimpleMode === 'Lookup Value' || condition.leftSimpleMode === 'vLookup Name') {
      if (condition.leftSimpleValue && !condition.leftSimpleValue.lookupSheet && this.refs.leftSheetValue.props.value)
        condition.leftSimpleValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (condition.leftSimpleValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (condition.leftSimpleValue && !condition.leftSimpleValue.lookupKey) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    }     
        
    if (condition.leftSimpleMode === 'vLookup Name') {
      condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}      
      if (condition.leftSimpleValue.lookedupName === undefined) {
        this.setState({condition: condition, 
          leftNameError: 'Choose a vLookup Name',
          leftLookedupSheetError: undefined,
          leftLookedupKeyError: undefined, 
          leftLookedupValueError: undefined});
        return;
      }

      if (condition.leftSimpleValue.lookedupSheetName === undefined) {
        this.setState({condition: condition, 
                      leftNameError: undefined,
                      leftLookedupSheetError: 'Invalid vLookup Sheet Name specified',
                      leftLookedupKeyError: undefined, 
                      leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftSimpleValue.lookedupKey === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        leftLookedupSheetError: undefined,
                        leftLookedupKeyError: 'Invalid vLookup key column position specified', 
                        leftLookedupValueError: undefined});
        return;
      }
      if (condition.leftSimpleValue.lookedupValue === undefined) {
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

    this.props.submit(condition, this.props.index);    
  }

  updateAdvancedLeftSimpleMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftSimpleMode = value;
    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {};
    if (value === 'Lookup Value') {
      condition.leftSimpleValue.lookupSheet = condition.leftSimpleValue.lookupSheet ? 
        condition.leftSimpleValue.lookupSheet : undefined;
      condition.leftSimpleValue.lookupKey = condition.leftSimpleValue.lookupKey ? 
        condition.leftSimpleValue.lookupKey : undefined;
      condition.leftSimpleValue.lookupName = condition.leftSimpleValue.lookupName ? 
        condition.leftSimpleValue.lookupName : undefined;
    } else if (value === 'vLookup Name') {
      condition.leftSimpleValue.lookedupName = condition.leftSimpleValue.lookedupName ? 
        condition.leftSimpleValue.lookedupName : undefined ;
    } else if (value === 'Static Value') {
      condition.leftSimpleValue.staticValue = condition.leftSimpleValue.staticValue ? 
        condition.leftSimpleValue.staticValue : undefined ;
    }

    this.setState({condition: condition});
  }  

  updateAdvancedLeftSimpleLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    condition.leftSimpleValue.lookupSheet = value;

    var _key = Object.keys(this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet])[0];
    condition.leftSimpleValue.lookupKey = _key;
    condition.leftSimpleValue.lookupName = this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet][key];
    
    this.setState({condition: condition});    
  }
    
  updateAdvancedLeftSimpleLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    condition.leftSimpleValue.lookupSheet = condition.leftSimpleValue.lookupSheet ? condition.leftSimpleValue.lookupSheet : sourceSheet;
    condition.leftSimpleValue.lookupKey = value;
    condition.leftSimpleValue.lookupName = this.state.map.sourceMap[condition.leftSimpleValue.lookupSheet][value];
    
    this.setState({condition: condition});    
  }

  updateAdvancedLeftSimpleLookedupName = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    condition.leftSimpleValue.lookedupName = value;
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === value;
    })

    var sourceSheets = nlup.reuseSource ? 
                        Object.keys(this.props._state.map.sourceMap) :
                        Object.keys(nlup.externalLookupSourceMap);
    condition.leftSimpleValue.lookedupSheetName = sourceSheets[0];

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftSimpleValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftSimpleValue.lookedupSheetName];

    condition.leftSimpleValue.lookedupKey = 'A';
    condition.leftSimpleValue.lookedupKeyName = sourceMap.A;
    condition.leftSimpleValue.lookedupValue = 'A';
    condition.leftSimpleValue.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftSimpleLookedupSheet = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftSimpleValue.lookedupName;
    })

    condition.leftSimpleValue.lookedupSheetName = value;
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftSimpleValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftSimpleValue.lookedupSheetName];

    condition.leftSimpleValue.lookedupKey = 'A';
    condition.leftSimpleValue.lookedupKeyName = sourceMap.A;
    condition.leftSimpleValue.lookedupValue = 'A';
    condition.leftSimpleValue.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftSimpleLookedupKey = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftSimpleValue.lookedupName;
    })

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftSimpleValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftSimpleValue.lookedupSheetName];

    condition.leftSimpleValue.lookedupKey = CHARCODES[index];
    condition.leftSimpleValue.lookedupKeyName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }    

  updateAdvancedLeftSimpleLookedupValue = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.leftSimpleValue = condition.leftSimpleValue ? condition.leftSimpleValue : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftSimpleValue.lookedupName;
    })
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftSimpleValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftSimpleValue.lookedupSheetName];

    condition.leftSimpleValue.lookedupValue = CHARCODES[index];
    condition.leftSimpleValue.lookedupValueName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }      
  
  getLookedupSheets = (condition) => {
    if (!condition.leftSimpleValue.lookedupName)
      return '';
    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftSimpleValue.lookedupName;
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
    if (!condition.leftSimpleValue.lookedupName)
      return '';

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.leftSimpleValue.lookedupName;
    });

    if (!nlup)
      return '';

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.leftSimpleValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.leftSimpleValue.lookedupSheetName];
    if (!sourceMap)
      return '';

    return Object.entries(sourceMap).map((entry) => {
      return <MenuItem key={entry[0]} value={entry[1]} primaryText={entry[1]}  />  
    })
  }


  render() {
    const { sourceSheet, sheet, mapkey, fields, namedlookups } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;

    var leftSimpleMode = condition && condition.leftSimpleMode ? condition.leftSimpleMode : 'Lookup Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div style={{flex: 0.33, margin: 5}}>
            <RadioButtonGroup name="leftSimpleMode" 
              defaultSelected={leftSimpleMode}
              data-sheet={sheet} data-key={fields[mapkey]} 
              onChange={this.updateAdvancedLeftSimpleMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
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
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Static Value"
                label="Static Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>
          </div>

          {leftSimpleMode === 'Static Value' &&
            <div style={{flex: 0.66, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.leftError ? this.state.leftError : 
                            "Specified value will be assigned"}
                errorStyle={{color: this.state.leftError ? 'red' : 'unset'}}
                style={{width: '50%'}}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={condition && condition.leftSimpleValue && condition.leftSimpleValue.staticValue ? 
                       condition.leftSimpleValue.staticValue : ''}
                ref="leftStaticValue"
              />
            </div>
          }

          {leftSimpleMode === 'Lookup Value' &&
            <div style={{flex: 0.66, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                  errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                  value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet ? 
                            condition.leftSimpleValue.lookupSheet : sourceSheet}
                  onChange={this.updateAdvancedLeftSimpleLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="leftSheetValue"
                >
                  <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up cell value will be used in mapping"}
                  errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                  value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupKey ? 
                            condition.leftSimpleValue.lookupKey : ''}
                  onChange={this.updateAdvancedLeftSimpleLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="leftKeyValue"
                >
                  {condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet &&
                    Object.keys(this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet][sourceKey]}  />  
                      })
                  }
                  {!(condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet) &&
                    Object.keys(this.props._state.map.sourceMap[sourceSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                      })
                  }
                </SelectField>
              </div>
            </div>
          }

          {leftSimpleMode === 'vLookup Name' &&
            <div style={{flex: 0.66, margin: 5, display: 'flex', flexDirection: 'row'}}>
              <div style={{flex: 0.5, margin: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                  <SelectField 
                    floatingLabelText="Sheet"
                    errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                    errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet ?
                             condition.leftSimpleValue.lookupSheet : sourceSheet}
                    onChange={this.updateAdvancedLeftSimpleLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="leftSheetValue"
                  >
                    <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                  </SelectField>
                  <SelectField 
                    floatingLabelText="Attribute"
                    errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up cell value will be used in mapping"}
                    errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupKey ? 
                              condition.leftSimpleValue.lookupKey : ''}
                    onChange={this.updateAdvancedLeftSimpleLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="leftKeyValue"
                  >
                    {condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet &&
                      Object.keys(this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet])
                        .map((sourceKey) => {
                          return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftSimpleValue.lookupSheet][sourceKey]}  />  
                        })
                    }
                    {!(condition && condition.leftSimpleValue && condition.leftSimpleValue.lookupSheet) &&
                      Object.keys(this.props._state.map.sourceMap[sourceSheet])
                        .map((sourceKey) => {
                          return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                        })
                    }
                  </SelectField>  
                </div>
              </div>
              <div style={{flex: 0.5, margin: 5}}>
                <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}></div>
                  <SelectField 
                    floatingLabelText="vLookup Name"
                    errorText={this.state.leftNameError ? this.state.leftNameError : "vLookup Name"}
                    errorStyle={{color: this.state.leftNameError ? 'red' : 'unset'}}
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookedupName ? 
                              condition.leftSimpleValue.lookedupName : ''}
                    onChange={this.updateAdvancedLeftSimpleLookedupName.bind(this, condition)}
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
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookedupSheetName !== undefined ? 
                            condition.leftSimpleValue.lookedupSheetName : ''}
                    onChange={this.updateAdvancedLeftSimpleLookedupSheet.bind(this, condition)}
                    ref="leftLookedupSheetValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.leftSimpleValue && 
                      condition.leftSimpleValue.lookedupName !== undefined &&
                      this.getLookedupSheets(condition)
                    }
                  </SelectField>   
                  <SelectField 
                    floatingLabelText="vLookup Key"
                    errorText={this.state.leftLookedupKeyError ? this.state.leftLookedupKeyError : "vLookup Key"}
                    errorStyle={{color: this.state.leftLookedupKeyError ? 'red' : 'unset'}}
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookedupKeyName !== undefined ? 
                            condition.leftSimpleValue.lookedupKeyName : ''}
                    onChange={this.updateAdvancedLeftSimpleLookedupKey.bind(this, condition)}
                    ref="leftLookedupKeyValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.leftSimpleValue && 
                      condition.leftSimpleValue.lookedupName !== undefined &&
                      this.getLookedupMenuItems(condition)
                    }
                  </SelectField>
                  <SelectField 
                    floatingLabelText="vLookup Value"
                    errorText={this.state.leftLookedupValueError ? this.state.leftLookedupValueError : "vLookup Value"}
                    errorStyle={{color: this.state.leftLookedupValueError ? 'red' : 'unset'}}
                    value={condition && condition.leftSimpleValue && condition.leftSimpleValue.lookedupValueName !== undefined ? 
                            condition.leftSimpleValue.lookedupValueName : ''}
                    onChange={this.updateAdvancedLeftSimpleLookedupValue.bind(this, condition)}
                    ref="leftLookedupValueValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.leftSimpleValue && 
                      condition.leftSimpleValue.lookedupName !== undefined &&
                      this.getLookedupMenuItems(condition)
                    }
                  </SelectField>
                </div>
              </div>
            </div>
          }
          
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
