import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import ReactTooltip from 'react-tooltip'
import MenuItem from 'material-ui/MenuItem';
import uuidv4 from 'uuid/v4'; 
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class ConditionRow extends React.Component {
  static propTypes = {
    editCondition: PropTypes.func.isRequired,
    editConnector: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
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

  constructLHS(condition) {
    if (condition.leftConditionMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span><br/>
            {condition.leftConditionValue.lookupSheet}[{condition.leftConditionValue.lookupName}]
          </div>
        </div>
      );
    else if (condition.leftConditionMode === 'vLookup Name') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.leftConditionValue.lookupSheet}[{condition.leftConditionValue.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftConditionValue.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.leftConditionValue.lookedupSheetName ? condition.leftConditionValue.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
            {(condition.leftConditionValue.lookedupKey ? condition.leftConditionValue.lookedupKey : 'ERROR') + ' [' +
              (condition.leftConditionValue.lookedupKeyName ? condition.leftConditionValue.lookedupKeyName : 'ERROR') + ']'
            }<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
            {(condition.leftConditionValue.lookedupValue ? condition.leftConditionValue.lookedupValue : 'ERROR') + ' [' +
              (condition.leftConditionValue.lookedupValueName ? condition.leftConditionValue.lookedupValueName : 'ERROR') + ']'
            }<br/> 
          </div>
        </div>
      );
    
    return <div/>;
  }

  constructOperation(condition) {
    if (condition.conditionType === 'Substring')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>From: {condition.stringPosition}, Length: {condition.stringLength}</span>
            <br/>
          </div>
        );        
    if (condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
        condition.conditionType === 'Contains')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{condition.subString}</span>
            <br/>
          </div>
        );        

    return <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span>;
  }

  construcRHS(condition) {
    if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty' ||
          condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
          condition.conditionType === 'Contains')) {
      if (condition.rightConditionMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.rightConditionValue.staticValue}
          </div>
        );
      else if (condition.rightConditionMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.rightConditionValue.lookupSheet}[{condition.rightConditionValue.lookupName}]
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
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructLHS(data)}</div>
        <div style={{ flex: 0.2, fontSize: '13px', alignItems: 'center'}}>{this.constructOperation(data)}</div>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.construcRHS(data)}</div>
        <div style={{ flex: 0.1, fontSize: '13px', alignItems: 'center', marginTop: -30, minWidth: 150}}>
          <SelectField 
            style={{width: 150, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px'}}
            floatingLabelText="Condition"
            errorStyle={{color: 'unset'}}
            value={data.connector}
            onChange={this.editConnector.bind(this, this.props.index)}
          >
            <MenuItem key={uuidv4()} value={'AND'} primaryText={'AND'}  />  
            <MenuItem key={uuidv4()} value={'OR'} primaryText={'OR'}  />  
            <MenuItem key={uuidv4()} value={''} primaryText={''}  />  
          </SelectField>          
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center'}}>
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
