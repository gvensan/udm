import React from 'react';
import uuidv4 from 'uuid/v4'; 
import PropTypes from 'prop-types';
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class CustomRow extends React.Component {
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

  constructCode(condition) {
    if (condition.code) {
      var lines = condition.code.split('\n').slice(0, 10);
      return (
        <div style={{display: 'flex', flexDirection: 'row', height: '100%', whiteSpace:'pre'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Custom Code</i></span>
            <br/>
            {lines.map((line) => {
              return <span key={uuidv4()} style={{fontSize: '13px', letterSpacing: '0.5px', color: '#231588'}}><i>{line}</i><br/></span>
            })}
            {lines.length > 10 &&
              <span style={{fontSize: '13px', letterSpacing: '0.5px', color: '#231588'}}><i>{'...'}</i><br/></span>}
          </div>
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
      <div {...Styles.rowContainer} >
        <div style={{ flex: 0.9, fontSize: '13px', alignItems: 'center', overflow: 'auto'}}>{this.constructCode(data)}</div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center'}}>
          <div>
            <img data-row-index={this.props.index} src={edit} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
              onClick={this.editCondition.bind(this)} />
            <img data-row-index={this.props.index} src={del} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={this.deleteCondition.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
