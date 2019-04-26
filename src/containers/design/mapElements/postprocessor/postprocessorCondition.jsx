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
const simplePostprocessorList = [
  'Dedup by removal',
  'Dedup by obfuscation',
  'Skip row if empty',
  'Skip row if not empty',
  'Skip row if equals to',
  'Skip row if not equals to',
  'Skip row if starts with',
  'Skip row if ends with',
  // 'Date Range Fix',
  'Empty Value',
  'Uppercase',
  'Lowercase',
  'Number round up',
  'Number round down',
]

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

export default class PostprocessorCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    postprocessor: this.initPostprocessor(this.props.postprocessor),
    leftError: undefined,
    leftSheetError: undefined,
    leftKeyError: undefined,
    precisionError: undefined,
    equalsValueError: undefined,
    fromDateError: undefined,
    toDateError: undefined,
    rightError: undefined,
    rightSheetError: undefined,
    rightKeyError: undefined,
    map: this.props._state.map
  }

  initPostprocessor(cond) {
    if (cond) {
      return ({
        postprocessorType: cond.postprocessorType,
        precision: cond.precision,        
        equalsValue: cond.equalsValue,
        fromDate: cond.fromDate,
        toDate: cond.toDate,
        leftPostprocessorMode: cond.leftPostprocessorMode,
        leftPostprocessorValue: cond.leftPostprocessorValue,
        rightPostprocessorMode: cond.rightPostprocessorMode,
        rightPostprocessorValue: cond.rightPostprocessorValue,
      });
    }

    return ({
      postprocessorType: 'Dedup by removal',
      precision: '0',    
      equalsValue: '',
      fromDate: '',
      toDate: '',
      leftPostprocessorMode: 'Lookup Value',
      leftPostprocessorValue: {},
      rightPostprocessorMode: 'Lookup Value',
      rightPostprocessorValue: {},
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({postprocessor: this.initPostprocessor(this.props.postprocessor)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};

    
    if (postprocessor.leftPostprocessorMode === 'Static Value') {
      if (this.refs.leftStaticValue === undefined || this.refs.leftStaticValue.getValue().length === 0) {
        this.setState({leftError: 'Enter a value'});
        return;
      }
      postprocessor.leftPostprocessorValue = postprocessor.leftPostprocessorValue ? postprocessor.leftPostprocessorValue : {}      
      postprocessor.leftPostprocessorValue.staticValue = this.refs.leftStaticValue.getValue();
      this.setState({leftError: undefined});      
    }

    if (postprocessor.leftPostprocessorMode === 'Lookup Value') {
      if (postprocessor.leftPostprocessorValue && !postprocessor.leftPostprocessorValue.lookupSheet && this.refs.leftSheetValue.props.value)
        postprocessor.leftPostprocessorValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (postprocessor.leftPostprocessorValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (postprocessor.leftPostprocessorValue.lookupKey === undefined) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    } 

    if (postprocessor.postprocessorType === 'Number round up' || postprocessor.postprocessorType === 'Number round down') {
      if (this.refs.precision && this.refs.precision.getValue().length > 0 && isValidNumber(this.refs.precision.getValue())) {
        postprocessor.precision = this.refs.precision.getValue();
        this.setState({precisionError: undefined});
      } else {
        this.setState({precisionError: 'Specify a valid precision value'});
        return;      
      }              
    }

    if (postprocessor.postprocessorType === 'Date Range Fix') {
      if (this.refs.fromDate && this.refs.fromDate.getDate()) {
        postprocessor.fromDate = moment(this.refs.fromDate.getDate()).format('YYYY-MM-DD');
        this.setState({fromDateError: undefined});
      } else {
        this.setState({fromDateError: 'Specify a valid from date for the target range'});
        return;      
      }              

      if (this.refs.toDate && this.refs.toDate.getDate()) {
        postprocessor.toDate = moment(this.refs.toDate.getDate()).format('YYYY-MM-DD');
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
    
    if (postprocessor.postprocessorType === 'Skip row if equals to' || postprocessor.postprocessorType === 'Skip row if not equals to') {
      if (this.refs.equalsValue && this.refs.equalsValue.getValue().length > 0) {
        postprocessor.equalsValue = this.refs.equalsValue.getValue();
        this.setState({equalsValueError: undefined});
      } else {
        this.setState({equalsValueError: 'Specify a valid value'});
        return;      
      }              
    }    

    if (postprocessor.postprocessorType === 'Skip row if starts with' || postprocessor.postprocessorType === 'Skip row if ends with') {
      if (this.refs.startEndValue && this.refs.startEndValue.getValue().length > 0) {
        postprocessor.startEndValue = this.refs.startEndValue.getValue();
        this.setState({startEndValueError: undefined});
      } else {
        this.setState({startEndValueError: 'Specify a valid value'});
        return;      
      }              
    }        

    if (postprocessor.postprocessorType === 'Date Range Fix') {
      if (postprocessor.rightPostprocessorMode === 'Lookup Value') {
        if (postprocessor.rightPostprocessorValue && !postprocessor.rightPostprocessorValue.lookupSheet && this.refs.rightSheetValue.props.value)
          postprocessor.rightPostprocessorValue = { lookupSheet: this.refs.rightSheetValue.props.value};

        if (postprocessor.rightPostprocessorValue.lookupSheet === undefined) {
          this.setState({rightSheetError: 'Choose a target sheet'});
          return;
        } else {
          this.setState({rightSheetError: undefined});              
        }

        if (postprocessor.rightPostprocessorValue.lookupKey === undefined) {
          this.setState({rightKeyError: 'Choose an attribute'});
          return;
        } else {
          this.setState({rightKeyError: undefined});              
        }
      }
    }
        
    this.props.submit(postprocessor, this.props.sheet, this.props.index);    
  }

  updateAdvancedPostprocessorType = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();

    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.postprocessorType = value;
    if (postprocessor.postprocessorType === 'Number round up' || postprocessor.postprocessorType === 'Number round down') {
      if (this.refs.precision && this.refs.precision.getValue().length > 0)
        postprocessor.precision = this.refs.precision.getValue();
      else
        postprocessor.precision = '';
    }

    this.setState({postprocessor: postprocessor});
  }  
  
  updateAdvancedLeftPostprocessorMode = (sourceSheet, sheet, e, value) => {
    e.preventDefault();
    
    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.leftPostprocessorMode = value;
    postprocessor.leftPostprocessorValue = postprocessor.leftPostprocessorValue ? postprocessor.leftPostprocessorValue : {};
    if (value === 'Lookup Value') {
      postprocessor.leftPostprocessorValue.lookupSheet = postprocessor.leftPostprocessorValue.lookupSheet ? 
        postprocessor.leftPostprocessorValue.lookupSheet : undefined;
      postprocessor.leftPostprocessorValue.lookupKey = postprocessor.leftPostprocessorValue.lookupKey ? 
        postprocessor.leftPostprocessorValue.lookupKey : undefined;
      postprocessor.leftPostprocessorValue.lookupName = postprocessor.leftPostprocessorValue.lookupName ? 
        postprocessor.leftPostprocessorValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      postprocessor.leftPostprocessorValue.staticValue = postprocessor.leftPostprocessorValue.staticValue ? 
        postprocessor.leftPostprocessorValue.staticValue : undefined ;
    }

    this.setState({postprocessor: postprocessor});
  }  

  updateAdvancedLeftPostprocessorLookupSheet = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();
    
    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.leftPostprocessorValue = postprocessor.leftPostprocessorValue ? postprocessor.leftPostprocessorValue : {}
    postprocessor.leftPostprocessorValue.lookupSheet = value;
    
    this.setState({postprocessor: postprocessor});    
  }
    
  updateAdvancedLeftPostprocessorLookupName = (sourceSheet, sheet, e, index, value) => {
    e.preventDefault();

    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.leftPostprocessorValue = postprocessor.leftPostprocessorValue ? postprocessor.leftPostprocessorValue : {}
    postprocessor.leftPostprocessorValue.lookupSheet = postprocessor.leftPostprocessorValue.lookupSheet ? 
      postprocessor.leftPostprocessorValue.lookupSheet : sourceSheet;
    postprocessor.leftPostprocessorValue.lookupKey = value;
    postprocessor.leftPostprocessorValue.lookupName = this.state.map.sourceMap[postprocessor.leftPostprocessorValue.lookupSheet][value];
    
    this.setState({postprocessor: postprocessor});    
  }

  updateAdvancedRightPostprocessorMode = (sourceSheet, sheet, e, value) => {
    e.preventDefault();
    
    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.rightPostprocessorMode = value;
    postprocessor.rightPostprocessorValue = postprocessor.rightPostprocessorValue ? postprocessor.rightPostprocessorValue : {};
    if (value === 'Lookup Value') {
      postprocessor.rightPostprocessorValue.lookupSheet = postprocessor.rightPostprocessorValue.lookupSheet ? 
        postprocessor.rightPostprocessorValue.lookupSheet : undefined;
      postprocessor.rightPostprocessorValue.lookupKey = postprocessor.rightPostprocessorValue.lookupKey ? 
        postprocessor.rightPostprocessorValue.lookupKey : undefined;
      postprocessor.rightPostprocessorValue.lookupName = postprocessor.rightPostprocessorValue.lookupName ? 
        postprocessor.rightPostprocessorValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      postprocessor.rightPostprocessorValue.staticValue = postprocessor.rightPostprocessorValue.staticValue ? 
        postprocessor.rightPostprocessorValue.staticValue : undefined ;
    }

    this.setState({postprocessor: postprocessor});
  }  

  updateAdvancedRightPostprocessorLookupSheet = (sheet, e, index, value) => {
    e.preventDefault();
    
    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.rightPostprocessorValue = postprocessor.rightPostprocessorValue ? postprocessor.rightPostprocessorValue : {}
    postprocessor.rightPostprocessorValue.lookupSheet = value;
    
    this.setState({postprocessor: postprocessor});    
  }
    
  updateAdvancedRightPostprocessorLookupName = (sheet, e, index, value) => {
    e.preventDefault();

    var postprocessor = this.state.postprocessor ? this.state.postprocessor : {};
    postprocessor.rightPostprocessorValue = postprocessor.rightPostprocessorValue ? postprocessor.rightPostprocessorValue : {}
    postprocessor.rightPostprocessorValue.lookupSheet = postprocessor.rightPostprocessorValue.lookupSheet ? 
      postprocessor.rightPostprocessorValue.lookupSheet : sheet;
    postprocessor.rightPostprocessorValue.lookupKey = value;
    postprocessor.rightPostprocessorValue.lookupName = this.state.map.targetMap[postprocessor.rightPostprocessorValue.lookupSheet][value];
    
    this.setState({postprocessor: postprocessor});    
  }

  render() {
    const { sheet, sourceSheet } = this.props;
    const postprocessor = this.state.postprocessor ? this.state.postprocessor : undefined;

    var postprocessorType = postprocessor && postprocessor.postprocessorType ? postprocessor.postprocessorType : simplePostprocessorList[0];
    var rhsProcessorAbsent = !(postprocessorType === 'Date Range Fix');
    var leftPostprocessorMode = postprocessor && postprocessor.leftPostprocessorMode ? postprocessor.leftPostprocessorMode : 'Lookup Value';
    var rightPostprocessorMode = postprocessor && postprocessor.rightPostprocessorMode ? postprocessor.rightPostprocessorMode : 'Lookup Value';
    var defaultFromDate = postprocessor && postprocessor.fromDate ? 
                    moment(postprocessor.fromDate).toDate() : 
                      this.refs.fromDate && this.refs.fromDate.getDate() ? 
                        moment(this.refs.fromDate.getDate()).toDate() : undefined;
    var defaultToDate = postprocessor && postprocessor.toDate ? 
                    moment(postprocessor.toDate).toDate() : 
                      this.refs.fromDate && this.refs.toDate.getDate() ? 
                          moment(this.refs.toDate.getDate()).toDate() : undefined;

    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>LHS</div>
            <RadioButtonGroup name="leftPostprocessorMode" 
              defaultSelected={leftPostprocessorMode}
              data-sheet={sheet}
              onChange={this.updateAdvancedLeftPostprocessorMode.bind(this, sourceSheet, sheet)}
            >
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Lookup Value"
                label="Lookup Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>
          </div>

          {leftPostprocessorMode === 'Static Value' &&
            <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.leftError ? this.state.leftError : 
                            "This value will be used in the aggregation"}
                errorStyle={{color: this.state.leftError ? 'red' : 'unset'}}
                style={{width: '50%'}}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={postprocessor && postprocessor.leftPostprocessorValue && postprocessor.leftPostprocessorValue.staticValue ? 
                       postprocessor.leftPostprocessorValue.staticValue : ''}
                ref="leftStaticValue"
              />
            </div>
          }

          {leftPostprocessorMode === 'Lookup Value' &&
            <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                  errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                  value={postprocessor && postprocessor.leftPostprocessorValue && postprocessor.leftPostprocessorValue.lookupSheet ? 
                          postprocessor.leftPostprocessorValue.lookupSheet : sourceSheet}
                  onChange={this.updateAdvancedLeftPostprocessorLookupSheet.bind(this, sourceSheet, sheet)}
                  ref="leftSheetValue"
                >
                  <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />                    
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up value will be used in aggregation"}
                  errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                  value={postprocessor && postprocessor.leftPostprocessorValue.lookupKey ? postprocessor.leftPostprocessorValue.lookupKey : ''}
                  onChange={this.updateAdvancedLeftPostprocessorLookupName.bind(this, sourceSheet, sheet)}
                  ref="leftKeyValue"
                >
                  {postprocessor && postprocessor.leftPostprocessorValue && postprocessor.leftPostprocessorValue.lookupSheet &&
                    Object.keys(this.props._state.map.sourceMap[postprocessor.leftPostprocessorValue.lookupSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[postprocessor.leftPostprocessorValue.lookupSheet][sourceKey]}  />  
                      })
                  }
                  {!(postprocessor && postprocessor.leftPostprocessorValue && postprocessor.leftPostprocessorValue.lookupSheet) &&
                    Object.keys(this.props._state.map.sourceMap[sourceSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                      })
                  }
                </SelectField>
              </div>
            </div>
          }

          <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Postprocessor </div>
            <SelectField 
              floatingLabelText="Postprocessor"
              errorText={<div>Simple aggregation and statistical measures</div>}
              errorStyle={{color: 'unset'}}
              value={postprocessorType}
              onChange={this.updateAdvancedPostprocessorType.bind(this, sourceSheet, sheet)}
              ref="postprocessorValue"              
            >
              {simplePostprocessorList.map((postprocessor, index) => {
                return <MenuItem key={simplePostprocessorList[index]} value={simplePostprocessorList[index]} primaryText={simplePostprocessorList[index]}  />  
              })}
            </SelectField>
            {(postprocessorType === 'Number round up' || postprocessorType === 'Number round down') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Rounding precision: </div>
                <TextField
                  errorText={this.state.precisionError ? this.state.precisionError : 
                                "The number value will be rounded to specified precision"}
                  errorStyle={{color: this.state.precisionError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Precision"
                  defaultValue={postprocessor && postprocessor.precision ? postprocessor.precision : '0'}
                  ref="precision"
                />
              </div>}                                     
              {(postprocessorType === 'Date Range Fix') &&
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
              {(postprocessorType === 'Date Range Fix') &&
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
              {(postprocessorType === 'Skip row if equals to' || postprocessorType === 'Skip row if not equals to') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.equalsValueError ? this.state.equalsValueError : 
                                "The specified value will be checked for equals/not equals postprocessor"}
                  errorStyle={{color: this.state.equalsValueError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={postprocessor && postprocessor.equalsValue ? postprocessor.equalsValue : ''}
                  ref="equalsValue"
                />
              </div>}    
              {(postprocessorType === 'Skip row if starts with' || postprocessorType === 'Skip row if ends with') &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Check value: </div>
                <TextField
                  errorText={this.state.startEndValueError ? this.state.startEndValueError : 
                                "The specified value will be checked for start/end postprocessor"}
                  errorStyle={{color: this.state.startEndValueError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Condition"
                  defaultValue={postprocessor && postprocessor.startEndValue ? postprocessor.startEndValue : ''}
                  ref="startEndValue"
                />
              </div>}    
          </div>
          {!rhsProcessorAbsent && 
          <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>RHS</div>
            <RadioButtonGroup name="rightPostprocessorMode" 
              defaultSelected={rightPostprocessorMode}
              data-sheet={sheet}
              onChange={this.updateAdvancedRightPostprocessorMode.bind(this, sourceSheet, sheet)}
            >
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Lookup Value"
                label="Lookup Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>
          </div>}

          {!rhsProcessorAbsent && rightPostprocessorMode === 'Static Value' &&
            <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.rightError ? this.state.rightError : 
                            "This value will be used in the aggregation"}
                errorStyle={{color: this.state.rightError ? 'red' : 'unset'}}
                style={{width: '50%'}}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={postprocessor && postprocessor.rightPostprocessorValue && postprocessor.rightPostprocessorValue.staticValue ? 
                      postprocessor.rightPostprocessorValue.staticValue : ''}
                ref="rightStaticValue"
              />
            </div>
          }

          {!rhsProcessorAbsent && rightPostprocessorMode === 'Lookup Value' &&
            <div style={{flex: rhsProcessorAbsent ? 0.33 : 0.2, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.rightSheetError ? this.state.rightSheetError : ""}
                  errorStyle={{color: this.state.rightSheetError ? 'red' : 'unset'}}
                  value={postprocessor && postprocessor.rightPostprocessorValue && postprocessor.rightPostprocessorValue.lookupSheet ? 
                          postprocessor.rightPostprocessorValue.lookupSheet : sheet}
                  onChange={this.updateAdvancedRightPostprocessorLookupSheet.bind(this, sheet)}
                  ref="rightSheetValue"
                >
                  <MenuItem key={sheet} value={sheet} primaryText={sheet}  />                    
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.rightKeyError ? this.state.rightKeyError :  "The looked up value will be used in aggregation"}
                  errorStyle={{color: this.state.rightKeyError ? 'red' : 'unset'}}
                  value={postprocessor && postprocessor.rightPostprocessorValue.lookupKey ? postprocessor.rightPostprocessorValue.lookupKey : ''}
                  onChange={this.updateAdvancedRightPostprocessorLookupName.bind(this, sheet)}
                  ref="rightKeyValue"
                >
                  {postprocessor && postprocessor.rightPostprocessorValue && postprocessor.rightPostprocessorValue.lookupSheet &&
                    Object.keys(this.props._state.map.targetMap[postprocessor.rightPostprocessorValue.lookupSheet])
                      .map((targetKey) => {
                        return <MenuItem key={targetKey} value={targetKey} primaryText={this.props._state.map.targetMap[postprocessor.rightPostprocessorValue.lookupSheet][targetKey]}  />  
                      })
                  }
                  {!(postprocessor && postprocessor.rightPostprocessorValue && postprocessor.rightPostprocessorValue.lookupSheet) &&
                    Object.keys(this.props._state.map.targetMap[sheet])
                      .map((targetKey) => {
                        return <MenuItem key={targetKey} value={targetKey} primaryText={this.props._state.map.targetMap[sheet][targetKey]}  />  
                      })
                  }
                </SelectField>
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
