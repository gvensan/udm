import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class PostprocessorRow extends React.Component {
  static propTypes = {
    editPostprocessor: PropTypes.func.isRequired,
    deletePostprocessor: PropTypes.func.isRequired,
  }

  editPostprocessor = (e) => {
    e.preventDefault();
    this.props.editPostprocessor(e.target.dataset.rowIndex, e.target.dataset.rowSheet);
  }

  deletePostprocessor = (e) => {
    e.preventDefault();
    this.props.deletePostprocessor(e.target.dataset.rowIndex, e.target.dataset.rowSheet);
  }

  constructLHS(postprocessor) {
    if (postprocessor.leftPostprocessorMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{postprocessor.leftPostprocessorValue.lookupSheet}[{postprocessor.leftPostprocessorValue.lookupName}]
          </div>
        </div>
      );
    else if (postprocessor.leftPostprocessorMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{postprocessor.leftPostprocessorValue.staticValue}
          </div>
        </div>
      );
              
    return <div/>;
  }

  constructOperation(postprocessor) {
    if (postprocessor.postprocessorType === 'Number round up' || postprocessor.postprocessorType === 'Number round down') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{postprocessor.postprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Rounding Precision: {postprocessor.precision}</span>
            <br/>
          </div>
        );
    if (postprocessor.postprocessorType === 'Skip row if equals to' || postprocessor.postprocessorType === 'Skip row if not equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{postprocessor.postprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {postprocessor.equalsValue}</span>
            <br/>
          </div>
        );        
    if (postprocessor.postprocessorType === 'Skip row if starts with' || postprocessor.postprocessorType === 'Skip row if ends with') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{postprocessor.postprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {postprocessor.startEndValue}</span>
            <br/>
          </div>
        );            
    if (postprocessor.postprocessorType === 'Date Range Fix') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{postprocessor.postprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Target Date from: {postprocessor.fromDate}</span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Target Date to: {postprocessor.toDate}</span><br/>
          </div>
        );                    
    return <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{postprocessor.postprocessorType}</i></span>;
  }

  constructRHS(postprocessor) {
    if (postprocessor.postprocessorType === 'Date Range Fix') {
      if (postprocessor.rightPostprocessorMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{postprocessor.rightPostprocessorValue.staticValue}
          </div>
        );
      else if (postprocessor.rightPostprocessorMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{postprocessor.rightPostprocessorValue.lookupSheet}[{postprocessor.rightPostprocessorValue.lookupName}]
          </div>
        );
    }

    return <div/>;
  }

  postprocessorClose() {
		this.setState({
      editPostprocessor: false,
		})
	}

	postprocessorSubmit(data) {
		this.setState({
			editPostprocessor: false,
		});
  }

  render() {
    const { data } = this.props;

    return (
      <div {...Styles.rowContainer}>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructLHS(data)}</div>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructOperation(data)}</div>
        <div style={{ flex: 0.3, fontSize: '13px', alignItems: 'center'}}>{this.constructRHS(data)}</div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center'}}>
          <div>
          <img data-row-index={this.props.index} data-row-sheet={this.props.sheet}  
              src={edit} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
              onClick={this.editPostprocessor.bind(this)} />
            <img data-row-index={this.props.index} data-row-sheet={this.props.sheet}  
              src={del} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={this.deletePostprocessor.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
