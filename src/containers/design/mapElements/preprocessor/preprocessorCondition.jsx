import React from 'react';
import uuidv4 from 'uuid/v4'; 
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import DatePicker from 'material-ui/DatePicker';
import PropTypes from 'prop-types';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const moment = require('moment');
const _ = require('lodash');
const preprocessorList = {
  source: [
    'Dedup by removal',
    'Dedup by obfuscation',
    'Skip first N rows',
    'Skip last N rows',
    'Skip after N rows',
    'Skip after if equals to',
    'Skip after if not equals to',
    'Skip after if empty',
    'Skip row if empty',
    'Skip row if not empty',
    'Skip row if less than',
    'Skip row if less than or equals to',
    'Skip row if greater than',
    'Skip row if greater than or equals to',
    'Skip row if equals to',
    'Skip row if not equals to',
    'Skip row if in list',
    'Skip row if not in list',
    'Skip row if starts with',
    'Skip row if ends with',
    'Skip row(s) if aggregate equals to',
    'Skip row(s) if aggregate not equals to',
    'Date Range Fix',  
    'Empty Value',
    'Uppercase',
    'Lowercase',
    'Number round up',
    'Number round down',
  ],
  map: [
    'Skip row if empty',
    'Skip row if not empty',
    'Skip row if less than',
    'Skip row if less than or equals to',
    'Skip row if greater than',
    'Skip row if greater than or equals to',
    'Skip row if equals to',
    'Skip row if not equals to',
    'Skip row if in list',
    'Skip row if not in list',
    'Skip row if starts with',
    'Skip row if ends with',
    'Skip row(s) if aggregate equals to',
    'Skip row(s) if aggregate not equals to',
    'Empty Value',
    'Uppercase',
    'Lowercase'
  ]
};

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

export default class PreprocessorCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    preprocessor: this.initPreprocessor(this.props.preprocessor),
    leftError: undefined,
    leftSheetError: undefined,
    leftKeyError: undefined,
    precisionError: undefined,
    skipRowsError: undefined,
    skipLastRowsError: undefined,
    skipAfterRowsError: undefined,
    equalsValueError: undefined,
    aggregateOnKeyError: undefined,
    listValueError: undefined,
    fromDateError: undefined,
    toDateError: undefined,    map: this.props._state.map
  }

  initPreprocessor(cond) {
    if (cond) {
      return ({
        preprocessorType: cond.preprocessorType,
        precision: cond.precision,        
        skipRows: cond.skipRows,
        skipLastRows: cond.skipLastRows,
        skipAfterRows: cond.skipAfterRows,
        skipAfterValue: cond.skipAfterValue,
        equalsValue: cond.equalsValue,
        aggregateOnKey: cond.aggregateOnKey,
        aggregateOnName: cond.aggregateOnName,
        listValue: cond.listValue,
        lessValue: cond.lessValue,
        greaterValue: cond.greaterValue,
        fromDate: cond.fromDate,
        toDate: cond.toDate,
        leftPreprocessorMode: cond.leftPreprocessorMode,
        leftPreprocessorValue: cond.leftPreprocessorValue,
      });
    }

    return ({
      preprocessorType: 'Dedup by removal',
      precision: '0',  
      skipRows: '0',  
      skipLastRows: '0',  
      skipAfterRows: '-1',  
      skipAfterValue: '',
      equalsValue: '',
      listValue: '',
      lessValue: '',
      greaterValue: '',
      fromDate: '',
      toDate: '',
      leftPreprocessorMode: 'Lookup Value',
      leftPreprocessorValue: {},
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({preprocessor: this.initPreprocessor(this.props.preprocessor)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};

    
    if (preprocessor.leftPreprocessorMode === 'Static Value') {
      if (this.refs.leftStaticValue === undefined || this.refs.leftStaticValue.getValue().length === 0) {
        this.setState({leftError: 'Enter a value'});
        return;
      }
      preprocessor.leftPreprocessorValue = preprocessor.leftPreprocessorValue ? preprocessor.leftPreprocessorValue : {}      
      preprocessor.leftPreprocessorValue.staticValue = this.refs.leftStaticValue.getValue();
      this.setState({leftError: undefined});      
    }

    if (preprocessor.leftPreprocessorMode === 'Lookup Value' && 
        !(preprocessor.preprocessorType === 'Skip first N rows' || preprocessor.preprocessorType === 'Skip last N rows' || 
          preprocessor.preprocessorType === 'Skip after N rows')) {
      if (preprocessor.leftPreprocessorValue && !preprocessor.leftPreprocessorValue.lookupSheet && this.refs.leftSheetValue.props.value)
        preprocessor.leftPreprocessorValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (preprocessor.leftPreprocessorValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (preprocessor.leftPreprocessorValue.lookupKey === undefined) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    } 

    if (preprocessor.preprocessorType === 'Number round up' || 
        preprocessor.preprocessorType === 'Number round down') {
      if (this.refs.precision && this.refs.precision.getValue().length > 0 && isValidNumber(this.refs.precision.getValue())) {
        preprocessor.precision = this.refs.precision.getValue();
        this.setState({precisionError: undefined});
      } else {
        this.setState({precisionError: 'Specify a valid precision value'});
        return;      
      }              
    }

    if (preprocessor.preprocessorType === 'Skip first N rows') {
      if (this.refs.skipRows && this.refs.skipRows.getValue().length > 0 && 
          isValidNumber(this.refs.skipRows.getValue()) && this.refs.skipRows.getValue() > 0) {
        preprocessor.skipRows = this.refs.skipRows.getValue();
        this.setState({skipRowsError: undefined});
      } else {
        this.setState({skipRowsError: 'Specify a valid number of rows'});
        return;      
      }              
    }

    if (preprocessor.preprocessorType === 'Skip last N rows') {
      if (this.refs.skipLastRows && this.refs.skipLastRows.getValue().length > 0 && 
          isValidNumber(this.refs.skipLastRows.getValue()) && this.refs.skipLastRows.getValue() > 0) {
        preprocessor.skipLastRows = this.refs.skipLastRows.getValue();
        this.setState({skipLastRowsError: undefined});
      } else {
        this.setState({skipLastRowsError: 'Specify a valid number of rows'});
        return;      
      }              
    }

    if (preprocessor.preprocessorType === 'Skip after N rows') {
      if (this.refs.skipAfterRows && this.refs.skipAfterRows.getValue().length > 0 && 
          isValidNumber(this.refs.skipAfterRows.getValue())) {
        if (this.refs.skipAfterRows.getValue() > 0)
          preprocessor.skipAfterRows = this.refs.skipAfterRows.getValue();
        this.setState({skipAfterRowsError: undefined});
      } else {
        this.setState({skipAfterRowsError: 'Specify a valid row number to skip after'});
        return;      
      }              
    }
    
    if (preprocessor.preprocessorType === 'Date Range Fix') {
      if (this.refs.fromDate && this.refs.fromDate.getDate()) {
        preprocessor.fromDate = moment(this.refs.fromDate.getDate()).format('YYYY-MM-DD');
        this.setState({fromDateError: undefined});
      } else {
        this.setState({fromDateError: 'Specify a valid from date for the target range'});
        return;      
      }              

      if (this.refs.toDate && this.refs.toDate.getDate()) {
        preprocessor.toDate = moment(this.refs.toDate.getDate()).format('YYYY-MM-DD');
        this.setState({toDateError: undefined});
      } else {
        this.setState({toDateError: 'Specify a valid to date for the target range'});
        return;      
      }                

      if (moment(this.refs.fromDate.getDate()).isSame(moment(this.refs.toDate.getDate())) ||
          moment(this.refs.fromDate.getDate()).isAfter(moment(this.refs.toDate.getDate()))) {
        this.setState({fromDateError: 'Date range error', toDateError: 'Date range error'});
        return;
      }
    }    

    if (preprocessor.preprocessorType === 'Skip after if equals to' || 
        preprocessor.preprocessorType === 'Skip after if not equals to') {
      if (this.refs.skipAfterValue && this.refs.skipAfterValue.getValue().length > 0) {
        preprocessor.skipAfterValue = this.refs.skipAfterValue.getValue();
        this.setState({skipAfterValueError: undefined});
      } else {
        this.setState({skipAfterValueError: 'Specify a valid value'});
        return;      
      }              
    }    

    if (preprocessor.preprocessorType === 'Skip row if equals to' || 
        preprocessor.preprocessorType === 'Skip row if not equals to') {
      if (this.refs.equalsValue && this.refs.equalsValue.getValue().length > 0) {
        preprocessor.equalsValue = this.refs.equalsValue.getValue();
        this.setState({equalsValueError: undefined});
      } else {
        this.setState({equalsValueError: 'Specify a valid value'});
        return;      
      }              
    }

    if (preprocessor.preprocessorType === 'Skip after if equals to' || 
        preprocessor.preprocessorType === 'Skip after if not equals to') {
      if (this.refs.skipAfterValue && this.refs.skipAfterValue.getValue().length > 0) {
        preprocessor.skipAfterValue = this.refs.skipAfterValue.getValue();
        this.setState({equalsValueError: undefined});
      } else {
        this.setState({equalsValueError: 'Specify a valid value'});
        return;      
      }              
    }    

    if (preprocessor.preprocessorType === 'Skip row if starts with' || 
        preprocessor.preprocessorType === 'Skip row if ends with') {
      if (this.refs.startEndValue && this.refs.startEndValue.getValue().length > 0) {
        preprocessor.startEndValue = this.refs.startEndValue.getValue();
        this.setState({startEndValueError: undefined});
      } else {
        this.setState({startEndValueError: 'Specify a valid value'});
        return;      
      }              
    }        

    if (preprocessor.preprocessorType === 'Skip row if less than' || 
        preprocessor.preprocessorType === 'Skip row if less than or equals to') {
      if (this.refs.lessValue && this.refs.lessValue.getValue().length > 0) {
        preprocessor.lessValue = this.refs.lessValue.getValue();
        this.setState({lessValueError: undefined});
      } else {
        this.setState({lessValueError: 'Specify a valid value'});
        return;      
      }              
    }        

    if (preprocessor.preprocessorType === 'Skip row if greater than' || 
        preprocessor.preprocessorType === 'Skip row if greater than or equals to') {
      if (this.refs.greaterValue && this.refs.greaterValue.getValue().length > 0) {
        preprocessor.greaterValue = this.refs.greaterValue.getValue();
        this.setState({greaterValueError: undefined});
      } else {
        this.setState({greaterValueError: 'Specify a valid value'});
        return;      
      }              
    }        

    if (preprocessor.preprocessorType === 'Skip row if in list' || 
        preprocessor.preprocessorType === 'Skip row if not in list') {
      if (this.refs.listValue && this.refs.listValue.getValue().length > 0) {
        preprocessor.listValue = this.refs.listValue.getValue();
        this.setState({listValueError: undefined});
      } else {
        this.setState({listValueError: 'Specify a valid values list'});
        return;      
      }              
    }        

    if (preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' || 
        preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to') {
      if (preprocessor.aggregateOnKey && preprocessor.aggregateOnKey.length > 0) {
        this.setState({aggregateOnKeyError: undefined});
      } else {
        this.setState({aggregateOnKeyError: 'Choose an attribute to aggregate on'});
        return;      
      }              
      if (this.refs.equalsValue && this.refs.equalsValue.getValue().length > 0) {
        preprocessor.equalsValue = this.refs.equalsValue.getValue();
        this.setState({equalsValueError: undefined});
      } else {
        this.setState({equalsValueError: 'Specify a valid value'});
        return;      
      }               
    }    

    this.props.submit(preprocessor, this.props.sheet, this.props.index);    
  }

  updateAggregateOn = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();

    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};
    if (preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' ||
        preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to') {      
      preprocessor.aggregateOnKey = value;
      preprocessor.aggregateOnName = this.props._state.map.sourceMap[preprocessor.leftPreprocessorValue.lookupSheet][value];
      this.setState({aggregateOnKeyError: undefined, preprocessor: preprocessor});        
    }    
  }

  updateAdvancedPreprocessorType = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();

    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};
    preprocessor.preprocessorType = value;
    if (preprocessor.preprocessorType === 'Number round up' || 
        preprocessor.preprocessorType === 'Number round down') {
      if (this.refs.precision && this.refs.precision.getValue().length > 0)
        preprocessor.precision = this.refs.precision.getValue();
      else
        preprocessor.precision = '';
    }

    if (preprocessor.preprocessorType === 'Skip first N rows') {
      if (this.refs.skipRows && this.refs.skipRows.getValue().length > 0)
        preprocessor.skipRows = this.refs.skipRows.getValue() - 1;
      else
        preprocessor.skiprows = '';
    }    

    if (preprocessor.preprocessorType === 'Skip last N rows') {
      if (this.refs.skipLastRows && this.refs.skipLastRows.getValue().length > 0)
        preprocessor.skipLastRows = this.refs.skipLastRows.getValue() - 1;
      else
        preprocessor.skipLastRows = '';
    }    

    if (preprocessor.preprocessorType === 'Skip after N rows') {
      if (this.refs.skipAfterRows && this.refs.skipRows.getValue().length > 0)
        preprocessor.skipAfterRows = this.refs.skipAfterRows.getValue() - 1;
      else
        preprocessor.skipAfterRows = -1;
    }    

    if (preprocessor.preprocessorType === 'Skip after if equals to' ||
        preprocessor.preprocessorType === 'Skip after if not equals to') {
      if (this.refs.skipAfterValue && this.refs.skipAfterValue.getValue().length > 0)
        preprocessor.skipAfterValue = this.refs.skipAfterValue.getValue();
      else
        preprocessor.skipAfterValue = ''
    }    

    if (preprocessor.preprocessorType === 'Skip row if in list' ||
        preprocessor.preprocessorType === 'Skip row if not in list') {
      if (this.refs.listValue && this.refs.listValue.getValue().length > 0)
        preprocessor.listValue = this.refs.listValue.getValue();
      else
        preprocessor.listValue = ''
    }    

    this.setState({preprocessor: preprocessor});
  }  
  
  updateAdvancedLeftPreprocessorMode = (sourceSheet, sheet, e, value) => {
    e.preventDefault();
    
    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};
    preprocessor.leftPreprocessorMode = value;
    preprocessor.leftPreprocessorValue = preprocessor.leftPreprocessorValue ? preprocessor.leftPreprocessorValue : {};
    if (value === 'Lookup Value') {
      preprocessor.leftPreprocessorValue.lookupSheet = preprocessor.leftPreprocessorValue.lookupSheet ? 
        preprocessor.leftPreprocessorValue.lookupSheet : undefined;
      preprocessor.leftPreprocessorValue.lookupKey = preprocessor.leftPreprocessorValue.lookupKey ? 
        preprocessor.leftPreprocessorValue.lookupKey : undefined;
      preprocessor.leftPreprocessorValue.lookupName = preprocessor.leftPreprocessorValue.lookupName ? 
        preprocessor.leftPreprocessorValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      preprocessor.leftPreprocessorValue.staticValue = preprocessor.leftPreprocessorValue.staticValue ? 
        preprocessor.leftPreprocessorValue.staticValue : undefined ;
    }

    this.setState({preprocessor: preprocessor});
  }  

  updateAdvancedLeftPreprocessorLookupSheet = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();
    
    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};
    preprocessor.leftPreprocessorValue = preprocessor.leftPreprocessorValue ? preprocessor.leftPreprocessorValue : {}
    preprocessor.leftPreprocessorValue.lookupSheet = value;
    
    this.setState({preprocessor: preprocessor});    
  }
    
  updateAdvancedLeftPreprocessorLookupName = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();

    var preprocessor = this.state.preprocessor ? this.state.preprocessor : {};
    preprocessor.leftPreprocessorValue = preprocessor.leftPreprocessorValue ? preprocessor.leftPreprocessorValue : {}
    preprocessor.leftPreprocessorValue.lookupSheet = preprocessor.leftPreprocessorValue.lookupSheet ? 
      preprocessor.leftPreprocessorValue.lookupSheet : sourceSheet;
    preprocessor.leftPreprocessorValue.lookupKey = value;
    preprocessor.leftPreprocessorValue.lookupName = this.state.map.sourceMap[preprocessor.leftPreprocessorValue.lookupSheet][value];
    
    this.setState({preprocessor: preprocessor});    
  }

  render() {
    const { sheet, sourceSheet, mode } = this.props;
    const preprocessor = this.state.preprocessor ? this.state.preprocessor : undefined;

    var preprocessorType = preprocessor && preprocessor.preprocessorType ? preprocessor.preprocessorType : preprocessorList[mode][0];
    var leftPreprocessorMode = preprocessor && preprocessor.leftPreprocessorMode ? preprocessor.leftPreprocessorMode : 'Lookup Value';

    var defaultFromDate = preprocessor && preprocessor.fromDate ? 
                    moment(preprocessor.fromDate).toDate() : 
                      this.refs.fromDate && this.refs.fromDate.getDate() ? 
                        moment(this.refs.fromDate.getDate()).toDate() : undefined;
    var defaultToDate = preprocessor && preprocessor.toDate ? 
                    moment(preprocessor.toDate).toDate() : 
                      this.refs.fromDate && this.refs.toDate.getDate() ? 
                          moment(this.refs.toDate.getDate()).toDate() : undefined;
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div style={{flex: 0.2, margin: 5}}>
            {!(preprocessorType === 'Skip first N rows' || preprocessorType === 'Skip last N rows' || 
              preprocessorType === 'Skip after N rows') &&     
            <RadioButtonGroup name="leftPreprocessorMode" 
              defaultSelected={leftPreprocessorMode}
              data-sheet={sheet}
              onChange={this.updateAdvancedLeftPreprocessorMode.bind(this, sourceSheet, sheet)}
            >
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Lookup Value"
                label="Lookup Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>}
          </div>

          {leftPreprocessorMode === 'Static Value' && 
            !(preprocessorType === 'Skip first N rows' || preprocessorType === 'Skip last N rows' || 
              preprocessorType === 'Skip after N rows') &&     
          <div style={{flex: 0.6, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.leftError ? this.state.leftError : 
                            "Specified number of rows will be skipped"}
                errorStyle={{color: this.state.leftError ? 'red' : 'unset'}}
                fullWidth={true}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={preprocessor && preprocessor.leftPreprocessorValue && preprocessor.leftPreprocessorValue.staticValue ? 
                       preprocessor.leftPreprocessorValue.staticValue : ''}
                ref="leftStaticValue"
              />
            </div>
          }

          {leftPreprocessorMode === 'Lookup Value' && 
            !(preprocessorType === 'Skip first N rows' || preprocessorType === 'Skip last N rows' || 
              preprocessorType === 'Skip after N rows') && 
            <div style={{flex: 0.2, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                  errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                  value={preprocessor && preprocessor.leftPreprocessorValue && preprocessor.leftPreprocessorValue.lookupSheet ? 
                          preprocessor.leftPreprocessorValue.lookupSheet : sourceSheet}
                  onChange={this.updateAdvancedLeftPreprocessorLookupSheet.bind(this, sourceSheet, sheet)}
                  ref="leftSheetValue"
                >
                  <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up value will be checked for specified condition"}
                  errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                  value={preprocessor && preprocessor.leftPreprocessorValue.lookupKey ? preprocessor.leftPreprocessorValue.lookupKey : ''}
                  onChange={this.updateAdvancedLeftPreprocessorLookupName.bind(this, sourceSheet, sheet)}
                  ref="leftKeyValue"
                >
                  {preprocessor && preprocessor.leftPreprocessorValue && preprocessor.leftPreprocessorValue.lookupSheet &&
                    Object.keys(this.props._state.map.sourceMap[preprocessor.leftPreprocessorValue.lookupSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[preprocessor.leftPreprocessorValue.lookupSheet][sourceKey]}  />  
                      })
                  }
                  {!(preprocessor && preprocessor.leftPreprocessorValue && preprocessor.leftPreprocessorValue.lookupSheet) &&
                    Object.keys(this.props._state.map.sourceMap[sourceSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                      })
                  }
                </SelectField>
              </div>
            </div>
          }

          <div style={{flex: 0.4, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Preprocessor </div>
            <SelectField 
              floatingLabelText="Preprocessor"
              errorText={<div>Supports simple skip check conditions, number rounding operations and case conversions</div>}
              errorStyle={{color: 'unset'}}
              value={preprocessorType}
              onChange={this.updateAdvancedPreprocessorType.bind(this, sourceSheet, sheet)}
              ref="preprocessorValue"  
              fullWidth={true}            
            >
              {preprocessorList[mode].map((preprocessor, index) => {
                return <MenuItem key={preprocessorList[mode][index]} 
                          value={preprocessorList[mode][index]} primaryText={preprocessorList[mode][index]}  />  
              })}
            </SelectField>
            {(preprocessorType === 'Number round up' || preprocessorType === 'Number round down') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Rounding precision: </div>
                <TextField
                  errorText={this.state.precisionError ? this.state.precisionError : 
                                "The number value will be rounded to specified precision"}
                  errorStyle={{color: this.state.precisionError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Precision"
                  defaultValue={preprocessor && preprocessor.precision ? preprocessor.precision : '0'}
                  ref="precision"
                />
              </div>}                                     
              {(preprocessorType === 'Date Range Fix') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Target From Date: </div>
                <DatePicker 
                  errorText={this.state.fromDateError ? this.state.fromDateError : 
                                "From date of the target date range"}
                  errorStyle={{color: this.state.fromDateError ? 'red' : 'unset'}}
                  hintText="From Date"
                  defaultDate={defaultFromDate}
                  autoOk={true}
                  ref="fromDate"
                />
              </div>}       
              {(preprocessorType === 'Skip first N rows') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Number of Rows: </div>
                <TextField
                  errorText={this.state.skipRowsError ? this.state.skipRowsError : 
                                "Specified number of rows from the top will be skipped"}
                  errorStyle={{color: this.state.skipRowsError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Skip first N Rows"
                  defaultValue={preprocessor && preprocessor.skipRows ? preprocessor.skipRows : '0'}
                  ref="skipRows"
                />
              </div>}       
              {(preprocessorType === 'Skip last N rows') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Number of Rows: </div>
                <TextField
                  errorText={this.state.skipLastRowsError ? this.state.skipLastRowsError : 
                                "Specified number of rows from the bottom will be skipped"}
                  errorStyle={{color: this.state.skipLastRowsError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Skip last N Rows"
                  defaultValue={preprocessor && preprocessor.skipLastRows ? preprocessor.skipLastRows : '0'}
                  ref="skipLastRows"
                />
              </div>}       
              {(preprocessorType === 'Skip after N rows') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Number of Rows: </div>
                <TextField
                  errorText={this.state.skipAfterRowsError ? this.state.skipAfterRowsError : 
                                "Rows after the specified row number will be skipped"}
                  errorStyle={{color: this.state.skipAfterRowsError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Skip after N rows"
                  defaultValue={preprocessor && preprocessor.skipAfterRows ? preprocessor.skipAfterRows : '-1'}
                  ref="skipAfterRows"
                />
              </div>}       
              {(preprocessorType === 'Date Range Fix') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Target To Date: </div>
                <DatePicker 
                  errorText={this.state.toDateError ? this.state.toDateError : 
                                "To date of the target date range"}
                  errorStyle={{color: this.state.toDateError ? 'red' : 'unset'}}
                  hintText="To Date"                  
                  defaultDate={defaultToDate}
                  autoOk={true}
                  ref="toDate"
                />
              </div>}                               
              {(preprocessorType === 'Skip row if equals to' || preprocessorType === 'Skip row if not equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.equalsValueError ? this.state.equalsValueError : 
                                "The specified value will be checked for equals/not equals condition"}
                  errorStyle={{color: this.state.equalsValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('equalsValue') >= 0 ? preprocessor.equalsValue : ''}
                  ref="equalsValue"
                />
              </div>}    
              
              {(preprocessorType === 'Skip after if equals to' || preprocessorType === 'Skip after if not equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.skipAfterValueError ? this.state.skipAfterValueError : 
                                "The specified value will be checked for equals/not equals condition to skip rows from current row"}
                  errorStyle={{color: this.state.skipAfterValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('skipAfterValue') >= 0 ? preprocessor.skipAfterValue : ''}
                  ref="skipAfterValue"
                />
              </div>}                  
              

              {(preprocessorType === 'Skip row if in list' || preprocessorType === 'Skip row if not in list') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.listValueError ? this.state.listValueError : 
                                "The specified values in the list will be checked for equals/not equals condition"}
                  errorStyle={{color: this.state.listValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('listValue') >= 0 ? preprocessor.listValue : ''}
                  rows={2}
                  rowsMax={4}
                  ref="listValue"
                />
              </div>}    
              {(preprocessorType === 'Skip row if starts with' || preprocessorType === 'Skip row if ends with') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.startEndValueError ? this.state.startEndValueError : 
                                "The specified value will be checked for start/end condition"}
                  errorStyle={{color: this.state.startEndValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('startEndValue') >= 0 ? preprocessor.startEndValue : ''}
                  ref="startEndValue"
                />
              </div>}    
              {(preprocessorType === 'Skip row if less than' || preprocessorType === 'Skip row if less than or equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.equalsValueError ? this.state.equalsValueError : 
                                "The specified value will be checked for equals/not equals condition"}
                  errorStyle={{color: this.state.lessValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('lessValue') >= 0 ? preprocessor.lessValue : ''}
                  ref="lessValue"
                />
              </div>}    
              {(preprocessorType === 'Skip row if greater than' || preprocessorType === 'Skip row if greater than or equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.greaterValueError ? this.state.greaterValueError : 
                                "The specified value will be checked for equals/not equals condition"}
                  errorStyle={{color: this.state.greaterValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('greaterValue') >= 0 ? preprocessor.greaterValue : ''}
                  ref="greaterValue"
                />
              </div>} 
              {(preprocessorType === 'Skip row(s) if aggregate equals to' || 
                preprocessorType === 'Skip row(s) if aggregate not equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Aggregate On: </div>
                <SelectField 
                  floatingLabelText="Preprocessor"
                  errorText={this.state.aggregateOnKeyError ? this.state.aggregateOnKeyError : 
                              "Specify a column to aggregate on"}
                  errorStyle={{color: this.state.aggregateOnKeyError ? 'red' : 'unset'}}
                  value={preprocessor && preprocessor.aggregateOnKey}
                  onChange={this.updateAggregateOn.bind(this, sourceSheet, sheet)}
                  ref="aggregateListValue"  
                  fullWidth={true}            
                >
                  {Object.keys(this.props._state.map.sourceMap[sourceSheet])
                    .map((sourceKey) => {
                      return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                    })}
                </SelectField>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.equalsValueError ? this.state.equalsValueError : 
                                "The specified value will be checked for equals/not equals condition"}
                  errorStyle={{color: this.state.equalsValueError ? 'red' : 'unset'}}
                  fullWidth={true}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={preprocessor && Object.keys(preprocessor).indexOf('equalsValue') !== undefined ? preprocessor.equalsValue : ''}
                  ref="equalsValue"
                />
              </div>}    
              
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
