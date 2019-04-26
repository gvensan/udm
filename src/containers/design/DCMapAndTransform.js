import React from 'react';
import uuidv4 from 'uuid/v4'; 
import {Tabs, Tab} from 'material-ui/Tabs';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import ReactTooltip from 'react-tooltip'
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlexTable from '../../components/flexTable/flexTable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Checkbox from 'material-ui/Checkbox';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import DialogModal from '../../components/dialog';
import SimpleView from './mapElements/simple/simpleView';
import CustomView from './mapElements/custom/customView';
import ConditionalView from './mapElements/conditional/conditionalView';
import ComputedView from './mapElements/computed/computedView';
import AggregatedView from './mapElements/aggregated/aggregatedView';
import SwitchView from './mapElements/switch/switchView';
import PreprocessorCondition from './mapElements/preprocessor/preprocessorCondition';
import PreprocessorRow from './mapElements/preprocessor/preprocessorRow';
import PostprocessorCondition from './mapElements/postprocessor/postprocessorCondition';
import PostprocessorRow from './mapElements/postprocessor/postprocessorRow';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const _ = require('lodash');
const del = require('../../assets/svg/ic_delete.svg');
const expandall = require('../../assets/svg/ic_expandall.svg');
const collapseall = require('../../assets/svg/ic_collapseall.svg');

const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  customWidth: {
    width: 150,
  },
};

export default class DCMapAndTransform extends React.Component {
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
    changeConfirm: false,
    newOrEditPreprocessor: false,
    editPreprocessor: -1,
    deletePreprocessor: -1,
    newOrEditPostprocessor: false,
    editPostprocessor: -1,
    deletePostprocessor: -1,
  }

  setNewPreprocessor = (e) => {
    this.setState({newOrEditPreprocessor: true, editPreprocessor: -1, deletePreprocessor: -1});
  }

  editPreprocessor = (index) => {
    this.setState({newOrEditPreprocessor: true, editPreprocessor: index, deletePreprocessor: -1});
  }

  cancelPreprocessor = () => {
    this.setState({newOrEditPreprocessor: false, editPreprocessor: -1, deletePreprocessor: -1});
  }
  
  deletePreprocessor = (index, sheet) => {
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapPreprocessor[sheet].splice(index, 1);

    this.props.updateState({map: newMap});
    this.setState({newOrEditPreprocessor: false, editPreprocessor: -1, deletePreprocessor: -1});
  }

  updatePreprocessor = (preprocessor, sheet) => {
    var newMap = this.props._state.map;

    newMap.mapPreprocessor = newMap.mapPreprocessor ? newMap.mapPreprocessor : {};
    newMap.mapPreprocessor[sheet] = newMap.mapPreprocessor[sheet] ? newMap.mapPreprocessor[sheet] : [];
  
    if (this.state.editPreprocessor < 0)
      newMap.mapPreprocessor[sheet].push(preprocessor);
    else
      newMap.mapPreprocessor[sheet][this.state.editPreprocessor] = preprocessor;

    this.props.updateState({map: newMap});
    this.setState({newOrEditPreprocessor: false, editPreprocessor: -1, deletePreprocessor: -1});
  }  
  
  setNewPostprocessor = (e) => {
    this.setState({newOrEditPostprocessor: true, editPostprocessor: -1, deletePostprocessor: -1});
  }

  editPostprocessor = (index) => {
    this.setState({newOrEditPostprocessor: true, editPostprocessor: index, deletePostprocessor: -1});
  }

  cancelPostprocessor = () => {
    this.setState({newOrEditPostprocessor: false, editPostprocessor: -1, deletePostprocessor: -1});
  }
  
  deletePostprocessor = (index, sheet) => {
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapPostprocessor[sheet].splice(index, 1);

    this.props.updateState({map: newMap});
    this.setState({newOrEditPostprocessor: false, editPostprocessor: -1, deletePostprocessor: -1});
  }

  updatePostprocessor = (postprocessor, sheet) => {
    var newMap = this.props._state.map;

    newMap.mapPostprocessor = newMap.mapPostprocessor ? newMap.mapPostprocessor : {};
    newMap.mapPostprocessor[sheet] = newMap.mapPostprocessor[sheet] ? newMap.mapPostprocessor[sheet] : [];
  
    if (this.state.editPostprocessor < 0)
      newMap.mapPostprocessor[sheet].push(postprocessor);
    else
      newMap.mapPostprocessor[sheet][this.state.editPostprocessor] = postprocessor;

    this.props.updateState({map: newMap});
    this.setState({newOrEditPostprocessor: false, editPostprocessor: -1, deletePostprocessor: -1});
  }  

  onExpandChange(sheet, key, newExpandState) {
    var expanded = this.props._state.expanded;
    if (!newExpandState) {
      if (expanded[sheet] && expanded[sheet][key])
        delete expanded[sheet][key];
      this.props.updateState({expanded});
    } else {
      if (!expanded[sheet] || !expanded[sheet][key])
        expanded[sheet] = expanded[sheet] ? expanded[sheet] : {};
      expanded[sheet][key] = true;
      this.props.updateState({expanded});
    }
  }

  expandAll = (e) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    var expanded = this.props._state.expanded;
    delete expanded[sheet];
    expanded[sheet] = {};
    var fields = this.props._state.map.targetMap[sheet];
    if (fields && Object.keys(fields).length) {
      Object.keys(fields).map((key) => {
        expanded[sheet][key] = true;
        return key;
      });
    }

    this.props.updateState({expanded});
  }

  collapseAll = (e) => {
    var sheet = e.target.dataset.sheet;
    var expanded = this.props._state.expanded;
    delete expanded[sheet];
    expanded[sheet] = {};
    var fields = this.props._state.map.targetMap[sheet];
    if (fields && Object.keys(fields).length) {
      Object.keys(fields).map((key) => {
        expanded[sheet][key] = false;
        return key;
      });
    }

    this.props.updateState({expanded});
  }

  onActive = (e) => {
    sessionStorage.setItem('tabIndex', e.props.index)
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', flexDirection: 'row' }}>
              <StageIndicator condition={true} title={'Mapper'} jumpto={this.props.jumpto} phase={PHASES.DCMAPPER}/>
              <StageIndicator condition={true} title={'Source Validation'} jumpto={this.props.jumpto} phase={PHASES.DCSOURCEVALIDATION}/>
              <StageIndicator condition={true} title={'Target Validation'} jumpto={this.props.jumpto} phase={PHASES.DCTARGETVALIDATION}/>
              <StageIndicator condition={true} title={'Map & Transform'} phase={PHASES.DCMAPANDTRANSFORM}/>
              <StageIndicator condition={true} title={'Post Processing'} jumpto={this.props.jumpto} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator condition={true} title={'Summary'} jumpto={this.props.jumpto} phase={PHASES.DCSUMMARY}/>
            </div>     

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div onClick={e => this.props.prev(e)}>
                  <label {...Styles.importButtonStyle}  >PREV </label>
                </div>
                <div onClick={e => this.props.validate(e, 3)}>
                  <label {...Styles.importButtonStyle}  >VALIDATE </label>
                </div>
                <div onClick={e => this.props.save(e, 3)}>
                  <label {...Styles.importButtonStyle}  >SAVE </label>
                </div>
                <div onClick={e => this.props.next(e)}>
                  <label {...Styles.importButtonStyle}  >NEXT </label>
                </div>
              </div>           
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', 
                            height: 'auto', marginTop: 20, marginBottom: 10}}>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Map Name:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {this.props._state.map.name}</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Source File:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {this.props._state.sourceFile}</span>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Target File:&nbsp;
                  <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>
                    {this.props._state.targetFile}</span>
                </div>
              </div>   
            </div>                    
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>       
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              {this.props._state.validated && 
                <div style={{ color: '#4caf50'}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    <div>Congratulations, map configuration is valid</div><br/>
                  </div>
                </div>              
              }
              {this.props._state.error && this.props._state.error.length &&
                <div style={{ color: 'unset', marginBottom: 20}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {this.props._state.error.map((_error, index) => {
                      return <div key={uuidv4()}><i style={{color: _error.startsWith('Warning') ? 'orange' : 'red'}}>{_error}</i></div>;
                    })}
                  </div>
                </div>    
              }
            </div>
          </div>
          <Tabs inkBarStyle={Styles.inkBarStyle} tabItemContainerStyle={Styles.tabItemContainerStyle}
            initialSelectedIndex={sessionStorage.getItem('tabIndex') !== undefined ? _.toNumber(sessionStorage.getItem('tabIndex')) : 0}>
            {this.renderTargetMap()}
          </Tabs>   
        </div>
      </MuiThemeProvider>
    );
  }

  renderTargetMap() {
    if (!this.props._state.map.targetMap)
      return;
      
    var targetSheets = Object.keys(this.props._state.map.targetMap);
    var tabs = [];
    var uuidkey = undefined;
    var shortName = undefined;
    targetSheets.map((name) => {
      if (this.props._state.map && this.props._state.map.targetIgnoreMap && this.props._state.map.targetIgnoreMap.indexOf(name) >= 0)
        return name;
        
      const preprocessors = this.props._state.map.mapPreprocessor && this.props._state.map.mapPreprocessor[name]  ? 
                              this.props._state.map.mapPreprocessor[name] : undefined;
      const postprocessors = this.props._state.map.mapPostprocessor && this.props._state.map.mapPostprocessor[name]  ? 
                              this.props._state.map.mapPostprocessor[name] : undefined;
      const sourceSheet = this.getSourceSheet(name);

      uuidkey = uuidv4();
      shortName = name.length > 7 && targetSheets.length > 5 ? name.substring(0, 7) + '...' : name;
        
      tabs.push(
        <Tab key={name} label={shortName} data-tip data-for={uuidkey} onActive={this.onActive}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {this.state.changeConfirm && 
              <div style={{ display: 'flex', flexDirection: 'row', padding: 10, fontSize: '14px', fontWeight: 'bold', 
                    alignItems: 'center', color: '#e0e0e0' }}>
                <DialogModal 
                  style={{display: 'inline'}}
                  needYes={true}
                  needNo={true}
                  open={true}
                  title={this.state.context === 'sheetChange' ? "Change Source" : "Clear Map"}
                  args={{context: this.state.context, contextSheet: this.state.contextSheet}}
                  handleAction={this.changeSheet}
                  content={'Current mapping on this sheet will be reset, do you want to proceed?'}
                />
              </div>
            }
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <ReactTooltip id={uuidkey} place="right" type="dark" effect="float">
                <span>{name}</span>
              </ReactTooltip>
              <div style={{flex: 0.69}}>
                <h2 style={styles.headline}>{name}</h2>
                <div>Map the target attributes on sheet <span style={{fontWeight: 900}}>{name}</span> </div>
              </div>
              <div style={{flex: 0.31}}>
                <Checkbox
                  iconStyle={{fill: root.switchStyleFillColor}}
                  data-sheet={name} 
                  label="Ignore Mapping"
                  labelStyle={{fontWeight: 900}}
                  checked={this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0}
                  onCheck={this.ignoreMapConfig}
                /><br/>
                {this.props._state.map.reuseSource && 
                <Checkbox
                  iconStyle={{fill: root.switchStyleFillColor}}
                  data-sheet={name} 
                  label="Copy Source"
                  labelStyle={{fontWeight: 900}}
                  disabled={this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0}
                  checked={this.props._state.map.reuseSource && 
                          (this.props._state.map.mapCopyConfig && this.props._state.map.mapCopyConfig.indexOf(name) >= 0)}
                  onCheck={this.copySource}
                />}                
                <Checkbox
                  iconStyle={{fill: root.switchStyleFillColor}}
                  data-sheet={name} 
                  label="Copy attributes with same name"
                  labelStyle={{fontWeight: 900}}
                  disabled={this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0}
                  checked={this.props._state.map.mapCopyByNameConfig && this.props._state.map.mapCopyByNameConfig.indexOf(name) >= 0}
                  onCheck={this.copyByNameSource}
                />
              </div>
            </div>
            <br/>
            {!(this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0) &&            
            <div style={{display: 'flex', flexDirection: 'row', width: '100%'}} >
              <Card 
                initiallyExpanded={preprocessors ? true : false}
                style={{border: 'none', boxShadow: 'none', width: '100%'}}>
                <CardHeader
                  title={"Preprocessors " + (preprocessors && preprocessors.length > 0 ? " [" + preprocessors.length + "]" : "")}
                  actAsExpander={true}
                  showExpandableButton={true}
                  style={{float: 'right'}}
                />
                <CardText expandable={true}>
                  <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
                    <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                              backgroundColor: root.processorContainerBackground, 
                              justifyContent: 'space-between'}}  >
                      <div>
                        Preprocessors: 
                      </div>
                      <div>
                        <div onClick={e => this.setNewPreprocessor(e)}>
                          <label {...Styles.importButtonStyle}  >ADD </label>
                        </div>
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}} >
                      <div style={{flex: 1, width: '100%'}}>
                        <FlexTable
                          showSelectAll={false}
                          data={preprocessors}
                          columns={[
                            { name: 'LHS', width: 0.45, style: Styles.headerColumnContainer },
                            { name: 'Operator', width: 0.45, style: Styles.headerColumnContainer },
                            { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
                          ]}
                          rowComponent={PreprocessorRow}
                          rowProps={{
                            sheet: name,
                            editPreprocessor: this.editPreprocessor,
                            deletePreprocessor: this.deletePreprocessor
                          }}
                          headerStyle={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: '#ffffff',
                            margin: '0px 10px',
                            border: 'none',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            paddingLeft: '10px',
                            marginTop: '10px'
                          }}
                        />
                      </div>  
                    </div>
                    {this.state.newOrEditPreprocessor && 
                      <PreprocessorCondition
                        _state={this.props._state} sheet={name} 
                        sourceSheet={sourceSheet}
                        index={this.state.editPreprocessor} 
                        preprocessor={this.state.editPreprocessor >= 0 && preprocessors ?
                                        preprocessors[this.state.editPreprocessor] : undefined}
                        mode={'map'}
                        cancel={this.cancelPreprocessor}
                        submit={this.updatePreprocessor}
                      />
                    }
                  </div>  
                </CardText>
              </Card>
            </div>}
            {!(this.props._state.map.mapIgnoreConfig && 
              this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0) && false &&
            <div style={{display: 'flex', flexDirection: 'row', width: '100%'}} >
              <Card 
                initiallyExpanded={postprocessors ? true : false}
                style={{border: 'none', boxShadow: 'none', width: '100%'}}>
                <CardHeader
                  title={"Postprocessors " + (postprocessors && postprocessors.length > 0 ? " [" + postprocessors.length + "]" : "")}
                  actAsExpander={true}
                  showExpandableButton={true}
                  style={{float: 'right'}}
                />
                <CardText expandable={true}>
                  <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
                    <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                              backgroundColor: root.processorContainerBackground, 
                              justifyContent: 'space-between'}}  >
                      <div>
                        Postprocessors: 
                      </div>
                      <div>
                        <div onClick={e => this.setNewPostprocessor(e)}>
                          <label {...Styles.importButtonStyle}  >SET </label>
                        </div>
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}} >
                      <div style={{flex: 1, width: '100%'}}>
                        <FlexTable
                          showSelectAll={false}
                          data={postprocessors}
                          columns={[
                            { name: 'LHS', width: 0.3, style: Styles.headerColumnContainer },
                            { name: 'Operator', width: 0.3, style: Styles.headerColumnContainer },
                            { name: 'RHS', width: 0.3, style: Styles.headerColumnContainer },
                            { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
                          ]}
                          rowComponent={PostprocessorRow}
                          rowProps={{
                            sheet: name,
                            editPostprocessor: this.editPostprocessor,
                            deletePostprocessor: this.deletePostprocessor
                          }}
                          headerStyle={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            background: '#ffffff',
                            margin: '0px 10px',
                            border: 'none',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            paddingLeft: '10px',
                            marginTop: '10px'
                          }}
                        />
                      </div>  
                    </div>
                    {this.state.newOrEditPostprocessor && 
                      <PostprocessorCondition
                        _state={this.props._state} sheet={name} 
                        sourceSheet={sourceSheet}
                        index={this.state.editPostprocessor} 
                        postprocessor={this.state.editPostprocessor >= 0 && postprocessors ?
                                        postprocessors[this.state.editPostprocessor] : undefined}
                        cancel={this.cancelPostprocessor}
                        submit={this.updatePostprocessor}
                      />
                    }
                  </div>  
                </CardText>
              </Card>
            </div>
            }
            <br/>
            <div>
              {!(this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0) &&
                this.renderMapConfig(name, this.props._state.map.sourceMap[name])}
            </div>
            {!this.props._state.map.customMapping &&
            <div>
              {!(this.props._state.map.mapIgnoreConfig && this.props._state.map.mapIgnoreConfig.indexOf(name) >= 0) &&
                this.renderTargetFieldMap(name, this.props._state.map.targetMap[name])}
            </div>}
          </div>
        </Tab>        
      );

      return name;
    });

    return tabs;
  }  

  renderMapConfig(sheet) {
    var sourceSheets = [];
    Object.keys(this.props._state.map.sourceMap).map((sheetName) => {
      if (!this.props._state.map.sourceIgnoreMap ||
         (this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(sheetName) < 0))
        sourceSheets.push(sheetName);
      return sheetName;
    });

    var sourceColumns = [];
    if (this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
        this.props._state.map.mapConfig[sheet]._config && this.props._state.map.mapConfig[sheet]._config.sourceSheet &&
        this.props._state.map.sourceMap[this.props._state.map.mapConfig[sheet]._config.sourceSheet]) {
      Object.values(this.props._state.map.sourceMap[this.props._state.map.mapConfig[sheet]._config.sourceSheet]).map((value) => {
        sourceColumns.push(value);
        return value;
      });
    } else {
      Object.values(this.props._state.map.sourceMap[sourceSheets[0]]).map((value) => {
        sourceColumns.push(value);
        return value;
      });      
    }

    var allRows = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                  this.props._state.map.mapConfig[sheet]._config && this.props._state.map.mapConfig[sheet]._config.allRows !== undefined ?
                  this.props._state.map.mapConfig[sheet]._config.allRows : true;
    var distinctRows = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                  this.props._state.map.mapConfig[sheet]._config && 
                  this.props._state.map.mapConfig[sheet]._config.distinctRows !== undefined ?
                  this.props._state.map.mapConfig[sheet]._config.distinctRows : false;
    var distinctCompositeRows = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                  this.props._state.map.mapConfig[sheet]._config && 
                  this.props._state.map.mapConfig[sheet]._config.distinctCompositeRows !== undefined ?
                  this.props._state.map.mapConfig[sheet]._config.distinctCompositeRows : false;
    var sourceSheet = this.getSourceSheet(sheet);

    var sourceColumn = this.getSourceColumn(sheet);
    if (!sourceColumn)
      sourceColumn = this.fixSourceColumn(sheet, sourceSheet);
    
    var sourceCompositeColumns = this.getCompositeSourceColumns(sheet);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 10, 
                  paddingTop: 30, paddingBottom: 30, paddingLeft: 10, marginBottom: 10, 
                  boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{flex: 0.2}}>
            <h2 style={{fontWeight: 800}}>Mapping Configuration:</h2>
          </div>
          <div style={{flex: 0.32}}>
            <SelectField 
              floatingLabelText="Source Sheet"
              errorText={<div>Choose the source sheet from the source file that drives the mapping on this target sheet</div>}
              errorStyle={{color: 'unset'}}
              value={sourceSheet}
              onChange={this.updateMapConfigSourceSheet.bind(this, sheet)}
              style={{top: -30}}
            >
              {sourceSheets.map((sheetName) => {
                return <MenuItem key={sheetName} value={sheetName} primaryText={sheetName}  />  
              })}
            </SelectField>
          </div>
          <div style={{flex: 0.32}}>
            <Checkbox
              iconStyle={{fill: root.switchStyleFillColor}}
              data-sheet={sheet}
              data-source-sheet={sourceSheet}
              label="All Rows"
              labelStyle={{fontWeight: 900}}
              checked={allRows}
              onCheck={this.enableAllRows}
            />
            <div>
              <hr style={{ariaHidden: "true", borderTop: 'none rgb(224, 224, 224)', borderLeft: 'none rgb(224, 224, 224)', borderRight: 'none rgb(224, 224, 224)', borderBottom: '1px solid rgb(224, 224, 224)', bottom: '-8px', boxSizing: 'content-box', margin: '0px', position: 'relative', width: '100%'}} />
              <hr style={{ariaHidden: "true", borderTopWidth: 'initial',borderStyle: 'none none solid',borderColor: 'unset',borderLeftWidth: 'initial',borderRightWidth: 'initial',borderBottomWidth: '2px',bottom: '-8px',boxSizing: 'content-box',margin: '0px',position: 'relative',width: '100%',transform: 'scaleX(1)',transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms' }} />
            </div>
            <div style={{position: 'relative', bottom: '-15px', fontSize: '12px', lineHeight: '12px', color: 'unset', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}>
              <div>Enabling all rows will ensure all rows from the source sheet are mapped</div>
            </div>
            <br/>
            <Checkbox
              iconStyle={{fill: root.switchStyleFillColor}}
              data-sheet={sheet}
              data-source-sheet={sourceSheet}
              label="Distinct Rows"
              labelStyle={{fontWeight: 900}}
              checked={distinctRows}
              onCheck={this.enableDistinctRows}
              style={{marginTop: 15}}
            />      
            <div>
              <hr style={{ariaHidden: "true", borderTop: 'none rgb(224, 224, 224)', borderLeft: 'none rgb(224, 224, 224)', borderRight: 'none rgb(224, 224, 224)', borderBottom: '1px solid rgb(224, 224, 224)', bottom: '-8px', boxSizing: 'content-box', margin: '0px', position: 'relative', width: '100%'}} />
              <hr style={{ariaHidden: "true", borderTopWidth: 'initial',borderStyle: 'none none solid',borderColor: 'unset',borderLeftWidth: 'initial',borderRightWidth: 'initial',borderBottomWidth: '2px',bottom: '-8px',boxSizing: 'content-box',margin: '0px',position: 'relative',width: '100%',transform: 'scaleX(1)',transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms' }} />
            </div>
            <div style={{position: 'relative', bottom: '-15px', fontSize: '12px', lineHeight: '12px', color: 'unset', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}>
              <div>Enabling distinct rows will map distinct rows on the specified column on the source sheet</div>
            </div>
            {distinctRows &&
            <SelectField 
              floatingLabelText="Source Column"
              errorText={<div>Choose the source column that drives the mapping on this target sheet</div>}
              errorStyle={{color: 'unset'}}
              value={sourceColumn}
              onChange={this.updateMapConfigSourceColumn.bind(this, sheet)}
            >
              {sourceColumns.map((column) => {
                return <MenuItem key={column} value={column} primaryText={column}  />  
              })}
            </SelectField>}
            <br/>
            <Checkbox
              iconStyle={{fill: root.switchStyleFillColor}}
              data-sheet={sheet}
              data-source-sheet={sourceSheet}
              label="Distinct Composite Rows"
              labelStyle={{fontWeight: 900}}
              checked={distinctCompositeRows}
              onCheck={this.enableDistinctCompositeRows}
              style={{marginTop: 15}}
            />      
            <div>
              <hr style={{ariaHidden: "true", borderTop: 'none rgb(224, 224, 224)', borderLeft: 'none rgb(224, 224, 224)', borderRight: 'none rgb(224, 224, 224)', borderBottom: '1px solid rgb(224, 224, 224)', bottom: '-8px', boxSizing: 'content-box', margin: '0px', position: 'relative', width: '100%'}} />
              <hr style={{ariaHidden: "true", borderTopWidth: 'initial',borderStyle: 'none none solid',borderColor: 'unset',borderLeftWidth: 'initial',borderRightWidth: 'initial',borderBottomWidth: '2px',bottom: '-8px',boxSizing: 'content-box',margin: '0px',position: 'relative',width: '100%',transform: 'scaleX(1)',transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms' }} />
            </div>
            <div style={{position: 'relative', bottom: '-15px', fontSize: '12px', lineHeight: '12px', color: 'unset', transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'}}>
              <div>Enabling distinct rows will map distinct rows based on the composite value composed from the specified columns on the source sheet</div>
            </div>
            {distinctCompositeRows &&
            <SelectField 
              floatingLabelText="Source Columns"
              errorText={<div>Choose the composite source columns that drives the mapping on this target sheet</div>}
              errorStyle={{color: 'unset'}}
              value={sourceCompositeColumns}
              multiple={true}
              onChange={this.updateMapConfigCompositeSourceColumn.bind(this, sheet)}
            >
              {sourceColumns.map((column) => {
                return <MenuItem key={column} value={column} primaryText={column} insetChildren={true}
                                  checked={sourceCompositeColumns && sourceCompositeColumns.indexOf(column) > -1}
                />  
              })}
            </SelectField>}            
          </div>  
          <div style={{flex: 0.06, textAlign: 'center'}}>
            <ReactTooltip id={'clearMap'} place="right" type="dark" effect="float">
              <span>Clear Map configuration</span>
            </ReactTooltip>            
            <img src={del} data-sheet={sheet} data-source-sheet={this.props._state.map.reuseSource && 
                          (this.props._state.map.mapCopyConfig && this.props._state.map.mapCopyConfig.indexOf(sheet) >= 0) ? sheet : sourceSheet} data-source-column={sourceColumn} data-tip data-for={'clearMap'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={e => this.clearMapConfigSource(e)} />
          </div>                
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', fontWeight: 800, alignItems: 'center'}}>
          <div {...Styles.expandCollapseButtonStyle} data-sheet={sheet} onClick={this.expandAll.bind(this)}>
            <img data-sheet={sheet} src={expandall} alt={'Expand All'}  />Expand All
          </div>
          <div {...Styles.expandCollapseButtonStyle} data-sheet={sheet} onClick={this.collapseAll.bind(this)}>
            <img data-sheet={sheet} src={collapseall} alt={'Collapse All'} />Collapse All
          </div>
        </div>
      </div>          
    )
  }  

  changeSheet = (action, checked, args) => {
    var newMap = this.props._state.map;

    if (action === 'YES' && args && this.state.newConfig) {
      var name = args.contextSheet;
      if (args.context === 'sheetChange') {
        newMap.mapConfig[name] = {};
        newMap.mapConfig[name]._config = this.state.newConfig;
        if (!newMap.mapCopyConfig)
          newMap.mapCopyConfig = [];
        if (newMap.mapCopyConfig.indexOf(name) >= 0)
          newMap.mapCopyConfig.splice(newMap.mapCopyConfig.indexOf(name), 1);
        if (!newMap.mapCopyByNameConfig)
          newMap.mapCopyByNameConfig = [];
        if (newMap.mapCopyByNameConfig.indexOf(name) >= 0)
          newMap.mapCopyByNameConfig.splice(newMap.mapCopyByNameConfig.indexOf(name), 1);          
      } else if (args.context === 'clearMap') {
        newMap.mapConfig[name] = {};
        newMap.mapConfig[name]._config = this.state.newConfig;
        if (!newMap.mapCopyConfig)
          newMap.mapCopyConfig = [];
        if (newMap.mapCopyConfig.indexOf(name) >= 0)
          newMap.mapCopyConfig.splice(newMap.mapCopyConfig.indexOf(name), 1);        
        if (!newMap.mapCopyByNameConfig)
          newMap.mapCopyByNameConfig = [];
        if (newMap.mapCopyByNameConfig.indexOf(name) >= 0)
          newMap.mapCopyByNameConfig.splice(newMap.mapCopyByNameConfig.indexOf(name), 1);          
      }
      this.props.updateState({map: newMap});      
    }

    this.setState({changeConfirm: false, newConfig: undefined});    
  }

  getSourceSheet(sheet) {
    var sourceSheet = undefined;
    if (this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
        this.props._state.map.mapConfig[sheet]._config &&  this.props._state.map.mapConfig[sheet]._config.sourceSheet)
        sourceSheet = this.props._state.map.mapConfig[sheet]._config.sourceSheet;
    if (!sourceSheet) {
      var sourceSheets = [];
      Object.keys(this.props._state.map.sourceMap).map((sheetName) => {
        if (!this.props._state.map.sourceIgnoreMap ||
           (this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(sheetName) < 0))
          sourceSheets.push(sheetName);
        return sheetName;
      });
    
      sourceSheet = sourceSheets[0];
    }

    if (this.props._state.map.reuseSource && this.props._state.map.mapCopyConfig && 
        this.props._state.map.mapCopyConfig.indexOf(sheet) >= 0)
      sourceSheet = sheet;
      
    return sourceSheet;
  }

  getSourceColumns(sheet) {
    var sourceColumns = [];

    var newMap = this.props._state.map;    
    Object.values(newMap.sourceMap[sheet]).map((value) => {
      sourceColumns.push(value);
      return value;
    });   

    return sourceColumns;
  }

  getSourceColumn(sheet) {
    var sourceColumn = undefined;
    if (this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] &&  
        this.props._state.map.mapConfig[sheet]._config && this.props._state.map.mapConfig[sheet]._config.sourceColumn)
        sourceColumn = this.props._state.map.mapConfig[sheet]._config.sourceColumn;
    
    return sourceColumn;
  }

  getCompositeSourceColumns(sheet) {
    var sourceColumns = [];
    if (this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] &&  
        this.props._state.map.mapConfig[sheet]._config && this.props._state.map.mapConfig[sheet]._config.sourceColumns)
        sourceColumns = this.props._state.map.mapConfig[sheet]._config.sourceColumns;
    
    return sourceColumns;
  }

  fixSourceColumn(sheet, sourceSheet) {
    var sourceColumns = [];

    var newMap = this.props._state.map;    
    Object.values(newMap.sourceMap[sourceSheet]).map((value) => {
      sourceColumns.push(value);
      return value;
    });   

    
    newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
    newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
    newMap.mapConfig[sheet]._config = newMap.mapConfig[sheet]._config ? newMap.mapConfig[sheet]._config :
                    { sourceSheet: sourceSheet, sourceColumn: sourceColumns[0], allRows: true, distinctRows: false};  
    this.props.updateState({map: newMap});

    return sourceColumns[0];
  }
  
  updateMapConfigSourceSheet(sheet, e, index, value) {
    var newMap = this.props._state.map;
    if (newMap.mapConfig[sheet]._config.sourceSheet === value)
      return;

    var newConfig = {
      allRows: true,
      distinctRows: false,
      distinctCompositeRows: false,
      sourceSheet: value
    };

    var sourceColumns = [];
    Object.values(newMap.sourceMap[value]).map((value) => {
      sourceColumns.push(value);
      return value;
    });   

    newConfig.sourceColumn = sourceColumns[0];
  
    this.setState({newConfig: newConfig, context: 'sheetChange', contextSheet: sheet, contextTargetSheet: value, changeConfirm: true});
    this.props.updateState({map: newMap});
  }

  updateMapConfigCompositeSourceColumn = (sheet, e, index, values) => {
    
    var newMap = this.props._state.map;
    if (newMap.mapConfig && newMap.mapConfig[sheet] && newMap.mapConfig[sheet]._config) {
      newMap.mapConfig[sheet]._config.sourceColumns = values;
    } else {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet]._config = newMap.mapConfig[sheet]._config ? newMap.mapConfig[sheet]._config : {};
      newMap.mapConfig[sheet]._config.sourceColumns = values;
    }

    this.props.updateState({map: newMap});
  }

  updateMapConfigSourceColumn = (sheet, e, index, value) => {
    var newMap = this.props._state.map;
    if (newMap.mapConfig && newMap.mapConfig[sheet] && newMap.mapConfig[sheet]._config) {
      newMap.mapConfig[sheet]._config.sourceColumn = value;;
    } else {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet]._config = newMap.mapConfig[sheet]._config ? newMap.mapConfig[sheet]._config : {};
      newMap.mapConfig[sheet]._config.sourceColumn = value;
    }

    this.props.updateState({map: newMap});
  }

  clearMapConfigSource = (e) => {
    e.preventDefault();
    var newMap = this.props._state.map;

    var targetSheet = e.target.dataset.sourceSheet;
    var sheet = e.target.dataset.sheet;
    var newConfig = {
      allRows: true,
      distinctRows: false,
      distinctCompositeRows: false,
      sourceSheet: targetSheet,
    };

    var sourceColumns = [];
    Object.values(newMap.sourceMap[targetSheet]).map((value) => {
      sourceColumns.push(value);
      return value;
    });   

    newConfig.sourceColumn = sourceColumns[0];

    this.setState({newConfig: newConfig, context: 'clearMap', contextSheet: sheet, contextTargetSheet: targetSheet, changeConfirm: true});
  }    
    
  clearMapSourceKey = (e) => {
    e.preventDefault();
    
    var sheet = e.target.dataset.sheet;
    var key = e.target.dataset.key;
    var newMap = this.props._state.map;
    if (newMap.mapConfig && newMap.mapConfig[sheet] && newMap.mapConfig[sheet][key]) {
      delete (newMap.mapConfig[sheet][key]);
    }
    this.props.updateState({map: newMap});
  }  

  renderTargetFieldMap = (sheet, fields) => {
    var sourceSheet = this.getSourceSheet(sheet);

    var list = [];
    var _this = this;
    Object.keys(fields).map((key) => {
      var mode = _this.props._state.map.mapConfig && _this.props._state.map.mapConfig[sheet] &&  
                  _this.props._state.map.mapConfig[sheet][fields[key]] && _this.props._state.map.mapConfig[sheet][fields[key]].mapMode ?  _this.props._state.map.mapConfig[sheet][fields[key]].mapMode : undefined;
      var error = _this.props._state.map.mapConfig && _this.props._state.map.mapConfig[sheet] &&  
                  _this.props._state.map.mapConfig[sheet][fields[key]] && _this.props._state.map.mapConfig[sheet][fields[key]].mapMode ?  _this.props._state.map.mapConfig[sheet][fields[key]].mapError === true : undefined;
      list.push(
        <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column', margin: 10, padding: 10,
                    boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
          <div style={{display: 'flex', flexDirection: 'row', height: 64, paddingTop: 20}} >
            <div style={{ fontSize: '18px', fontWeight: 700, flex: 0.45 }}>{fields[key]}</div>
            {mode &&
              <div style={{flex: 0.4}}>
                <div style={{ fontSize: '14px', fontWeight: 500, height: 76, color: error ? 
                              root.mapInvalidTypeColor : root.mapValidTypeColor }}>
                  <i>{mode} Map</i>
                </div>
              </div>
            }
            {!mode &&
              <div style={{flex: 0.4}}>
                <div style={{ fontSize: '14px', fontWeight: 500, height: 76, color: root.mapNoneTypeColor }}><i>Not mapped</i></div>
              </div>
            }
            <div style={{flex: 0.15}}>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center', fontWeight: 'bold' }}>
                <div>
                  <ReactTooltip id={'clearMapRule'} place="right" type="dark" effect="float">
                    <span>Reset map rule</span>
                  </ReactTooltip>            
                  <img src={del} data-sheet={sheet} data-key={fields[key]} data-tip data-for={'clearMapRule'}
                    style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
                    onClick={e => _this.clearMapSourceKey(e)} />
                </div>
              </div>
            </div>            
          </div>
          <div style={{display: 'flex', flexDirection: 'row', width: '100%'}} >
            <Card 
              initiallyExpanded={(this.props._state.expanded[sheet] && 
                                  this.props._state.expanded[sheet][key]) ? true : false}
              onExpandChange={this.onExpandChange.bind(this, sheet, key)}
              style={{border: 'none', boxShadow: 'none', width: '100%', marginRight: 10}}>
              <CardHeader
                title="Manage Mapping"
                actAsExpander={true}
                showExpandableButton={true}
                style={{float: 'right', marginTop: -30}}
              />
              <CardText expandable={true}>
                <div style={{display: 'flex', flexDirection: 'column', width: '100%'}} >
                  <div style={{flex: 0.3, marginTop: 30}}>
                    <RadioButtonGroup name="mapMode" 
                      style={{display: 'flex', flexDirection: 'row'}}
                      defaultSelected={mode}
                      data-sheet={sheet} data-key={fields[key]}
                      onChange={_this.updateMapMode.bind(this, sheet, key, fields[key])}>
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Simple"
                        label="Simple"
                        style={{marginBottom: 16}}
                      />
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Conditional"
                        label="Conditional"
                        style={{marginBottom: 16}}
                      />
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Switch"
                        label="Switch"
                        style={{marginBottom: 16}}
                      />
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Computed"
                        label="Computed"
                        style={{marginBottom: 16}}
                      />
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Aggregated"
                        label="Aggregated"
                        style={{marginBottom: 16}}
                      />
                      <RadioButton
                        iconStyle={{fill: root.switchStyleFillColor}}
                        value="Custom"
                        label="Custom"
                        style={{marginBottom: 16}}
                      />
                    </RadioButtonGroup>
                  </div>
                  {mode &&
                  <div style={{display: 'flex', alignItems: 'flex-start', boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px', 
                              width: '100%', marginRight: 30}}>
                    {_this.renderAdvancedMap(sourceSheet, sheet, fields, key, fields[key])}
                  </div>}
                </div>
              </CardText>
            </Card>
          </div>
        </div>
      );

      return key;
    });

    return list;
  }

  updateMapSourceSheet = (sheet, key, val, e, index, value) => {
    e.preventDefault();
    
    var newMap = this.props._state.map;
    if (newMap.mapConfig && newMap.mapConfig[sheet] && newMap.mapConfig[sheet][val]) {
      newMap.mapConfig[sheet][val].simple.sheet = value;
    } else {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].simple = newMap.mapConfig[sheet][val].simple ? newMap.mapConfig[sheet][val].simple : {};
      newMap.mapConfig[sheet][val].simple.sheet = value;
      newMap.mapConfig[sheet][val].name = val;
      newMap.mapConfig[sheet][val].key = key;
      newMap.mapConfig[sheet][val].mapMode = 'Simple';
    }

    const _ = require('lodash');
    newMap.mapConfig[sheet] = _(newMap.mapConfig[sheet]).toPairs().sortBy(0).fromPairs().value();
    
    this.props.updateState({map: newMap});
  }
  
  updateMapSourceKey = (sheet, key, val, e, index, value) => {
    e.preventDefault();

    var newMap = this.props._state.map;
    if (newMap.mapConfig && newMap.mapConfig[sheet] && newMap.mapConfig[sheet][val]) {
      newMap.mapConfig[sheet][val].simple.key = value;
      newMap.mapConfig[sheet][val].simple.name = newMap.sourceMap[newMap.mapConfig[sheet][val].simple.sheet][value];
    } else {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].simple = newMap.mapConfig[sheet][val].simple ? newMap.mapConfig[sheet][val].simple : {};
      newMap.mapConfig[sheet][val].simple.sheet = sheet;
      newMap.mapConfig[sheet][val].simple.key = value;
      newMap.mapConfig[sheet][val].name = val;
      newMap.mapConfig[sheet][val].key = key;
      newMap.mapConfig[sheet][val].mapMode = 'Simple';
    }

    const _ = require('lodash');
    newMap.mapConfig[sheet] = _(newMap.mapConfig[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }  
  
  updateMapMode = (sheet, key, val, e, value) => {
    e.preventDefault();

    var newMap = this.props._state.map;

    if (value === 'Simple') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].simple = newMap.mapConfig[sheet][val].simple ? newMap.mapConfig[sheet][val].simple : {};
      newMap.mapConfig[sheet][val].simple.conditions = newMap.mapConfig[sheet][val].simple.conditions ? newMap.mapConfig[sheet][val].simple.conditions : [];
      newMap.mapConfig[sheet][val].mapMode = value;
    } else if (value === 'Custom') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].custom = newMap.mapConfig[sheet][val].custom ? newMap.mapConfig[sheet][val].custom : {};
      newMap.mapConfig[sheet][val].custom.conditions = newMap.mapConfig[sheet][val].custom.conditions ? newMap.mapConfig[sheet][val].custom.conditions : [];
      newMap.mapConfig[sheet][val].mapMode = value;
    } else if (value === 'Conditional') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].conditional = newMap.mapConfig[sheet][val].conditional ? newMap.mapConfig[sheet][val].conditional : {};
      newMap.mapConfig[sheet][val].conditional.conditions = 
        newMap.mapConfig[sheet][val].conditional.conditions ? newMap.mapConfig[sheet][val].conditional.conditions : [];
      newMap.mapConfig[sheet][val].conditional.trueCondition = newMap.mapConfig[sheet][val].conditional.trueCondition ? 
                newMap.mapConfig[sheet][val].conditional.trueCondition : { mode: 'Empty Value', result: { staticValue: ''}};
      newMap.mapConfig[sheet][val].conditional.falseCondition = newMap.mapConfig[sheet][val].conditional.falseCondition ? 
                newMap.mapConfig[sheet][val].conditional.falseCondition : { mode: 'Empty Value', result: { staticValue: ''}};
      newMap.mapConfig[sheet][val].mapMode = value;
    } else if (value === 'Switch') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].switch = newMap.mapConfig[sheet][val].switch ? newMap.mapConfig[sheet][val].switch : {};
      newMap.mapConfig[sheet][val].switch.conditions = 
        newMap.mapConfig[sheet][val].switch.conditions ? newMap.mapConfig[sheet][val].switch.conditions : [];
      newMap.mapConfig[sheet][val].switch.result = newMap.mapConfig[sheet][val].switch.result ? 
                newMap.mapConfig[sheet][val].switch.result : {};
      newMap.mapConfig[sheet][val].switch.result.mode = 
                newMap.mapConfig[sheet][val].switch.result.mode ? 
                  newMap.mapConfig[sheet][val].switch.result.mode : 'Static Value';
      newMap.mapConfig[sheet][val].mapMode = value;
    } else if (value === 'Computed') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].computed = newMap.mapConfig[sheet][val].computed ? newMap.mapConfig[sheet][val].computed : {};
      newMap.mapConfig[sheet][val].computed.conditions = 
      newMap.mapConfig[sheet][val].computed.conditions ? newMap.mapConfig[sheet][val].computed.conditions : [];
      newMap.mapConfig[sheet][val].mapMode = value;
    } else if (value === 'Aggregated') {
      newMap.mapConfig = newMap.mapConfig ? newMap.mapConfig : {};
      newMap.mapConfig[sheet] = newMap.mapConfig[sheet] ? newMap.mapConfig[sheet] : {};
      newMap.mapConfig[sheet][val] = newMap.mapConfig[sheet][val] ? newMap.mapConfig[sheet][val] : {};
      newMap.mapConfig[sheet][val].aggregated = newMap.mapConfig[sheet][val].aggregated ? newMap.mapConfig[sheet][val].aggregated : {};
      newMap.mapConfig[sheet][val].aggregated.conditions = 
      newMap.mapConfig[sheet][val].aggregated.conditions ? newMap.mapConfig[sheet][val].aggregated.conditions : [];
      newMap.mapConfig[sheet][val].aggregated.skipConditions = 
      newMap.mapConfig[sheet][val].aggregated.skipConditions ? newMap.mapConfig[sheet][val].aggregated.skipConditions : [];
      newMap.mapConfig[sheet][val].mapMode = value;
    }

    const _ = require('lodash');
    newMap.mapConfig[sheet] = _(newMap.mapConfig[sheet]).toPairs().sortBy(0).fromPairs().value();
    
    this.props.updateState({map: newMap});
  }
  
  renderAdvancedMap = (sourceSheet, sheet, fields, key, val) => {
    var mode = (this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
              this.props._state.map.mapConfig[sheet][val] && this.props._state.map.mapConfig[sheet][val].mapMode) ? 
                this.props._state.map.mapConfig[sheet][val].mapMode : undefined;

    var condition = undefined;

    // $SIMPLE
    if (mode === 'Simple') {
      condition = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                      this.props._state.map.mapConfig[sheet][val] && 
                      this.props._state.map.mapConfig[sheet][val].simple ?
                      this.props._state.map.mapConfig[sheet][val].simple : {};
      return (
        <SimpleView 
          _state={this.props._state}
          sourceSheet={sourceSheet}
          sheet={sheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )   
    }    
      
    // $CUSTOM
    if (mode === 'Custom') {       
      return (
        <CustomView 
          _state={this.props._state}
          sourceSheet={sourceSheet}
          sheet={sheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )
    }    

    // $CONDITIONAL
    if (mode === 'Conditional') {
      condition = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                      this.props._state.map.mapConfig[sheet][val] && 
                      this.props._state.map.mapConfig[sheet][val].conditional ?
                      this.props._state.map.mapConfig[sheet][val].conditional : {};              
      return (
        <ConditionalView 
          _state={this.props._state}
          sourceSheet={sourceSheet}
          sheet={sheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )
    }

    // $SWITCH
    if (mode === 'Switch') {
      condition = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                      this.props._state.map.mapConfig[sheet][val] &&
                      this.props._state.map.mapConfig[sheet][val].switch ?
                      this.props._state.map.mapConfig[sheet][val].switch : {};              
      return (
        <SwitchView 
          _state={this.props._state}
          sourceSheet={sourceSheet}
          sheet={sheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )
    }    

    // $COMPUTED
    if (mode === 'Computed') {
      condition = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                      this.props._state.map.mapConfig[sheet][val] && 
                      this.props._state.map.mapConfig[sheet][val].computed ?
                      this.props._state.map.mapConfig[sheet][val].computed : {};              
      return (
        <ComputedView 
          _state={this.props._state}
          sheet={sheet}
          sourceSheet={sourceSheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )      
    }

    // $AGGREGATED
    if (mode === 'Aggregated') {   
      condition = this.props._state.map.mapConfig && this.props._state.map.mapConfig[sheet] && 
                      this.props._state.map.mapConfig[sheet][val] && 
                      this.props._state.map.mapConfig[sheet][val].aggregated ?
                      this.props._state.map.mapConfig[sheet][val].aggregated : {};              
      return (
        <AggregatedView 
          _state={this.props._state}
          sheet={sheet}
          sourceSheet={sourceSheet}
          mapkey={key} 
          fields={fields}           
          condition={condition} 
          updateState={this.props.updateState}/>
      )   
    }    
    
  }
 
  enableAllRows = (e, checked) => {
    e.preventDefault();

    var sheet = e.target.dataset.sheet;
    var sourceSheet = e.target.dataset.sourceSheet;
    var map = this.props._state.map;
    map.mapConfig = map.mapConfig ? map.mapConfig : {};
    map.mapConfig[sheet] = map.mapConfig[sheet] ? map.mapConfig[sheet] : {};
    map.mapConfig[sheet]._config = map.mapConfig[sheet]._config ? map.mapConfig[sheet]._config : {};
    map.mapConfig[sheet]._config.sourceSheet = sourceSheet;
    map.mapConfig[sheet]._config.allRows = checked;
    map.mapConfig[sheet]._config.distinctRows = !checked;
    this.props.updateState({map: map});
  }

  enableDistinctCompositeRows = (e, checked) => {
    e.preventDefault();
    
    var sheet = e.target.dataset.sheet;
    var sourceSheet = e.target.dataset.sourceSheet;
    var map = this.props._state.map;
    map.mapConfig = map.mapConfig ? map.mapConfig : {};
    map.mapConfig[sheet] = map.mapConfig[sheet] ? map.mapConfig[sheet] : {};
    map.mapConfig[sheet]._config = map.mapConfig[sheet]._config ? map.mapConfig[sheet]._config : {};
    map.mapConfig[sheet]._config.sourceSheet = sourceSheet;
    map.mapConfig[sheet]._config.distinctCompositeRows = checked;
    map.mapConfig[sheet]._config.distinctRows = !checked;
    map.mapConfig[sheet]._config.allRows = !checked;
    this.props.updateState({map: map});    
  }

  enableDistinctRows = (e, checked) => {
    e.preventDefault();
    
    var sheet = e.target.dataset.sheet;
    var sourceSheet = e.target.dataset.sourceSheet;
    var map = this.props._state.map;
    map.mapConfig = map.mapConfig ? map.mapConfig : {};
    map.mapConfig[sheet] = map.mapConfig[sheet] ? map.mapConfig[sheet] : {};
    map.mapConfig[sheet]._config = map.mapConfig[sheet]._config ? map.mapConfig[sheet]._config : {};
    map.mapConfig[sheet]._config.sourceSheet = sourceSheet;
    map.mapConfig[sheet]._config.distinctRows = checked;
    map.mapConfig[sheet]._config.distinctCompositeRows = !checked;
    map.mapConfig[sheet]._config.allRows = !checked;
    this.props.updateState({map: map});    
  }
  
  ignoreMapConfig = (e, checked) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    var map = this.props._state.map;
    if (!map.mapIgnoreConfig)
      map.mapIgnoreConfig = [];

    if (checked && map.mapIgnoreConfig.indexOf(sheet) < 0)
      map.mapIgnoreConfig.push(sheet);
    else if (!checked && map.mapIgnoreConfig.indexOf(sheet) >= 0)
      map.mapIgnoreConfig.splice(map.mapIgnoreConfig.indexOf(sheet), 1);

    this.props.updateState({map: map});
  }  

  copySource = (e, checked) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    var map = this.props._state.map;

    if (!map.reuseSource)
      return;

    var sourceColumns = this.getSourceColumns(sheet);

    if (map.mapConfig && map.mapConfig[sheet])
      delete map.mapConfig[sheet];
    map.mapConfig = map.mapConfig ? map.mapConfig : {};
    map.mapConfig[sheet] = map.mapConfig[sheet] ? 
                            map.mapConfig[sheet] : 
                            { _config: { 
                              sourceSheet: sheet, sourceColumn: sourceColumns[0],
                              allRows: true, distinctRows: false}};    
    if (!map.mapCopyConfig)
      map.mapCopyConfig = [];
    if (checked && map.mapCopyConfig.indexOf(sheet) < 0) {
      map.mapCopyConfig.push(sheet);
      var fields = map.sourceMap[sheet];
      var column = undefined;
      Object.keys(fields).map((key) => {
        column = fields[key];

        map.mapConfig[sheet][column] = {
          mapMode: "Simple",
          simple: {
            conditions: [
              {
                leftSimpleMode: "Lookup Value",
                leftSimpleValue: {
                    lookupSheet: sheet,
                    lookupKey: key,
                    lookupName: column
                }                
              }
            ]
          }
        }

        return key;
      });
    } else if (map.mapCopyConfig.indexOf(sheet) >= 0) {
      map.mapCopyConfig.splice(map.mapCopyConfig.indexOf(sheet), 1);
      delete map.mapConfig[sheet];
      map.mapConfig[sheet] = { _config: { 
                                sourceSheet: sheet, sourceColumn: sourceColumns[0],
                                allRows: true, distinctRows: false}};        
    }

    this.props.updateState({map: map});
  }  

  copyByNameSource = (e, checked) => {
    e.preventDefault();
    var targetSheet = e.target.dataset.sheet;
    var map = this.props._state.map;
    var targetColumns = [];    
    Object.entries(map.targetMap[targetSheet]).map((entry) => {
      targetColumns.push(entry);
      return entry;
    });   
    var sourceColumns = [];    
    var sourceSheet = map.mapConfig[targetSheet]._config.sourceSheet;
    Object.entries(map.sourceMap[map.mapConfig[targetSheet]._config.sourceSheet]).map((entry) => {
      sourceColumns.push(entry);
      return entry;
    });   

    map.mapConfig[targetSheet] = map.mapConfig[targetSheet] ? 
                            map.mapConfig[targetSheet] : 
                            { _config: { 
                              sourceSheet: sourceSheet, sourceColumn: sourceColumns[0],
                              allRows: true, distinctRows: false}};    
    if (!map.mapCopyByNameConfig)
      map.mapCopyByNameConfig = [];

    if (checked && map.mapCopyByNameConfig.indexOf(targetSheet) < 0) {
      map.mapCopyByNameConfig.push(targetSheet);
      var targetFields = map.targetMap[targetSheet];
      var sourceFields = map.sourceMap[sourceSheet];
      // var sourceColumn = undefined;
      var targetColumn = undefined;
      Object.keys(targetFields).map((targetColumnKey) => {
        targetColumn = targetFields[targetColumnKey];
        var sourceField = Object.entries(sourceFields).find((entry) => {
          return entry[1] === targetColumn;
        })

        if (sourceField) {
          map.mapConfig[targetSheet][targetColumn] = {
            mapMode: "Simple",
            simple: {
              conditions: [
                {
                  leftSimpleMode: "Lookup Value",
                  leftSimpleValue: {
                      lookupSheet: sourceSheet,
                      lookupKey: sourceField[0],
                      lookupName: sourceField[1]
                  }                
                }
              ]
            }
          }
        }

        return targetColumnKey;
      });
    } else if (map.mapCopyByNameConfig.indexOf(targetSheet) >= 0) {
      map.mapCopyByNameConfig.splice(map.mapCopyByNameConfig.indexOf(targetSheet), 1);
      delete map.mapConfig[targetSheet];
      map.mapConfig[targetSheet] = { _config: { 
                                sourceSheet: sourceSheet, sourceColumn: targetColumns[0],
                                allRows: true, distinctRows: false}};        
    }

    this.props.updateState({map: map});
  }  
}

