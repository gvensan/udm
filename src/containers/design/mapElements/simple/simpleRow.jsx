import React from 'react';
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types';
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class SimpleRow extends React.Component {
  static propTypes = {
    editCondition: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
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
    if (condition.leftSimpleMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.leftSimpleValue.lookupSheet}[{condition.leftSimpleValue.lookupName}]
          </div>
        </div>
      );
    else if (condition.leftSimpleMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.leftSimpleValue.staticValue}
          </div>
        </div>
      );
    else if (condition.leftSimpleMode === 'vLookup Name') 
      return (
        <div>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.leftSimpleValue.lookupSheet}[{condition.leftSimpleValue.lookupName}]<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftSimpleValue.lookedupName}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.leftSimpleValue.lookedupSheetName ? condition.leftSimpleValue.lookedupSheetName : 1}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
          {(condition.leftSimpleValue.lookedupKey ? condition.leftSimpleValue.lookedupKey : 'ERROR') + ' [' +
            (condition.leftSimpleValue.lookedupKeyName ? condition.leftSimpleValue.lookedupKeyName : 'ERROR') + ']'
          }<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
          {(condition.leftSimpleValue.lookedupValue ? condition.leftSimpleValue.lookedupValue : 'ERROR') + ' [' +
            (condition.leftSimpleValue.lookedupValueName ? condition.leftSimpleValue.lookedupValueName : 'ERROR') + ']'
          }<br/>
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
      if (condition.rightSimpleMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.rightSimpleValue.staticValue}
          </div>
        );
      else if (condition.rightSimpleMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.rightSimpleValue.lookupSheet}[{condition.rightSimpleValue.lookupName}]
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
        <div style={{ flex: 0.45, fontSize: '13px', alignItems: 'center'}}>{this.constructLHS(data)}</div>
        <div style={{ flex: 0.45, fontSize: '13px', alignItems: 'center'}}>{this.constructOperation(data)}</div>
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
