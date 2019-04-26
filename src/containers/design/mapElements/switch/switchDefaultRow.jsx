import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip'
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class SwitchDefaultRow extends React.Component {
  static propTypes = {
    editCondition: PropTypes.func.isRequired,
    deleteCondition: PropTypes.func.isRequired,
  }

  editCondition = (e) => {
    e.preventDefault();
    this.props.editCondition();
  }

  deleteCondition = (e) => {
    e.preventDefault();
    this.props.deleteCondition();
  }

  constructResult(condition) {
    if (condition.resultMode === 'Static Value') 
      return (
        <div>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
          <br/>
          <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588', paddingRight: 10}}>{condition.resultValue.staticValue}</span>            
        </div>
      );
    else if (condition.resultMode === 'Lookup Value') 
      return (
        <div>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
          <br/>
          <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588', paddingRight: 10}}>{condition.resultValue.lookupSheet}[{condition.resultValue.lookupName}]</span>            
        </div>
      );
    else if (condition.resultMode === 'vLookup Name') 
      return (
        <div>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.resultValue.lookupSheet}[{condition.resultValue.lookupName}]<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.resultValue.lookedupName}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.resultValue.lookedupSheetName ? condition.resultValue.lookedupSheetName : 1}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
          {(condition.resultValue.lookedupKey ? condition.resultValue.lookedupKey : 'ERROR') + ' [' +
            (condition.resultValue.lookedupKeyName ? condition.resultValue.lookedupKeyName : 'ERROR') + ']'
          }<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
          {(condition.resultValue.lookedupValue ? condition.resultValue.lookedupValue : 'ERROR') + ' [' +
            (condition.resultValue.lookedupValueName ? condition.resultValue.lookedupValueName : 'ERROR') + ']'
          }<br/> 
        </div>
      );
      
    return <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.resultMode}</i></span>
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
        <div style={{ flex: 0.9, fontSize: '13px', alignItems: 'center'}}>{this.constructResult(data)}</div>
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
