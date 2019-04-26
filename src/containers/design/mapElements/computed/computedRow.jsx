import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import ReactTooltip from 'react-tooltip'
import uuidv4 from 'uuid/v4'; 
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');
const computedConnectorList = [
  '',
  'Concatenate',
  'Add',
  'Subtract',
  'Multiply',
  'Divide'
];

export default class ComputedRow extends React.Component {
  static propTypes = {
    editCondition: PropTypes.func.isRequired,
    editConnector: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
    updateConcatConnector: PropTypes.func.isRequired
  }

  editConnector = (rowIndex, e, index, value) => {
    e.preventDefault();
    this.props.editConnector(rowIndex, value === '' ? undefined : value);
  }

  editCondition = (e) => {
    e.preventDefault();
    this.props.editCondition(e.target.dataset.rowIndex);
  }

  deleteCondition = (e) => {
    e.preventDefault();
    this.props.deleteCondition(e.target.dataset.rowIndex);
  }

  updateConcatConnector = (rowIndex, e) => {
    e.preventDefault();
    this.props.updateConcatConnector(rowIndex, e.currentTarget.value)
  }

  constructLHS(condition) {
    if (condition.leftComputedMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.leftComputedValue.lookupSheet}[{condition.leftComputedValue.lookupName}]
          </div>
        </div>
      );
    else if (condition.leftComputedMode === 'vLookup Name') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.leftComputedValue.lookupSheet}[{condition.leftComputedValue.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftComputedValue.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.leftComputedValue.lookedupSheetName ? condition.leftComputedValue.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
            {(condition.leftComputedValue.lookedupKey ? condition.leftComputedValue.lookedupKey : 'ERROR') + ' [' +
              (condition.leftComputedValue.lookedupKeyName ? condition.leftComputedValue.lookedupKeyName : 'ERROR') + ']'
            }<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
            {(condition.leftComputedValue.lookedupValue ? condition.leftComputedValue.lookedupValue : 'ERROR') + ' [' +
              (condition.leftComputedValue.lookedupValueName ? condition.leftComputedValue.lookedupValueName : 'ERROR') + ']'
            }<br/> 
          </div>
        </div>
      );            
    else if (condition.leftComputedMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.leftComputedValue.staticValue}
          </div>
        </div>
      );
              
    return <div/>;
  }

  constructOperation(condition) {
    if (condition.conditionType === 'Concatenate' && condition.computedJoiner && condition.computedJoiner.length > 0)
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Joiner: {condition.computedJoiner}</span>
            <br/>
          </div>
        );
    
    if (condition.conditionType === 'Substring')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>From: {condition.stringPosition}, Length: {condition.stringLength}</span>
            <br/>
          </div>
        );

    return <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span>;
  }

  construcRHS(condition) {
    if (!(condition.conditionType === '' || 
          condition.conditionType === 'Uppercase' || condition.conditionType === 'Lowercase' || 
          condition.conditionType === 'Substring' || condition.conditionType === 'Convert To String' ||
          condition.conditionType === 'Convert To Number' || condition.conditionType === 'MD5 Token')) {
      if (condition.rightComputedMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.rightComputedValue.staticValue}
          </div>
        );
      else if (condition.rightComputedMode === 'vLookup Name') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.rightComputedValue.lookupSheet}[{condition.rightComputedValue.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.rightComputedValue.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.rightComputedValue.lookedupSheetName ? condition.rightComputedValue.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
            {(condition.rightComputedValue.lookedupKey ? condition.rightComputedValue.lookedupKey : 'ERROR') + ' [' +
              (condition.rightComputedValue.lookedupKeyName ? condition.rightComputedValue.lookedupKeyName : 'ERROR') + ']'
            }<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
            {(condition.rightComputedValue.lookedupValue ? condition.rightComputedValue.lookedupValue : 'ERROR') + ' [' +
              (condition.rightComputedValue.lookedupValueName ? condition.rightComputedValue.lookedupValueName : 'ERROR') + ']'
            }<br/> 
          </div>
        );            
      else if (condition.rightComputedMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.rightComputedValue.lookupSheet}[{condition.rightComputedValue.lookupName}]
          </div>
        );
    } 
    
    return <div/>;
  }

  conditionClose() {
		this.setState({
      editCondition: false,
		})
	}

	conditionSubmit(data) {
		this.setState({
			editCondition: false,
		});
  }

  render() {
    const { data } = this.props;

    return (
      <div {...Styles.rowContainer}>
        <div style={{ flex: 0.25, fontSize: '13px', alignItems: 'center'}}>{this.constructLHS(data)}</div>
        <div style={{ flex: 0.15, fontSize: '13px', alignItems: 'center'}}>{this.constructOperation(data)}</div>
        <div style={{ flex: 0.25, fontSize: '13px', alignItems: 'center'}}>{this.construcRHS(data)}</div>
        <div style={{ flex: 0.2, fontSize: '13px', alignItems: 'center', marginTop: -20, minWidth: 150}}>
          <SelectField 
            style={{width: 150, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px'}}
            floatingLabelText="Condition"
            errorStyle={{color: 'unset'}}
            value={data.connector}
            onChange={this.editConnector.bind(this, this.props.index)}
          >
            {computedConnectorList.map((item) => {
              return <MenuItem key={uuidv4()} value={item} primaryText={item}  />  
            })}
          </SelectField>          
          {data.connector === 'Concatenate' &&
            <div>
              <TextField
                errorText={"This value will delimit the concatenated output"}
                errorStyle={{color: 'unset'}}
                style={{width: '90%'}}
                hintText="Value"
                defaultValue={data && data.concatConnector ? data.concatConnector : ''}
                onBlur={this.updateConcatConnector.bind(this, this.props.index)}
                ref="computedJoiner"
              />
            </div>}               
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.15, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center'}}>
          <div>
            <ReactTooltip id={'edit'} place="right" type="dark" effect="float">
              <span>Edit condition</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} src={edit} data-tip data-for={'edit'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
              onClick={this.editCondition.bind(this)} />
            <ReactTooltip id={'delete'} place="right" type="dark" effect="float">
              <span>Delete condition</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} src={del} data-tip data-for={'delete'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={this.deleteCondition.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
