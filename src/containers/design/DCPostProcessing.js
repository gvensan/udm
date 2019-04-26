import React from 'react';
import uuidv4 from 'uuid/v4'; 
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const del = require('../../assets/svg/ic_delete.svg');
const edit = require('../../assets/svg/ic_edit.svg');
const { makeRequest } = require("../../utils/requestUtils");
const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}

export default class DCPostProcessing extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
    loadMapState: PropTypes.func.isRequired,
    updateAndLoadMapState: PropTypes.func.isRequired,
    prev: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    next: PropTypes.func.isRequired,    
  }
  
  state = {
    maps: []
  }

  componentDidMount() {
    var str = '';
    if (this.props._state.map && this.props._state.map.namedlookups && this.props._state.map.namedlookupsList) {
      for (var i=0; i<this.props._state.map.namedlookupsList.length-1; i++) {
        str = str + this.props._state.map.namedlookupsList[i] + ', ';
      }
      str = str + this.props._state.map.namedlookupsList[this.props._state.map.namedlookupsList.length-1];
      this.setState({namedLookupString: str});
    }

    makeRequest('get', '/api/mapper/maps')
      .then((result) => {
        if (result.data.success) {
          var maps = result.data.maps;
          this.setState({maps: maps});
        } 
        return;        
      }).catch((error) => {
        return;
      });        
  }

  handleChainWaterfall = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.chainWaterfall = checked;
    this.props.updateState({map: newMap});    
  }

  handleChainMaps = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.chainMaps = checked;
    this.props.updateState({map: newMap});    
  }

  handleDiffSupported = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.diffSupported = checked;
    this.props.updateState({map: newMap});    
  }

  handleDiffMandatory = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.diffMandatory = checked;
    this.props.updateState({map: newMap});    
  }

  handleChainEdit(chainIndex, e) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    var chainedMaps = newMap.chainedMaps ? newMap.chainedMaps : [];
    window.location.href = '/design/' + chainedMaps[chainIndex].id;
  }


  handleChainReset(chainIndex, e) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    var chainedMaps = newMap.chainedMaps ? newMap.chainedMaps : [];
    if (chainedMaps.length > chainIndex)
      chainedMaps.splice(chainIndex, 1);
    this.props.updateState({map: newMap});
  }

  selectChainedMap(chainIndex, e, index, id) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    var chainedMaps = newMap.chainedMaps ? newMap.chainedMaps : [];
    var map = this.state.maps.find((map) => {
      return map.id === id;
    })
    chainedMaps[chainIndex] = map ? {
      id: map.id,
      name: map.name,
      description: map.description,
      lastUpdatedAt: map.lastUpdatedAt,
      source: map.sourceFile,
      target: map.targetFile
    } : {
      id: 'UNKNOWN',
      name: 'UNKNOWN',
      description: 'UNKNOWN',
      lastUpdatedAt: 'UNKNOWN',
      source: 'UNKNOWN',
      target: 'UNKNOWN'
    }

    newMap.chainedMaps = chainedMaps;
    this.props.updateState({map: newMap});
  }

  addChainedMapper(e) {
    var newMap = this.props._state.map ? this.props._state.map : {};
    var chainedMaps = newMap.chainedMaps ? newMap.chainedMaps : [];
    chainedMaps.push({});
    newMap.chainedMaps = chainedMaps;
    this.props.updateState({map: newMap});
  }

  selectAbsentRecordAction(e, index, id) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.diffProcessing = newMap.diffProcessing ? newMap.diffProcessing : {};
    newMap.diffProcessing['Absent Record'] = id;
    this.props.updateState({map: newMap});
  }

  selectPartialChangesAction(e, index, id) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.diffProcessing = newMap.diffProcessing ? newMap.diffProcessing : {};
    newMap.diffProcessing['Partial Changes'] = id;
    this.props.updateState({map: newMap});
  }

  render() {
    var _this = this;

    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', flexDirection: 'row' }}>
              <StageIndicator condition={true} title={'Mapper'} jumpto={_this.props.jumpto} phase={PHASES.DCMAPPER}/>
              <StageIndicator condition={true} title={'Source Validation'} jumpto={_this.props.jumpto} phase={PHASES.DCSOURCEVALIDATION}/>
              <StageIndicator condition={true} title={'Target Validation'} jumpto={_this.props.jumpto} phase={PHASES.DCTARGETVALIDATION}/>
              <StageIndicator condition={true} title={'Map & Transform'} jumpto={_this.props.jumpto} phase={PHASES.DCMAPANDTRANSFORM}/>
              <StageIndicator condition={true} title={'Post Processing'} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator condition={true} title={'Summary'} jumpto={_this.props.jumpto} phase={PHASES.DCSUMMARY}/>
            </div>     

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div onClick={e => _this.props.prev(e)}>
                  <label {...Styles.importButtonStyle}  >PREV </label>
                </div>
                <div onClick={e => _this.props.validate(e, 4)}>
                  <label {...Styles.importButtonStyle}  >VALIDATE </label>
                </div>
                <div onClick={e => _this.props.save(e, 4)}>
                  <label {...Styles.importButtonStyle}  >SAVE </label>
                </div>
                <div onClick={e => _this.props.next(e)}>
                  <label {...Styles.importButtonStyle}  >NEXT </label>
                </div>
              </div>           
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', 
                            height: 'auto', marginTop: 20, marginBottom: 10}}>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Map Name:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {_this.props._state.map.name}</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Source File:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {_this.props._state.sourceFile}</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Target File:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {_this.props._state.targetFile}</span>
                </div>
              </div>   
            </div>                    
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>       
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              {_this.props._state.validated && 
                <div style={{ color: '#4caf50'}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    <div>Congratulations, source validation rules are valid</div><br/>
                  </div>
                </div>              
              }
              {_this.props._state.error && _this.props._state.error.length &&
                <div style={{ color: 'red'}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    <div>Mapper design failed with the error:</div>
                    {_this.props._state.error.map((_error, index) => {
                      return <div key={uuidv4()}><i>{_error}</i></div>;
                    })}
                    <div>Please review the input file and try again.</div><br/>
                  </div>
                </div>    
              }
            </div>
          </div>
          
          {((_this.props._state.map && _this.props._state.map.name) || _this.refs.mname) && 
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', flex: 1}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Chain Maps </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                  Run multiple passes with each pass using different papper while consolidating the output
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', alignItems: 'center'}}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Requires chaining"
                    labelStyle={{fontWeight: 900}}
                    style={{width: 256}}
                    checked={_this.props._state.map.chainMaps !== undefined ? _this.props._state.map.chainMaps : false }
                    onCheck={_this.handleChainMaps}
                  />
                </div>
              </div>
            </div>
            <div   style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 24 }}>
              {_this.props._state.map.chainMaps !== undefined && _this.props._state.map.chainMaps &&
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center'}}>
                <div style={{width: '100%', marginTop: 24}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Apply Waterfall Chaining"
                    labelStyle={{fontWeight: 900}}
                    style={{width: 256}}
                    checked={_this.props._state.map.chainWaterfall !== undefined ? _this.props._state.map.chainWaterfall : false }
                    onCheck={_this.handleChainWaterfall}
                  />
                </div>
                <div onClick={_this.addChainedMapper.bind(this)} style={{width: '100%', marginTop: 24}}>
                  <label {...Styles.importButtonStyle}  >ADD </label>
                </div>
              </div>}
            </div>    
            {_this.props._state.map.chainMaps && _this.props._state.map.chainedMaps && _this.props._state.map.chainedMaps.length > 0 &&
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
              {_this.props._state.map.chainedMaps.map((cmap, cindex) => {
                return (
                  <div key={uuidv4()} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', 
                                alignItems: 'flex-start', padding: 16, marginRight: 8, marginBottom: 8, 
                                border: '1px dotted ' + root.dottedBorderColor}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Chained Map [{cindex+1}] </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        <img src={edit} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'edit'} 
                        onClick={this.handleChainEdit.bind(this, cindex)} />
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                        onClick={this.handleChainReset.bind(this, cindex)} />
                      </div>
                    </div>

                    <SelectField 
                      errorText={'Qualified mappers'}
                      errorStyle={{color: 'unset'}}
                      autoWidth={true}
                      fullWidth={true}
                      style={{width: 400}}
                      floatingLabelText="Chainable Mapper"
                      value={cmap.id}
                      onChange={this.selectChainedMap.bind(this, cindex)}
                    >
                      {this.state.maps.filter((map) => {
                        return (map.status === 'VALID' && map.id !== this.props._state.map.id)
                      }).map((map) => {
                        return <MenuItem key={uuidv4()} value={map.id} primaryText={map.name}  />
                      })}
                    </SelectField>                      
                  </div>
                );
              })}
            </div>}
          </div>}


          {((_this.props._state.map && _this.props._state.map.name) || _this.refs.mname) &&
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', flex: 1}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Delta Detection </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                  Utilizes previously processed output file to identify changes and missing records
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', alignItems: 'center'}}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Support diff processing"
                    labelStyle={{fontWeight: 900}}
                    style={{width: 256}}
                    checked={_this.props._state.map.diffSupported !== undefined ? _this.props._state.map.diffSupported : false }
                    onCheck={_this.handleDiffSupported}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center'}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Mandatory diff processsing"
                    labelStyle={{fontWeight: 900}}
                    style={{width: 256}}
                    checked={_this.props._state.map.diffMandatory !== undefined ? _this.props._state.map.diffMandatory : false }
                    onCheck={_this.handleDiffMandatory}
                  />
                </div>
              </div>
            </div>

            {_this.props._state.map.diffSupported &&
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', 
                          alignItems: 'flex-start', padding: 16, marginRight: 8, marginBottom: 8, 
                          border: '1px dotted ' + root.dottedBorderColor}}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}> Record</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                  A record from the last load is missing in the current dataset
                </div>
              </div>

              <SelectField 
                errorText={'How to handle absent records?'}
                errorStyle={{color: 'unset'}}
                autoWidth={true}
                fullWidth={true}
                style={{width: 400}}
                floatingLabelText="Absent Record"
                value={_this.props._state.map.diffProcessing && _this.props._state.map.diffProcessing['Absent Record'] ? 
                        _this.props._state.map.diffProcessing['Absent Record'] : 'No Action'}
                onChange={this.selectAbsentRecordAction.bind(this)}
              >
                <MenuItem key={uuidv4()} value={'No Action'} primaryText={'No Action'}  />
                <MenuItem key={uuidv4()} value={'Bring Over'} primaryText={'Bring Over'}  />
              </SelectField>                      
            </div>}
            
            {_this.props._state.map.diffSupported &&
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', 
                          alignItems: 'flex-start', padding: 16, marginRight: 8, marginBottom: 8, 
                          border: '1px dotted ' + root.dottedBorderColor}}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Partial Changes</div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                  Check for changes to records on last and current dataset based on the marked attributes
                </div>
              </div>

              <SelectField 
                errorText={'How to handle partial changes?'}
                errorStyle={{color: 'unset'}}
                autoWidth={true}
                fullWidth={true}
                style={{width: 400}}
                floatingLabelText="Partial Changes"
                value={_this.props._state.map.diffProcessing && _this.props._state.map.diffProcessing['Partial Changes'] ? 
                        _this.props._state.map.diffProcessing['Partial Changes'] : 'No Action'}
                onChange={this.selectPartialChangesAction.bind(this)}
              >
                <MenuItem key={uuidv4()} value={'No Action'} primaryText={'No Action'}  />
                <MenuItem key={uuidv4()} value={'Undo Changes'} primaryText={'Undo Changes'}  />
              </SelectField>                      
            </div>}

          </div>}
        </div>
      </MuiThemeProvider>
    );    
  }
}