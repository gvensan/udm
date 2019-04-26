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
const skipConditionsList = [
  'Is Empty',
  'Is Not Empty',
  'Equals to',
  'Not Equals to',
  'Less than',
  'Less than or Equals to',
  'Greater than',
  'Greater than or Equals to',
  'Substring'
];

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

export default class SkipCondition extends React.Component {
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
    rightError: undefined,
    rigthSheetError: undefined,
    rightKeyError: undefined,
    stringError: undefined,
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
        stringPosition: cond.stringPosition,
        stringLength: cond.stringLength
      });
    }

    return ({
      conditionType: 'Is Empty',
      leftConditionMode: 'Lookup Value',
      leftConditionValue: {},
      rightConditionMode: 'Static Value',
      rightConditionValue: {},
      stringPosition: '',
      stringLength: ''
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
    if (condition.leftConditionMode === 'Lookup Value') {
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

    if (condition.conditionType === 'Substring' && this.refs.stringPosition) {
      if (this.refs.stringPosition.getValue().length > 0 && isValidNumber(this.refs.stringPosition.getValue())) {
        condition.stringPosition = this.refs.stringPosition.getValue();
        this.setState({stringError: undefined});
      } else {
        this.setState({stringError: 'Specify a valid position'});
        return;      
      }
    }

    if (condition.conditionType === 'Substring' && this.refs.stringLength) {
      if (this.refs.stringLength.getValue().length > 0 && isValidNumber(this.refs.stringLength.getValue())) {
        condition.stringLength = this.refs.stringLength.getValue();
        this.setState({stringLengthError: undefined});        
      } else {
        this.setState({stringLengthError: 'Specify a valid length'});
        return;      
      }
    }    
    
    if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty')) {
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

    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
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
    } else if (value === 'Static Value') {
      condition.leftConditionValue.staticValue = condition.leftConditionValue.staticValue ? 
        condition.leftConditionValue.staticValue : undefined ;
    }

    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }    

    this.setState({condition: condition});
  }  

  updateAdvancedLeftConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftConditionValue = condition.leftConditionValue ? condition.leftConditionValue : {}
    condition.leftConditionValue.lookupSheet = value;
    
    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }
    
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
    
    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }
    
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

    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }    

    this.setState({condition: condition});
  }  

  updateAdvancedRightConditionLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.rightConditionValue = condition.rightConditionValue ? condition.rightConditionValue : {}
    condition.rightConditionValue.lookupSheet = value;
    
    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }
    
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
    
    if (condition.conditionType === 'Substring') {
      if (this.refs.stringPosition && this.refs.stringPosition.getValue().length > 0)
        condition.stringPosition = this.refs.stringPosition.getValue();
      if (this.refs.stringLength && this.refs.stringLength.getValue().length > 0)
        condition.stringLength = this.refs.stringLength.getValue();
    }
    
    this.setState({condition: condition});    
  }    

  render() {
    const { sourceSheet, sheet, mapkey, fields } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;

    var conditionType = condition && condition.conditionType ? condition.conditionType : skipConditionsList[0];
    var rhsConditionalAbsent = (conditionType === 'Is Empty' || conditionType === 'Is Not Empty');
    var rightConditionMode = condition && condition.rightConditionMode ? condition.rightConditionMode : 'Static Value';
    var leftConditionMode = condition && condition.leftConditionMode ? condition.leftConditionMode : 'Lookup Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div style={{flex: rhsConditionalAbsent ? 0.33 : 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>LHS</div>
            <RadioButtonGroup name="leftConditionMode" 
              defaultSelected={leftConditionMode}
              data-sheet={sheet} data-key={fields[mapkey]} 
              onChange={this.updateAdvancedLeftConditionMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
            >
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Lookup Value"
                label="Lookup Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>
          </div>

          {leftConditionMode === 'Lookup Value' &&
            <div style={{flex: rhsConditionalAbsent ? 0.33 : 0.2, margin: 5}}>
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

          <div style={{flex: rhsConditionalAbsent ? 0.33 : 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Condition </div>
            <SelectField 
              floatingLabelText="Condition"
              errorText={<div>Supports empty and comparison checks</div>}
              errorStyle={{color: 'unset'}}
              value={conditionType}
              onChange={this.updateAdvancedConditionType.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
              ref="conditionValue"              
            >
              {skipConditionsList.map((condition, index) => {
                return <MenuItem key={skipConditionsList[index]} value={skipConditionsList[index]} primaryText={skipConditionsList[index]}  />  
              })}
            </SelectField>
            {conditionType === 'Substring' &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Position: </div>
                <TextField
                  errorText={this.state.stringError ? this.state.stringError : "Starting position (0 for Start or -1 for End of the string and any other +ve value)"}
                  errorStyle={{color: this.state.stringError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Position"
                  data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                  defaultValue={condition && condition.stringPosition ? condition.stringPosition : ''}
                  ref="stringPosition"
                />
              </div>} 
              {conditionType === 'Substring' &&
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Length: </div>
                <TextField
                  errorText={this.state.stringLengthError ? this.state.stringLengthError : "Number of characters"}
                  errorStyle={{color: this.state.stringLengthError ? 'red' : 'unset'}}
                  style={{width: '50%'}}
                  hintText="Value"
                  floatingLabelText="Length"
                  data-sheet={sheet} data-key={mapkey} data-val={fields[mapkey]}                     
                  defaultValue={condition && condition.stringLength !== undefined  ? condition.stringLength : ''}
                  ref="stringLength"
                />
              </div>}                                       
          </div>
          {!(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
          <div style={{flex: 0.2, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 30 }}>RHS</div>
            <RadioButtonGroup name="rightConditionMode" 
              defaultSelected={rightConditionMode}
              data-sheet={sheet} data-key={fields[mapkey]} 
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
          </div>}
          {rightConditionMode !== 'Lookup Value' && !(conditionType === 'Is Empty' || conditionType === 'Is Not Empty') &&
            <div style={{flex: 0.2, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.rightError ? this.state.rightError : "This value will be used in comparison"}
                errorStyle={{color: this.state.rightError ? 'red' : 'unset'}}
                style={{width: '50%'}}
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
            <div style={{flex: 0.2, margin: 5}}>
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
