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

export default class SwitchDefaultCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    condition: this.initCondition(this.props.condition),
    resultError: undefined,
    resultSheetError: undefined,
    resultKeyError: undefined,
    resultNameError: undefined,
    resultLookedupSheetError: undefined,
    resultLookedupKeyError: undefined,
    resultLookedupValueError: undefined,
    
    map: this.props._state.map
  }

  initCondition(cond) {
    if (cond)
      return cond;

    var sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = sheet ? Object.keys(this.props._state.map.sourceMap[sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[sheet][colKey] : undefined;

    return ({
      resultMode: 'Static Value',
      resultValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      }
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var condition = this.state.condition ? this.state.condition : {};
    condition.resultValue = condition.resultValue ? condition.resultValue : {}      
    
    if (condition.resultMode === 'Static Value') {
      if (this.refs.resultStaticValue === undefined || this.refs.resultStaticValue.getValue().length === 0) {
        this.setState({resultError: 'Enter a value'});
        return;
      }
      condition.resultValue = condition.resultValue ? condition.resultValue : {}      
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
      this.setState({resultError: undefined});      
    }    

    if (condition.resultMode === 'Lookup Value' || condition.resultMode === 'vLookup Name') {
      if (condition.resultValue && !condition.resultValue.lookupSheet && this.refs.resultSheetValue.props.value)
          condition.resultValue = { lookupSheet: this.refs.resultSheetValue.props.value};
      if (condition.resultValue.lookupSheet === undefined) {
        this.setState({resultSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({resultSheetError: undefined});              
      }

      if (condition.resultValue && !condition.resultValue.lookupKey) {
        this.setState({resultKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({resultKeyError: undefined});              
      }
    }     

    if (condition.resultMode === 'vLookup Name') {
      condition.resultValue = condition.resultValue ? condition.resultValue : {}      
      if (condition.resultValue.lookedupName === undefined) {
        this.setState({condition: condition, 
          resultNameError: 'Choose a vLookup Name',
          resultLookedupSheetError: undefined,
          resultLookedupKeyError: undefined, 
          resultLookedupValueError: undefined});
        return;
      }

      if (condition.resultValue.lookedupSheetName === undefined) {
        this.setState({condition: condition, 
                      resultNameError: undefined,
                      resultLookedupSheetError: 'Invalid vLookup Sheet Name specified',
                      resultLookedupKeyError: undefined, 
                      resultLookedupValueError: undefined});
        return;
      }
      if (condition.resultValue.lookedupKey === undefined) {
        this.setState({condition: condition, 
                        resultNameError: undefined,
                        resultLookedupSheetError: undefined,
                        resultLookedupKeyError: 'Invalid vLookup key column position specified', 
                        resultLookedupValueError: undefined});
        return;
      }
      if (condition.resultValue.lookedupValue === undefined) {
        this.setState({condition: condition, 
                        resultNameError: undefined,
                        resultLookedupSheetError: undefined,
                        resultLookedupKeyError: undefined,
                        resultLookedupValueError: 'Invalid vLookup value column position specified'});
        return;
      }
      this.setState({condition: condition, 
                    resultNameError: undefined,
                    resultLookedupSheetError: undefined,
                    resultLookedupKeyError: undefined, 
                    resultLookedupValueError: undefined});
    }
    
    this.props.submit(condition, this.props.resultMode);    
  }

  updateAdvancedResultConditionMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    condition.resultMode = value;
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }
    
    this.setState({condition: condition});    
  }  

  updateAdvancedResultConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    condition.resultValue.lookupSheet = value;

    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    this.setState({condition: condition});    
  }
    
  updateAdvancedResultConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    condition.resultValue.lookupSheet = condition.resultValue.lookupSheet ? condition.resultValue.lookupSheet : sourceSheet;
    condition.resultValue.lookupKey = value;
    condition.resultValue.lookupName = this.state.map.sourceMap[condition.resultValue.lookupSheet][value];
    
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupName = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    condition.resultValue.lookedupName = value;
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === value;
    })

    var sourceSheets = nlup.reuseSource ? 
                        Object.keys(this.props._state.map.sourceMap) :
                        Object.keys(nlup.externalLookupSourceMap);
    condition.resultValue.lookedupSheetName = sourceSheets[0];

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.resultValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.resultValue.lookedupSheetName];

    condition.resultValue.lookedupKey = 'A';
    condition.resultValue.lookedupKeyName = sourceMap.A;
    condition.resultValue.lookedupValue = 'A';
    condition.resultValue.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupSheet = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.resultValue.lookedupName;
    })

    condition.resultValue.lookedupSheetName = value;
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.resultValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.resultValue.lookedupSheetName];

    condition.resultValue.lookedupKey = 'A';
    condition.resultValue.lookedupKeyName = sourceMap.A;
    condition.resultValue.lookedupValue = 'A';
    condition.resultValue.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupKey = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.resultValue.lookedupName;
    })

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.resultValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.resultValue.lookedupSheetName];

    condition.resultValue.lookedupKey = CHARCODES[index];
    condition.resultValue.lookedupKeyName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupValue = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.resultValue = condition.resultValue ? condition.resultValue : {}
    if (this.refs.resultStaticValue) {
      condition.resultValue = condition.resultValue ? condition.resultValue : {};
      condition.resultValue.staticValue = this.refs.resultStaticValue.getValue();
    }

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.resultValue.lookedupName;
    })
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.resultValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.resultValue.lookedupSheetName];

    condition.resultValue.lookedupValue = CHARCODES[index];
    condition.resultValue.lookedupValueName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }      
   
  getResultLookedupSheets = (condition) => {
    if (!condition.resultValue.lookedupName)
      return '';
    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.resultValue.lookedupName;
    });

    var sheets = nlup.reuseSource ? Object.keys(this.props._state.map.sourceMap) : Object.keys(nlup.externalLookupSourceMap);
    if (!sheets)
      return '';

    return sheets.map((sheet) => {
      return <MenuItem key={sheet} value={sheet} primaryText={sheet}  />  
    })
  }

  getResultLookedupMenuItems = (condition) => {
    if (!condition.resultValue.lookedupName)
      return '';

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.resultValue.lookedupName;
    });

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.resultValue.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.resultValue.lookedupSheetName];
    if (!sourceMap)
      return '';

    return Object.entries(sourceMap).map((entry) => {
      return <MenuItem key={entry[0]} value={entry[1]} primaryText={entry[1]}  />  
    })
  }

  render() {
    const { sourceSheet, sheet, mapkey, fields, namedlookups } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;
                      
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
          <div {...Styles.resultConditionContainer} >
            <div style={{flex: 0.33, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>DEFAULT VALUE</div>
              <RadioButtonGroup name="mode" 
                defaultSelected={condition.resultMode}
                data-sheet={sheet} data-key={fields[mapkey]} 
                onChange={this.updateAdvancedResultConditionMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
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
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="vLookup Name"
                  label="vLookup Name"
                  style={{marginBottom: 16}}
                />
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="Empty Value"
                  label="Empty Value"
                  style={{marginBottom: 16}}
                />
                <RadioButton
                  iconStyle={{fill: root.switchStyleFillColor}}
                  value="Skip Row"
                  label="Skip Row"
                  style={{marginBottom: 16}}
                />
              </RadioButtonGroup>
            </div>

            {condition.resultMode === 'Static Value' &&
              <div style={{flex: 0.6, margin: 5}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
                <TextField
                  errorText={this.state.resultError ? this.state.resultError : 
                              "This value will be assigned when the condition is met"}
                  errorStyle={{color: this.state.resultError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Value"
                  defaultValue={condition && condition.resultValue && condition.resultValue.staticValue ? 
                        condition.resultValue.staticValue : ''}
                  ref="resultStaticValue"
                />
              </div>
            }
            
            {condition.resultMode === 'Lookup Value' &&
              <div style={{flex: 0.6, margin: 5}}>
                <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                  <SelectField 
                    floatingLabelText="Sheet"
                    errorText={this.state.resultSheetError ? this.state.resultSheetError : ""}
                    errorStyle={{color: this.state.resultSheetError ? 'red' : 'unset'}}
                    value={condition && condition.resultValue && condition.resultValue.lookupSheet ? condition.resultValue.lookupSheet : sourceSheet}
                    onChange={this.updateAdvancedResultConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="resultSheetValue"
                  >
                    <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                  </SelectField>
                  <SelectField 
                    floatingLabelText="Attribute"
                    errorText={this.state.resultKeyError ? this.state.resultKeyError : 
                      "This value will be assigned when condition is met"}
                    errorStyle={{color: this.state.resultKeyError ? 'red' : 'unset'}}
                    value={condition && condition.resultValue && condition.resultValue.lookupKey ? condition.resultValue.lookupKey : ''}
                    onChange={this.updateAdvancedResultConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="resultKeyValue"
                  >
                    {condition && condition.resultValue && condition.resultValue.lookupSheet &&
                      Object.keys(this.props._state.map.sourceMap[condition.resultValue.lookupSheet])
                        .map((sourceKey) => {
                          return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.resultValue.lookupSheet][sourceKey]}  />  
                        })
                    }
                    {condition && !(condition.resultValue && condition.resultValue.lookupSheet) &&
                      Object.keys(this.props._state.map.sourceMap[sourceSheet])
                        .map((sourceKey) => {
                          return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                        })
                    }
                  </SelectField>
                </div>
              </div>
            }

            {condition.resultMode === 'vLookup Name' &&
              <div style={{flex: 0.66, margin: 5, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <div style={{flex: 0.5, margin: 5, display: 'flex', flexDirection: 'column'}}>
                  <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                    <SelectField 
                      floatingLabelText="Sheet"
                      errorText={this.state.resultSheetError ? this.state.resultSheetError : "Source sheet"}
                      errorStyle={{color: this.state.resultSheetError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookupSheet ?
                              condition.resultValue.lookupSheet : sourceSheet}
                      onChange={this.updateAdvancedResultConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="resultSheetValue"
                    >
                      <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                    </SelectField>
                    <SelectField 
                      floatingLabelText="Attribute"
                      errorText={this.state.resultKeyError ? this.state.resultKeyError :  "The looked up cell value will be used in mapping"}
                      errorStyle={{color: this.state.resultKeyError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookupKey ? 
                                condition.resultValue.lookupKey : ''}
                      onChange={this.updateAdvancedResultConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                      ref="resultKeyValue"
                    >
                      {condition && condition.resultValue && condition.resultValue.lookupSheet &&
                        Object.keys(this.props._state.map.sourceMap[condition.resultValue.lookupSheet])
                          .map((sourceKey) => {
                            return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.resultValue.lookupSheet][sourceKey]}  />  
                          })
                      }
                      {!(condition && condition.resultValue && condition.resultValue.lookupSheet) &&
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
                      errorText={this.state.resultNameError ? this.state.resultNameError : "vLookup Name"}
                      errorStyle={{color: this.state.resultNameError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookedupName ? 
                                condition.resultValue.lookedupName : ''}
                      onChange={this.updateAdvancedResultConditionLookedupName.bind(this, condition)}
                      ref="resultLookedupNameValue"
                    >
                      {namedlookups && namedlookups.length > 0 && 
                        namedlookups.map((nlup) => {
                            return <MenuItem key={nlup.lookupName} value={nlup.lookupName} primaryText={nlup.lookupName}  />  
                          })
                      }
                    </SelectField>
                    <SelectField 
                      floatingLabelText="vLookup Sheet"
                      errorText={this.state.resultLookedupSheetError ? this.state.resultLookedupSheetError : "vLookup Sheet"}
                      errorStyle={{color: this.state.resultLookedupSheetError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookedupSheetName !== undefined ? 
                              condition.resultValue.lookedupSheetName : ''}
                      onChange={this.updateAdvancedResultConditionLookedupSheet.bind(this, condition)}
                      ref="resultLookedupSheetValue"
                    >
                      {namedlookups && namedlookups.length > 0 && condition.resultValue && 
                        condition.resultValue.lookedupName !== undefined &&
                        this.getResultLookedupSheets(condition)
                      }
                    </SelectField>   
                    <SelectField 
                      floatingLabelText="vLookup Key"
                      errorText={this.state.resultLookedupKeyError ? this.state.resultLookedupKeyError : "vLookup Key"}
                      errorStyle={{color: this.state.resultLookedupKeyError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookedupKeyName !== undefined ? 
                              condition.resultValue.lookedupKeyName : ''}
                      onChange={this.updateAdvancedResultConditionLookedupKey.bind(this, condition)}
                      ref="resultLookedupKeyValue"
                    >
                      {namedlookups && namedlookups.length > 0 && condition.resultValue && 
                        condition.resultValue.lookedupName !== undefined &&
                        this.getResultLookedupMenuItems(condition)
                      }
                    </SelectField>
                    <SelectField 
                      floatingLabelText="vLookup Value"
                      errorText={this.state.resultLookedupValueError ? this.state.resultLookedupValueError : "vLookup Value"}
                      errorStyle={{color: this.state.resultLookedupValueError ? 'red' : 'unset'}}
                      value={condition && condition.resultValue && condition.resultValue.lookedupValueName !== undefined ? 
                              condition.resultValue.lookedupValueName : ''}
                      onChange={this.updateAdvancedResultConditionLookedupValue.bind(this, condition)}
                      ref="resultLookedupValueValue"
                    >
                      {namedlookups && namedlookups.length > 0 && condition.resultValue && 
                        condition.resultValue.lookedupName !== undefined &&
                        this.getResultLookedupMenuItems(condition)
                      }
                    </SelectField>
                  </div>
                </div>
              </div>
            }
            
          </div>
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
