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

export default class ResultCondition extends React.Component {
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
    if (cond) {
      return ({
        mode: cond.mode,
        result: cond.result,
      })
    }

    return ({
      mode: 'Empty Value',
      result: {
        staticValue: ''
      }
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
    if (condition.mode === 'Static Value') {
      if (this.refs.resultStaticValue === undefined || this.refs.resultStaticValue.getValue().length === 0) {
        this.setState({resultError: 'Enter a value'});
        return;
      }
      condition.result = condition.result ? condition.result : {}      
      condition.result.staticValue = this.refs.resultStaticValue.getValue();
      this.setState({resultError: undefined});      
    } 
    
    if (condition.mode === 'Lookup Value' || condition.mode === 'vLookup Name') {
      if (condition.result && !condition.result.lookupSheet && this.refs.resultSheetValue.props.value)
        condition.result = { lookupSheet: this.refs.resultSheetValue.props.value};

      if (condition.result.lookupSheet === undefined) {
        this.setState({resultSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({resultSheetError: undefined});              
      }

      if (!condition.result.lookupKey) {
        this.setState({resultKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({resultKeyError: undefined});              
      }
    }     

    if (condition.mode === 'vLookup Name') {
      condition.result = condition.result ? condition.result : {}      
      if (condition.result.lookedupName === undefined) {
        this.setState({condition: condition, 
          leftNameError: 'Choose a vLookup Name',
          resultLookedupSheetError: undefined,
          resultLookedupKeyError: undefined, 
          resultLookedupValueError: undefined});
        return;
      }

      if (condition.result.lookedupSheetName === undefined) {
        this.setState({condition: condition, 
                      leftNameError: undefined,
                      resultLookedupSheetError: 'Invalid vLookup Sheet Name specified',
                      resultLookedupKeyError: undefined, 
                      resultLookedupValueError: undefined});
        return;
      }
      if (condition.result.lookedupKey === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        resultLookedupSheetError: undefined,
                        resultLookedupKeyError: 'Invalid vLookup key column position specified', 
                        resultLookedupValueError: undefined});
        return;
      }
      if (condition.result.lookedupValue === undefined) {
        this.setState({condition: condition, 
                        leftNameError: undefined,
                        resultLookedupSheetError: undefined,
                        resultLookedupKeyError: undefined,
                        resultLookedupValueError: 'Invalid vLookup value column position specified'});
        return;
      }
      this.setState({condition: condition, 
                    leftNameError: undefined,
                    resultLookedupSheetError: undefined,
                    resultLookedupKeyError: undefined, 
                    resultLookedupValueError: undefined});
    }
    
    this.props.submit(condition, this.props.mode);    
  }

  updateAdvancedResultConditionMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.result = condition.result ? condition.result : {}
    
    var _sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = _sheet ? Object.keys(this.props._state.map.sourceMap[_sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[_sheet][colKey] : undefined;

    condition.mode = value;
    condition.result.lookupSheet = condition.result.lookupSheet ? condition.result.lookupSheet : _sheet;
    condition.result.lookupKey = condition.result.lookupKey ? condition.result.lookupKey : colKey;
    condition.result.lookupName = condition.result.lookupName ? condition.result.lookupName : colName;

    if (this.refs.resultStaticValue) {
      condition.result = condition.result ? condition.result : {};
      condition.result.staticValue = this.refs.resultStaticValue.getValue();
    }
    
    this.setState({condition: condition});    
  }  

  updateAdvancedResultConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.result = condition.result ? condition.result : {}
    condition.result.lookupSheet = value;

    if (this.refs.resultStaticValue) {
      condition.result = condition.result ? condition.result : {};
      condition.result.staticValue = this.refs.resultStaticValue.getValue();
    }

    this.setState({condition: condition});    
  }
    
  updateAdvancedResultConditionLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.result = condition.result ? condition.result : {}
    condition.result.lookupSheet = condition.result.lookupSheet ? condition.result.lookupSheet : sourceSheet;
    condition.result.lookupKey = value;
    condition.result.lookupName = this.state.map.sourceMap[condition.result.lookupSheet][value];
    
    if (this.refs.resultStaticValue) {
      condition.result = condition.result ? condition.result : {};
      condition.result.staticValue = this.refs.resultStaticValue.getValue();
    }

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupName = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.result = condition.result ? condition.result : {}
    condition.result.lookedupName = value;
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === value;
    })

    var sourceSheets = nlup.reuseSource ? 
                        Object.keys(this.props._state.map.sourceMap) :
                        Object.keys(nlup.externalLookupSourceMap);
    condition.result.lookedupSheetName = sourceSheets[0];

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.result.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.result.lookedupSheetName];

    condition.result.lookedupKey = 'A';
    condition.result.lookedupKeyName = sourceMap.A;
    condition.result.lookedupValue = 'A';
    condition.result.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupSheet = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.result = condition.result ? condition.result : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.result.lookedupName;
    })

    condition.result.lookedupSheetName = value;
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.result.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.result.lookedupSheetName];

    condition.result.lookedupKey = 'A';
    condition.result.lookedupKeyName = sourceMap.A;
    condition.result.lookedupValue = 'A';
    condition.result.lookedupValueName = sourceMap.A;

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupKey = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.result = condition.result ? condition.result : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.result.lookedupName;
    })

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.result.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.result.lookedupSheetName];

    condition.result.lookedupKey = CHARCODES[index];
    condition.result.lookedupKeyName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }    

  updateAdvancedResultConditionLookedupValue = (condition, e, index, value) => {
    e.preventDefault();

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return;

    condition.result = condition.result ? condition.result : {}
    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.result.lookedupName;
    })
    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.result.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.result.lookedupSheetName];

    condition.result.lookedupValue = CHARCODES[index];
    condition.result.lookedupValueName = sourceMap[CHARCODES[index]];

    this.setState({condition: condition});    
  }      
  
  getLookedupSheets = (condition) => {
    if (!condition.result.lookedupName)
      return '';
    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.result.lookedupName;
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
    if (!condition.result.lookedupName)
      return '';

    var namedlookups = this.props._state.map.namedlookupsList;
    if (!namedlookups || !namedlookups.length)
      return '';

    var nlup = namedlookups.find((namedLookup) => {
      return namedLookup.lookupName === condition.result.lookedupName;
    });

    if (!nlup)
      return '';

    var sourceMap = nlup.reuseSource ? 
                      this.props._state.map.sourceMap[condition.result.lookedupSheetName] :
                      nlup.externalLookupSourceMap[condition.result.lookedupSheetName];
    if (!sourceMap)
      return '';

    return Object.entries(sourceMap).map((entry) => {
      return <MenuItem key={entry[0]} value={entry[1]} primaryText={entry[1]}  />  
    })
  }

  render() {
    const { sourceSheet, sheet, mapkey, fields, namedlookups } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;

    var mode = condition && condition.mode ? condition.mode : 'Static Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.resultConditionContainer} >
          <div style={{flex: 0.33, margin: 5}}>
            <RadioButtonGroup name="mode" 
              defaultSelected={mode}
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

          {mode === 'Static Value' &&
            <div style={{flex: 0.6, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.resultError ? this.state.resultError : 
                            "This value will be assigned when condition(s) are " + (this.props.mode ? "" : 'not') + " met"}
                errorStyle={{color: this.state.resultError ? 'red' : 'unset'}}
                style={{width: '50%'}}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={condition && condition.result && condition.result.staticValue ? 
                       condition.result.staticValue : ''}
                ref="resultStaticValue"
              />
            </div>
          }
          
          {mode === 'Lookup Value' &&
            <div style={{flex: 0.6, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.resultSheetError ? this.state.resultSheetError : ""}
                  errorStyle={{color: this.state.resultSheetError ? 'red' : 'unset'}}
                  value={condition && condition.result && condition.result.lookupSheet ? condition.result.lookupSheet : sourceSheet}
                  onChange={this.updateAdvancedResultConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="resultSheetValue"
                >
                  <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.resultKeyError ? this.state.resultKeyError : 
                    "This value will be assigned when condition(s) are " + (this.props.mode ? "" : 'not') + " met"}
                  errorStyle={{color: this.state.resultKeyError ? 'red' : 'unset'}}
                  value={condition && condition.result && condition.result.lookupKey ? condition.result.lookupKey : ''}
                  onChange={this.updateAdvancedResultConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="resultKeyValue"
                >
                  {condition && condition.result && condition.result.lookupSheet &&
                    Object.keys(this.props._state.map.sourceMap[condition.result.lookupSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.result.lookupSheet][sourceKey]}  />  
                      })
                  }
                  {condition && !(condition.result && condition.result.lookupSheet) &&
                    Object.keys(this.props._state.map.sourceMap[sourceSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                      })
                  }
                </SelectField>
              </div>
            </div>
          }

          {mode === 'vLookup Name' &&
            <div style={{flex: 0.66, margin: 5, display: 'flex', flexDirection: 'row'}}>
              <div style={{flex: 0.5, margin: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'column', marginBottom: 40}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                  <SelectField 
                    floatingLabelText="Sheet"
                    errorText={this.state.resultSheetError ? this.state.resultSheetError : "Source sheet"}
                    errorStyle={{color: this.state.resultSheetError ? 'red' : 'unset'}}
                    value={condition && condition.result && condition.result.lookupSheet ?
                             condition.result.lookupSheet : sourceSheet}
                    onChange={this.updateAdvancedResultConditionLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="resultSheetValue"
                  >
                    <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                  </SelectField>
                  <SelectField 
                    floatingLabelText="Attribute"
                    errorText={this.state.resultKeyError ? this.state.resultKeyError :  "The looked up cell value will be used in mapping"}
                    errorStyle={{color: this.state.resultKeyError ? 'red' : 'unset'}}
                    value={condition && condition.result && condition.result.lookupKey ? 
                              condition.result.lookupKey : ''}
                    onChange={this.updateAdvancedResultConditionLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                    ref="resultKeyValue"
                  >
                    {condition && condition.result && condition.result.lookupSheet &&
                      Object.keys(this.props._state.map.sourceMap[condition.result.lookupSheet])
                        .map((sourceKey) => {
                          return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.result.lookupSheet][sourceKey]}  />  
                        })
                    }
                    {!(condition && condition.result && condition.result.lookupSheet) &&
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
                    value={condition && condition.result && condition.result.lookedupName ? 
                              condition.result.lookedupName : ''}
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
                    value={condition && condition.result && condition.result.lookedupSheetName !== undefined ? 
                            condition.result.lookedupSheetName : ''}
                    onChange={this.updateAdvancedResultConditionLookedupSheet.bind(this, condition)}
                    ref="resultLookedupSheetValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.result && 
                      condition.result.lookedupName !== undefined &&
                      this.getLookedupSheets(condition)
                    }
                  </SelectField>   
                  <SelectField 
                    floatingLabelText="vLookup Key"
                    errorText={this.state.resultLookedupKeyError ? this.state.resultLookedupKeyError : "vLookup Key"}
                    errorStyle={{color: this.state.resultLookedupKeyError ? 'red' : 'unset'}}
                    value={condition && condition.result && condition.result.lookedupKeyName !== undefined ? 
                            condition.result.lookedupKeyName : ''}
                    onChange={this.updateAdvancedResultConditionLookedupKey.bind(this, condition)}
                    ref="resultLookedupKeyValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.result && 
                      condition.result.lookedupName !== undefined &&
                      this.getLookedupMenuItems(condition)
                    }
                  </SelectField>
                  <SelectField 
                    floatingLabelText="vLookup Value"
                    errorText={this.state.resultLookedupValueError ? this.state.resultLookedupValueError : "vLookup Value"}
                    errorStyle={{color: this.state.resultLookedupValueError ? 'red' : 'unset'}}
                    value={condition && condition.result && condition.result.lookedupValueName !== undefined ? 
                            condition.result.lookedupValueName : ''}
                    onChange={this.updateAdvancedResultConditionLookedupValue.bind(this, condition)}
                    ref="resultLookedupValueValue"
                  >
                    {namedlookups && namedlookups.length > 0 && condition.result && 
                      condition.result.lookedupName !== undefined &&
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
