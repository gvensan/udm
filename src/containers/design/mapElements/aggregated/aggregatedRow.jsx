import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import ReactTooltip from 'react-tooltip'
import uuidv4 from 'uuid/v4'; 
import PropTypes from 'prop-types';
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');
const aggregatedConnectorList = [
  '',
  'Add',
  'Subtract',
  'Multiply',
  'Divide'
];

export default class AggregatedRow extends React.Component {
  static propTypes = {
    editAggregated: PropTypes.func.isRequired,
    editConnector: PropTypes.func.isRequired,
    deleteAggregated: PropTypes.func.isRequired,
  }

  editConnector = (rowIndex, e, index, value) => {
    e.preventDefault();
    this.props.editConnector(rowIndex, value === '' ? undefined : value);
  }

  editAggregated = (e) => {
    e.preventDefault();
    this.props.editAggregated(e.target.dataset.rowIndex);
  }

  deleteAggregated = (e) => {
    e.preventDefault();
    this.props.deleteAggregated(e.target.dataset.rowIndex);
  }

  constructLHS(condition) {
    if (condition.leftAggregatedMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.leftAggregatedValue.lookupSheet}[{condition.leftAggregatedValue.lookupName}]
          </div>
        </div>
      );
    else if (condition.leftAggregatedMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.leftAggregatedValue.staticValue}
          </div>
        </div>
      );
    else if (condition.leftAggregatedMode === 'vLookup Name') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}  ><i>Lookup:</i></span> {condition.leftAggregatedValue.lookupSheet}[{condition.leftAggregatedValue.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftAggregatedValue.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Sheet Name:</i></span> {condition.leftAggregatedValue.lookedupSheetName ? condition.leftAggregatedValue.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Key:</i></span> {condition.leftAggregatedValue.lookedupKey ? condition.leftAggregatedValue.lookedupKey : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Value:</i></span> {condition.leftAggregatedValue.lookedupValue ? condition.leftAggregatedValue.lookedupValue : 1}            
          </div>
      </div>
      );      
              
    return <div/>;
  }

  constructOperation(condition) {
    if (condition.conditionType === 'Concatenate')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Joiner: {condition.computedJoiner}</span>
            <br/>
          </div>
        );
    
    return <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span>;
  }

  construcRHS(condition) {
    if (!(condition.conditionType === 'Uppercase' || condition.conditionType === 'Lowercase')) {
      if (condition.rightAggregatedMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.rightAggregatedValue.staticValue}
          </div>
        );
      else if (condition.rightAggregatedMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.rightAggregatedValue.lookupSheet}[{condition.rightAggregatedValue.lookupName}]
          </div>
        );
    }

    return <div/>;
  }

  conditionClose() {
		this.setState({
      editAggregated: false,
		})
	}

	conditionSubmit(data) {
		this.setState({
			editAggregated: false,
		});
  }

  render() {
    const { data } = this.props;

    return (
      <div {...Styles.rowContainer}>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructLHS(data)}</div>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructOperation(data)}</div>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center', marginTop: -30, minWidth: 150}}>
          <SelectField 
            style={{width: 150, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px'}}
            floatingLabelText="Aggregated"
            errorStyle={{color: 'unset'}}
            value={data.connector}
            onChange={this.editConnector.bind(this, this.props.index)}
          >
            {aggregatedConnectorList.map((item) => {
              return <MenuItem key={uuidv4()} value={item} primaryText={item}  />  
            })}
          </SelectField>          
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center'}}>
          <div>
            <ReactTooltip id={'edit'} place="right" type="dark" effect="float">
              <span>Edit condition</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} src={edit} data-tip data-for={'edit'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
              onClick={this.editAggregated.bind(this)} />
            <ReactTooltip id={'delete'} place="right" type="dark" effect="float">
              <span>Delete condition</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} src={del} data-tip data-for={'delete'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={this.deleteAggregated.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
