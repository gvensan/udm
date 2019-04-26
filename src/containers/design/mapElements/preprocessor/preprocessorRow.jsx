import React from 'react';
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types';
import * as Styles from './styles';

const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');

export default class PreprocessorRow extends React.Component {
  static propTypes = {
    editPreprocessor: PropTypes.func.isRequired,
    deletePreprocessor: PropTypes.func.isRequired,
  }

  editPreprocessor = (e) => {
    e.preventDefault();
    this.props.editPreprocessor(e.target.dataset.rowIndex, e.target.dataset.rowSheet);
  }

  deletePreprocessor = (e) => {
    e.preventDefault();
    this.props.deletePreprocessor(e.target.dataset.rowIndex, e.target.dataset.rowSheet);
  }

  constructLHS(preprocessor) {
    if (preprocessor.preprocessorType === 'Skip first N rows' || 
        preprocessor.preprocessorType === 'Skip last N rows' || 
        preprocessor.preprocessorType === 'Skip after N rows')
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
        </div>
      );


    if (preprocessor.leftPreprocessorMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{preprocessor.leftPreprocessorValue.lookupSheet}[{preprocessor.leftPreprocessorValue.lookupName}]
          </div>
        </div>
      );
    else if (preprocessor.leftPreprocessorMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <div style={{width: 20, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{this.props.index+1}</div>
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{preprocessor.leftPreprocessorValue.staticValue}
          </div>
        </div>
      );
              
    return <div/>;
  }

  constructOperation(preprocessor) {
    if (preprocessor.preprocessorType === 'Skip first N rows')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Number of rows: {preprocessor.skipRows}</span>
            <br/>
          </div>
        );
    if (preprocessor.preprocessorType === 'Skip last N rows')
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Number of rows: {preprocessor.skipLastRows}</span>
            <br/>
          </div>
        );
    if (preprocessor.preprocessorType === 'Skip after N rows') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Skip row after: {preprocessor.skipAfterRows}</span>
            <br/>
          </div>
        );
    if (preprocessor.preprocessorType === 'Number round up' || preprocessor.preprocessorType === 'Number round down') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Rounding Precision: {preprocessor.precision}</span>
            <br/>
          </div>
        );
    if (preprocessor.preprocessorType === 'Skip row if equals to' || preprocessor.preprocessorType === 'Skip row if not equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.equalsValue}</span>
            <br/>
          </div>
        );        
    if (preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' || 
        preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.equalsValue}</span>
            <br/>
          </div>
        );                
    if (preprocessor.preprocessorType === 'Skip after if equals to' || preprocessor.preprocessorType === 'Skip after if not equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.skipAfterValue}</span>
            <br/>
          </div>
        );        
    if (preprocessor.preprocessorType === 'Skip after if empty') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
          </div>
        );        
    if (preprocessor.preprocessorType === 'Skip row if in list' || preprocessor.preprocessorType === 'Skip row if not in list') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588', 'wordBreak': 'break-all', height: 'auto'}}>Condition Value: {preprocessor.listValue}</span>
            <br/>
          </div>
        );        
    if (preprocessor.preprocessorType === 'Skip row if starts with' || preprocessor.preprocessorType === 'Skip row if ends with') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.startEndValue}</span>
            <br/>
          </div>
        );            
    if (preprocessor.preprocessorType === 'Skip row if less than' || 
        preprocessor.preprocessorType === 'Skip row if less than or equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.lessValue}</span>
            <br/>
          </div>
        );            
    if (preprocessor.preprocessorType === 'Skip row if greater than' || 
        preprocessor.preprocessorType === 'Skip row if greater than or equals to') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Condition Value: {preprocessor.greaterValue}</span>
            <br/>
          </div>
        );            
    if (preprocessor.preprocessorType === 'Date Range Fix') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Target Date from: {preprocessor.fromDate}</span><br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Target Date to: {preprocessor.toDate}</span><br/>
          </div>
        );                    
      
    return <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{preprocessor.preprocessorType}</i></span>;
  }

  construcRHS(preprocessor) {
    if (!(preprocessor.preprocessorType === 'Uppercase' || preprocessor.preprocessorType === 'Lowercase')) {
      if (preprocessor.rightPreprocessorMode === 'Static Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{preprocessor.rightPreprocessorValue.staticValue}
          </div>
        );
      else if (preprocessor.rightPreprocessorMode === 'Lookup Value') 
        return (
          <div>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{preprocessor.rightPreprocessorValue.lookupSheet}[{preprocessor.rightPreprocessorValue.lookupName}]
          </div>
        );
    }

    return <div/>;
  }

  preprocessorClose() {
		this.setState({
      editPreprocessor: false,
		})
	}

	preprocessorSubmit(data) {
		this.setState({
			editPreprocessor: false,
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
              <span>Edit Preprocessor</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} data-row-sheet={this.props.sheet} data-tip data-for={'edit'}
              src={edit} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
              onClick={this.editPreprocessor.bind(this)} />
            <ReactTooltip id={'delete'} place="right" type="dark" effect="float">
              <span>Delete Preprocessor</span>
            </ReactTooltip>            
            <img data-row-index={this.props.index} data-row-sheet={this.props.sheet} data-tip data-for={'delete'}
              src={del} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={this.deletePreprocessor.bind(this)} />
          </div>
        </div>
      </div>
    );
  }
}
