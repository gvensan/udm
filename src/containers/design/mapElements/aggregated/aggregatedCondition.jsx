import React from 'react';
import uuidv4 from 'uuid/v4'; 
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import PropTypes from 'prop-types';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const simpleAggregatedList = [
  'Sum',
  'Average',
  'Min',
  'Max',
  'Mean',
  'Median',
  'Variance',
  'Standard Deviation',
  'Percentile',
]

export default class AggregatedCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    condition: this.initAggregated(this.props.condition),
    leftError: undefined,
    leftSheetError: undefined,
    leftKeyError: undefined,
    map: this.props._state.map
  }

  initAggregated(cond) {
    if (cond) {
      return ({
        conditionType: cond.conditionType,
        leftAggregatedMode: cond.leftAggregatedMode,
        leftAggregatedValue: cond.leftAggregatedValue,
      });
    }

    var sheet = this.props.sourceSheet ? this.props.sourceSheet : Object.keys(this.props._state.map.sourceMap)[0];
    var colKey = sheet ? Object.keys(this.props._state.map.sourceMap[sheet])[0] : undefined;
    var colName = colKey ? this.props._state.map.sourceMap[sheet][colKey] : undefined;
    
    return ({
      conditionType: 'Sum',
      leftAggregatedMode: 'Lookup Value',
      leftAggregatedValue: {
        lookupSheet: sheet,
        lookupKey: colKey,
        lookupName: colName
      }
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({condition: this.initAggregated(this.props.condition)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var condition = this.state.condition ? this.state.condition : {};

    
    if (condition.leftAggregatedMode === 'Static Value') {
      if (this.refs.leftStaticValue === undefined || this.refs.leftStaticValue.getValue().length === 0) {
        this.setState({leftError: 'Enter a value'});
        return;
      }
      condition.leftAggregatedValue = condition.leftAggregatedValue ? condition.leftAggregatedValue : {}      
      condition.leftAggregatedValue.staticValue = this.refs.leftStaticValue.getValue();
      this.setState({leftError: undefined});      
    }

    if (condition.leftAggregatedMode === 'Lookup Value') {
      if (condition.leftAggregatedValue && !condition.leftAggregatedValue.lookupSheet && this.refs.leftSheetValue.props.value)
        condition.leftAggregatedValue = { lookupSheet: this.refs.leftSheetValue.props.value};

      if (condition.leftAggregatedValue.lookupSheet === undefined) {
        this.setState({leftSheetError: 'Choose a source sheet'});
        return;
      } else {
        this.setState({leftSheetError: undefined});              
      }

      if (condition.leftAggregatedValue.lookupKey === undefined) {
        this.setState({leftKeyError: 'Choose an attribute'});
        return;
      } else {
        this.setState({leftKeyError: undefined});              
      }
    } 
        
    this.props.submit(condition, this.props.index);    
  }

  updateAdvancedAggregatedType = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.conditionType = value;
    if (condition.conditionType === 'Concatenate')
      condition.aggregatedJoiner = '';
    
    this.setState({condition: condition});
  }  
  
  updateAdvancedAggregatedJoiner = (e, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.aggregatedJoiner = value;

    this.setState({condition: condition});
  }  

  updateAdvancedLeftAggregatedMode = (sourceSheet, sheet, key, val, e, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftAggregatedMode = value;
    condition.leftAggregatedValue = condition.leftAggregatedValue ? condition.leftAggregatedValue : {};
    if (value === 'Lookup Value') {
      condition.leftAggregatedValue.lookupSheet = condition.leftAggregatedValue.lookupSheet ? 
        condition.leftAggregatedValue.lookupSheet : undefined;
      condition.leftAggregatedValue.lookupKey = condition.leftAggregatedValue.lookupKey ? 
        condition.leftAggregatedValue.lookupKey : undefined;
      condition.leftAggregatedValue.lookupName = condition.leftAggregatedValue.lookupName ? 
        condition.leftAggregatedValue.lookupName : undefined;
    } else if (value === 'Static Value') {
      condition.leftAggregatedValue.staticValue = condition.leftAggregatedValue.staticValue ? 
        condition.leftAggregatedValue.staticValue : undefined ;
    }

    this.setState({condition: condition});
  }  

  updateAdvancedLeftAggregatedLookupSheet = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var condition = this.state.condition ? this.state.condition : {};
    condition.leftAggregatedValue = condition.leftAggregatedValue ? condition.leftAggregatedValue : {}
    condition.leftAggregatedValue.lookupSheet = value;
    
    this.setState({condition: condition});    
  }

  updateAdvancedLeftAggregatedLookupName = (sourceSheet, sheet, key, val, e, index, value) => {
    e.preventDefault();

    var condition = this.state.condition ? this.state.condition : {};
    condition.leftAggregatedValue = condition.leftAggregatedValue ? condition.leftAggregatedValue : {}
    condition.leftAggregatedValue.lookupSheet = condition.leftAggregatedValue.lookupSheet ? 
          condition.leftAggregatedValue.lookupSheet : sourceSheet;
    condition.leftAggregatedValue.lookupKey = value;
    condition.leftAggregatedValue.lookupName = this.state.map.sourceMap[condition.leftAggregatedValue.lookupSheet][value];
    
    this.setState({condition: condition});    
  }
  

  render() {
    const { sourceSheet, sheet, mapkey, fields } = this.props;
    const condition = this.state.condition ? this.state.condition : undefined;

    var conditionType = condition && condition.conditionType ? condition.conditionType : simpleAggregatedList[0];
    var leftAggregatedMode = condition && condition.leftAggregatedMode ? condition.leftAggregatedMode : 'Lookup Value';
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div style={{flex: 0.33, margin: 5}}>
            <RadioButtonGroup name="leftAggregatedMode" 
              defaultSelected={leftAggregatedMode}
              data-sheet={sheet} data-key={fields[mapkey]} 
              onChange={this.updateAdvancedLeftAggregatedMode.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
            >
              <RadioButton
                iconStyle={{fill: root.switchStyleFillColor}}
                value="Lookup Value"
                label="Lookup Value"
                style={{marginBottom: 16}}
              />
            </RadioButtonGroup>
          </div>

          {leftAggregatedMode === 'Static Value' &&
            <div style={{flex: 0.6, margin: 5}}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Value</div>
              <TextField
                errorText={this.state.leftError ? this.state.leftError : 
                            "This value will be used in the aggregation"}
                errorStyle={{color: this.state.leftError ? 'red' : 'unset'}}
                style={{width: '50%'}}
                hintText="Value"
                floatingLabelText="Value"
                defaultValue={condition && condition.leftAggregatedValue && condition.leftAggregatedValue.staticValue ? 
                       condition.leftAggregatedValue.staticValue : ''}
                ref="leftStaticValue"
              />
            </div>
          }

          {leftAggregatedMode === 'Lookup Value' &&
            <div style={{flex: 0.33, margin: 5}}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Lookup: </div>
                <SelectField 
                  floatingLabelText="Sheet"
                  errorText={this.state.leftSheetError ? this.state.leftSheetError : "Source sheet"}
                  errorStyle={{color: this.state.leftSheetError ? 'red' : 'unset'}}
                  value={condition && condition.leftAggregatedValue.lookupSheet ? condition.leftAggregatedValue.lookupSheet : sourceSheet}
                  onChange={this.updateAdvancedLeftAggregatedLookupSheet.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="leftSheetValue"
                >
                  <MenuItem key={sourceSheet} value={sourceSheet} primaryText={sourceSheet}  />  
                </SelectField>
                <SelectField 
                  floatingLabelText="Attribute"
                  errorText={this.state.leftKeyError ? this.state.leftKeyError :  "The looked up value will be used in aggregation"}
                  errorStyle={{color: this.state.leftKeyError ? 'red' : 'unset'}}
                  value={condition && condition.leftAggregatedValue.lookupKey ? condition.leftAggregatedValue.lookupKey : ''}
                  onChange={this.updateAdvancedLeftAggregatedLookupName.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
                  ref="leftKeyValue"
                >
                  {condition && condition.leftAggregatedValue.lookupSheet &&
                    Object.keys(this.props._state.map.sourceMap[condition.leftAggregatedValue.lookupSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[condition.leftAggregatedValue.lookupSheet][sourceKey]}  />  
                      })
                  }
                  {!(condition && condition.leftAggregatedValue && condition.leftAggregatedValue.lookupSheet) &&
                    Object.keys(this.props._state.map.sourceMap[sourceSheet])
                      .map((sourceKey) => {
                        return <MenuItem key={sourceKey} value={sourceKey} primaryText={this.props._state.map.sourceMap[sourceSheet][sourceKey]}  />  
                      })
                  }                  
                </SelectField>
              </div>
            </div>
          }

          <div style={{flex: 0.33, margin: 5}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Aggregated </div>
            <SelectField 
              floatingLabelText="Aggregated"
              errorText={<div>Simple aggregation and statistical measures</div>}
              errorStyle={{color: 'unset'}}
              value={conditionType}
              onChange={this.updateAdvancedAggregatedType.bind(this, sourceSheet, sheet, mapkey, fields[mapkey])}
            ref="conditionValue"              
            >
              {simpleAggregatedList.map((condition, index) => {
                return <MenuItem key={simpleAggregatedList[index]} value={simpleAggregatedList[index]} primaryText={simpleAggregatedList[index]}  />  
              })}
            </SelectField>
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
