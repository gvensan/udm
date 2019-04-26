import React from 'react';
import uuidv4 from 'uuid/v4'; 
import {Tabs, Tab} from 'material-ui/Tabs';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FlexTable from '../../components/flexTable/flexTable';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import ReactTooltip from 'react-tooltip'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FieldValidator from '../../components/fieldValidator';
import PreprocessorCondition from './mapElements/preprocessor/preprocessorCondition';
import PreprocessorRow from './mapElements/preprocessor/preprocessorRow';
import LoaderPage from '../../components/loader';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const del = require('../../assets/svg/ic_delete.svg');
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

const { makeRequest } = require("../../utils/requestUtils");
const _ = require('lodash');
const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}

const isValidNumber = (value) => {
  if (value === undefined || value === '')
    return false;

  var valid = _.isNumber(value) ? true : false;
  try {
    if (!valid) {
      var a = parseFloat(value);
      valid = !isNaN(a)
    }

    return valid;
  } catch (error) {
    return false;
  }
}

export default class DCSourceValidation extends React.Component {
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
    newOrEditPreprocessor: false,
    editPreprocessor: -1,
    deletePreprocessor: -1,
    headerRowError: undefined,
    tabSelected: 0,
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
      newMap.sourcePreprocessor[sheet].splice(index, 1);

    this.props.updateState({map: newMap});
    this.setState({newOrEditPreprocessor: false, editPreprocessor: -1, deletePreprocessor: -1});
  }

  updatePreprocessor = (preprocessor, sheet) => {
    var newMap = this.props._state.map;

    newMap.sourcePreprocessor = newMap.sourcePreprocessor ? newMap.sourcePreprocessor : {};
    newMap.sourcePreprocessor[sheet] = newMap.sourcePreprocessor[sheet] ? newMap.sourcePreprocessor[sheet] : [];
  
    if (this.state.editPreprocessor < 0)
      newMap.sourcePreprocessor[sheet].push(preprocessor);
    else
      newMap.sourcePreprocessor[sheet][this.state.editPreprocessor] = preprocessor;

    this.props.updateState({map: newMap});
    this.setState({newOrEditPreprocessor: false, editPreprocessor: -1, deletePreprocessor: -1});
  }  

  render() {
    if (this.state.crunching) {
      return (<LoaderPage show={true} />);
    }
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', flexDirection: 'row' }}>
              <StageIndicator condition={true} title={'Mapper'} jumpto={this.props.jumpto} phase={PHASES.DCMAPPER}/>
              <StageIndicator condition={true} title={'Source Validation'} phase={PHASES.DCSOURCEVALIDATION}/>
              <StageIndicator condition={true} title={'Target Validation'} jumpto={this.props.jumpto} phase={PHASES.DCTARGETVALIDATION}/>
              <StageIndicator condition={true} title={'Map & Transform'} jumpto={this.props.jumpto} phase={PHASES.DCMAPANDTRANSFORM}/>
              <StageIndicator condition={true} title={'Post Processing'} jumpto={this.props.jumpto} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator condition={true} title={'Summary'} jumpto={this.props.jumpto} phase={PHASES.DCSUMMARY}/>
            </div>     

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div onClick={e => this.props.prev(e)}>
                  <label {...Styles.importButtonStyle}  >PREV </label>
                </div>
                <div onClick={e => this.props.validate(e, 1)}>
                  <label {...Styles.importButtonStyle}  >VALIDATE </label>
                </div>
                <div onClick={e => this.props.save(e, 1)}>
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
                    <div>Congratulations, source validation rules are valid</div><br/>
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
          <Tabs style={{whiteSpace: 'unset'}} inkBarStyle={Styles.inkBarStyle} tabItemContainerStyle={Styles.tabItemContainerStyle}
                initialSelectedIndex= {sessionStorage.getItem('tabIndex') !== undefined ? _.toNumber(sessionStorage.getItem('tabIndex')) : 0}>
            {this.renderSourceSheets()}
          </Tabs>   
        </div>
      </MuiThemeProvider>
    );    
  }

  setHeaderRowChange = (e, value) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    if (!isValidNumber(value)) {
      this.setState({headerRowError: 'Invalid header row number'});
      return;
    }

    var headerRow = this.state.headerRow ? this.state.headerRow : {};
    headerRow[sheet] = value;

    this.setState({headerRow, headerRowError: undefined});
  }
  
  setMergeIntoChange = (currSheet, e, index, value) => {
    e.preventDefault();

    var newMap = this.props._state.map;
    newMap.sourceMapValidation = newMap.sourceMapValidation ? newMap.sourceMapValidation : {};

    var mergeConfig = newMap.mergeConfig ? newMap.mergeConfig : {};
    mergeConfig[currSheet] = value;
    newMap.mergeConfig = mergeConfig;

    var currCols = Object.values(this.props._state.map.sourceMap[currSheet]);
    var targetCols = Object.values(this.props._state.map.sourceMap[value]);

    for (var j=0; j<currCols.length; j++) {
      if (!targetCols || targetCols.indexOf(currCols[j]) < 0) {
        this.setState({mergeIntoError: 'Column "' + currCols[j] + '" not found on the target sheet'});
        return;
      }
    }

    if (newMap.sourceMapValidation[currSheet] && !newMap.sourceMapValidation[value]) {
      this.setState({mergeIntoError: 'Source validation defined on current sheet, but missing on the target sheet "' + value + '"' });
      return;
    }

    if (newMap.sourceMapValidation[value] && !newMap.sourceMapValidation[currSheet]) {
      this.setState({mergeIntoError: 'Source validation defined on target sheet "' + value + '", but missing on the current sheet'});
      return;
    }

    var currColKeys = Object.keys(this.props._state.map.sourceMap[currSheet]);
    var targetColKeys = Object.keys(this.props._state.map.sourceMap[value]);
    for (var i=0; i<currCols.length; i++) {
      var targetColPos = targetCols.indexOf(currCols[i]);
      if (!newMap.sourceMapValidation[currSheet] || !newMap.sourceMapValidation[value])
        continue;
        
      if ((newMap.sourceMapValidation[currSheet][currColKeys[i]] &&
            !newMap.sourceMapValidation[value][targetColKeys[targetColPos]]) ||
          (!newMap.sourceMapValidation[currSheet][currColKeys[i]] &&
            newMap.sourceMapValidation[value][targetColKeys[targetColPos]])) {
        this.setState({mergeIntoError: 'Missing or mismatch validation type found on column "' + currCols[i] + '" on current sheet'});
        return;
      }
      
      if (newMap.sourceMapValidation[currSheet][currColKeys[i]] && 
          newMap.sourceMapValidation[value][targetColKeys[targetColPos]] &&
          newMap.sourceMapValidation[currSheet][currColKeys[i]].type !==
            newMap.sourceMapValidation[value][targetColKeys[targetColPos]].type) {
        this.setState({mergeIntoError: 'Mismatch validation type found on column "' + currCols[i] + '" on current sheet with ' + newMap.sourceMapValidation[currSheet][currColKeys[i]].type + ', expected type is ' + newMap.sourceMapValidation[value][targetColKeys[targetColPos]].type});
        return;
      }
    }

    this.setState({mergeIntoError: undefined});
    this.props.updateState({map: newMap});    
  }

  resetMergeIntoChange = (e) => {
    e.preventDefault();

    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;
    var mergeConfig = newMap.mergeConfig ? newMap.mergeConfig : {};
    delete mergeConfig[sheet];
    newMap.mergeConfig = mergeConfig;

    this.setState({mergeIntoError: undefined})
    this.props.updateState({map: newMap});    
  }

  setHeaderRow = (e, sheet, sheetIndex) => {
    e.preventDefault();

    var newMap = this.props._state.map;

    var headerRow = this.state.headerRow && this.state.headerRow[sheet] ? this.state.headerRow[sheet] :
                      newMap.sourceHeaderRow && newMap.sourceHeaderRow[sheet] ? newMap.sourceHeaderRow[sheet] : newMap.headerRow;
    if (!isValidNumber(headerRow)) {
      this.setState({headerRowError: 'Invalid header row number'});
      return;
    }

    if (newMap.sourceHeaderRow && newMap.sourceHeaderRow[sheet]) {
      newMap.sourceHeaderRow[sheet] = headerRow;
    } else {
      newMap.sourceHeaderRow = newMap.sourceHeaderRow ? newMap.sourceHeaderRow : {};
      newMap.sourceHeaderRow[sheet] = headerRow;
    }

    var _this = this;
    this.setState({crunching: true});
    makeRequest('post', '/api/mapper/sourcesheet', {sheet, headerRow, id: this.props._state.designId})
      .then((result) => {
        _this.setState({crunching: false, tabSelected: sheetIndex});
        _this.props.loadMapState(_this.props._state.designId, 1);
        return;        
      }).catch((error) => {
        _this.setState({headerRowError: 'Invalid header row number - ' + error.message, tabSelected: sheetIndex});
        return;
      });

  }
      
  ignoreSourceSheet = (e, checked) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    var map = this.props._state.map;
    if (!map.sourceIgnoreMap)
      map.sourceIgnoreMap = [];

    if (checked && map.sourceIgnoreMap.indexOf(sheet) < 0)
      map.sourceIgnoreMap.push(sheet);
    else if (!checked && map.sourceIgnoreMap.indexOf(sheet) >= 0)
      map.sourceIgnoreMap.splice(map.sourceIgnoreMap.indexOf(sheet), 1);

    this.props.updateState({map: map});
  }

  onActive = (e) => {
    sessionStorage.setItem('tabIndex', e.props.index)
  }


  renderSourceSheets() {
    var sourceSheets = Object.keys(this.props._state.map.sourceMap);
    var tabs = [];
    var uuidkey = undefined;
    var shortName = undefined;

    var sourceHeaderRow = this.props._state.map.sourceHeaderRow ? this.props._state.map.sourceHeaderRow : {};
    sourceSheets.map((name) => {
      if (this.props._state.map.sourceHeaderRow && 
          this.props._state.map.sourceHeaderRow[name] && Number(this.props._state.map.sourceHeaderRow[name]))
        sourceHeaderRow[name] = Number(this.props._state.map.sourceHeaderRow[name]);
      else
        sourceHeaderRow[name] = Number(this.props._state.map.headerRow) ? Number(this.props._state.map.headerRow) : 1;
      return name;
    });

    sourceSheets.map((name, sheetIndex) => {
      const preprocessors = this.props._state.map.sourcePreprocessor && this.props._state.map.sourcePreprocessor[name]  ? 
                              this.props._state.map.sourcePreprocessor[name] : undefined;
      uuidkey = uuidv4();
      shortName = name.length > 7 && sourceSheets.length > 5  ? name.substring(0, 7) : name;
      tabs.push(
        <Tab key={name} label={shortName} data-tip data-for={uuidkey}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <ReactTooltip id={uuidkey} place="right" type="dark" effect="float">
                <span>{name}</span>
              </ReactTooltip>
              <div style={{flex: 0.8}}>
                <h2 style={styles.headline}>{name}</h2>
                <div>Here is an opportunity to mark required and unique fields on this sheet <span style={{fontWeight: 900}}>{name}</span> </div>
              </div>
              <div style={{flex: 0.2}}>
                <Checkbox
                  iconStyle={{fill: root.switchStyleFillColor}}
                  data-sheet={name} 
                  label="Ignore Sheet"
                  labelStyle={{fontWeight: 900}}
                  checked={this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(name) >= 0}
                  onCheck={this.ignoreSourceSheet}
                />
              </div>
            </div>
            <br/>
            {!(this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(name) >= 0) &&
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 10, flex: 0.5 }}>
                <div style={{padding: 20, paddingBottom: 30, marginBottom: 10,  
                            border: '1px dotted ' + root.dottedBorderColor}}>               
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 14, fontWeight: 900}}>Header Row:</div>
                      <div>Mark the beginning of data with header row, all preceding rows will be skipped</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>              
                    <div style={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                      <TextField
                        errorText={this.state.headerRowError}
                        hintText="Enter header row number"
                        floatingLabelText="Header row number"
                        defaultValue={sourceHeaderRow[name]}
                        onChange={this.setHeaderRowChange}
                        data-sheet={name}
                        style={{width: '80%'}}
                        ref="hrow"
                      />
                      <div data-sheet={name} onClick={e => this.setHeaderRow(e, name, sheetIndex)}>
                        <label {...Styles.importButtonStyle}  >LOAD </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', margin: 10, flex: 0.5 }}>
                <div style={{padding: 20, paddingBottom: 30, marginBottom: 10, border: '1px dotted ' + root.dottedBorderColor}}>               
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontSize: 14, fontWeight: 900}}>Merge Sheet Into:</div>
                      <div>Merge data in the current sheet into another sheet resulting in columns with the same names copied over</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>              
                    <div style={{flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                      <SelectField 
                        floatingLabelText="Target Sheet"
                        errorText={this.state.mergeIntoError}
                        errorStyle={{color: this.state.mergeIntoError ? 'red' : 'unset'}}
                                  value={this.props._state.map.mergeConfig && this.props._state.map.mergeConfig ? 
                                this.props._state.map.mergeConfig[name] : ''}
                        style={{width: '80%'}}
                        onChange={this.setMergeIntoChange.bind(this, name)}
                      >
                        {sourceSheets.map((sheetName) => {
                          if (sheetName === name)
                            return '';
                          return <MenuItem key={sheetName} value={sheetName} primaryText={sheetName}  />  
                        })}
                      </SelectField>   
                      <div style={{flex: 0.06, textAlign: 'center', marginTop: 20}}>
                        <ReactTooltip id={'reset'} place="right" type="dark" effect="float">
                          <span>Reset</span>
                        </ReactTooltip>            
                        <img src={del} data-sheet={name} data-tip data-for={'reset'}
                          style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'reset'} 
                          onClick={e => this.resetMergeIntoChange(e)} />
                      </div>                                          
                    </div>
                  </div>
                </div>
              </div>
            </div>}       
            <br/>
            {!(this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(name) >= 0) &&
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
                              backgroundColor: root.processorContainerBackground, justifyContent: 'space-between'}}  >
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
                        sourceSheet={name}
                        index={this.state.editPreprocessor} 
                        preprocessor={this.state.editPreprocessor >= 0 && preprocessors ?
                                        preprocessors[this.state.editPreprocessor] : undefined}
                        mode={'source'}
                        cancel={this.cancelPreprocessor}
                        submit={this.updatePreprocessor}
                      />
                    }
                  </div>  
                </CardText>
              </Card>
            </div>}

            <br/>
            <div>
              <div>
                {!(this.props._state.map.sourceIgnoreMap && this.props._state.map.sourceIgnoreMap.indexOf(name) >= 0) &&
                  this.renderSourceFields(name, this.props._state.map.sourceMap[name])}
              </div>
            </div>
          </div>
        </Tab>
      );

      return name;
    });

    return tabs;
  }

  renderSourceFields = (sheet, fields) => {
    var list = [];
    var merged = this.props._state.map.mergeConfig && this.props._state.map.mergeConfig[sheet] && !this.state.mergeIntoError;
    Object.keys(fields).map((key) => {
      list.push(
        <FieldValidator
          key={uuidv4()}
          sheet={sheet}
          fieldKey={key}
          fieldName={fields[key]}
          disabled={merged}
          fieldType={this.props._state.map.sourceMapValidation && this.props._state.map.sourceMapValidation[sheet] &&    
                    this.props._state.map.sourceMapValidation[sheet][key] && this.props._state.map.sourceMapValidation[sheet][key].type ?
                    this.props._state.map.sourceMapValidation[sheet][key].type : 'String'}
          unique={this.props._state.map.sourceMapValidation && this.props._state.map.sourceMapValidation[sheet] &&    
                    this.props._state.map.sourceMapValidation[sheet][key] &&
                    this.props._state.map.sourceMapValidation[sheet][key].hasOwnProperty('unique') ?
                      this.props._state.map.sourceMapValidation[sheet][key].unique : false }
          required={this.props._state.map.sourceMapValidation && this.props._state.map.sourceMapValidation[sheet] &&    
                    this.props._state.map.sourceMapValidation[sheet][key] &&
                    this.props._state.map.sourceMapValidation[sheet][key].hasOwnProperty('required') ?
                    this.props._state.map.sourceMapValidation[sheet][key].required : false }
          onFieldTypeChange={this.updateSourceType.bind(this)}
          onFieldRequired={this.updateSourceRequired.bind(this)}
          onFieldUnique={this.updateSourceUnique.bind(this)}
          onFieldIdentifier={() => {}}
          showUniqueRequired={true}
        />
      );

      return key;

    });

    return list;
  }

  updateSourceRequired = (e) => {
    var key = e.target.dataset.key;
    var value = e.target.dataset.value;
    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;
    if (newMap.sourceMapValidation && newMap.sourceMapValidation[sheet] &&
        newMap.sourceMapValidation[sheet][key]) {
      newMap.sourceMapValidation[sheet][key].required = 
            newMap.sourceMapValidation[sheet][key].required ? !newMap.sourceMapValidation[sheet][key].required : true;
    } else {
      newMap.sourceMapValidation = newMap.sourceMapValidation ? newMap.sourceMapValidation : {};
      newMap.sourceMapValidation[sheet] = newMap.sourceMapValidation[sheet] ? newMap.sourceMapValidation[sheet] : {};
      newMap.sourceMapValidation[sheet][key] = newMap.sourceMapValidation[sheet][key] ? newMap.sourceMapValidation[sheet][key] : {};
      newMap.sourceMapValidation[sheet][key].name = value;
      newMap.sourceMapValidation[sheet][key].required = true;
    }

    newMap.sourceMapValidation[sheet] = _(newMap.sourceMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }

  updateSourceUnique = (e) => {
    var key = e.target.dataset.key;
    var value = e.target.dataset.value;
    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;
    if (newMap.sourceMapValidation && newMap.sourceMapValidation[sheet][key] && newMap.sourceMapValidation[sheet][key].unique) {
      newMap.sourceMapValidation[sheet][key].unique = !newMap.sourceMapValidation[sheet][key].unique;
    } else {
      newMap.sourceMapValidation = newMap.sourceMapValidation ? newMap.sourceMapValidation : {};
      newMap.sourceMapValidation[sheet] = newMap.sourceMapValidation[sheet] ? newMap.sourceMapValidation[sheet] : {};
      newMap.sourceMapValidation[sheet][key] = newMap.sourceMapValidation[sheet][key] ? newMap.sourceMapValidation[sheet][key] : {};
      newMap.sourceMapValidation[sheet][key].name = value;
      newMap.sourceMapValidation[sheet][key].unique = true;
    }

    const _ = require('lodash');
    newMap.sourceMapValidation[sheet] = _(newMap.sourceMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }


  updateSourceType = (sheet, key, val, e, index, value) => {
    var newMap = this.props._state.map;
    if (newMap.sourceMapValidation && newMap.sourceMapValidation[sheet] && newMap.sourceMapValidation[sheet][key]) {
      newMap.sourceMapValidation[sheet][key].name = val;
      newMap.sourceMapValidation[sheet][key].type = value;
    } else {
      newMap.sourceMapValidation = newMap.sourceMapValidation ? newMap.sourceMapValidation : {};
      newMap.sourceMapValidation[sheet] = newMap.sourceMapValidation[sheet] ? newMap.sourceMapValidation[sheet] : {};
      newMap.sourceMapValidation[sheet][key] = newMap.sourceMapValidation[sheet][key] ? newMap.sourceMapValidation[sheet][key] : {};
      newMap.sourceMapValidation[sheet][key].name = val;
      newMap.sourceMapValidation[sheet][key].type = value;
    }

    if (newMap.reuseSource) {
      if (newMap.targetMapValidation && newMap.targetMapValidation[sheet] && newMap.targetMapValidation[sheet][key]) {
        newMap.targetMapValidation[sheet][key].name = val;
        newMap.targetMapValidation[sheet][key].type = value;
      } else {
        newMap.targetMapValidation = newMap.targetMapValidation ? newMap.targetMapValidation : {};
        newMap.targetMapValidation[sheet] = newMap.targetMapValidation[sheet] ? newMap.targetMapValidation[sheet] : {};
        newMap.targetMapValidation[sheet][key] = newMap.targetMapValidation[sheet][key] ? newMap.targetMapValidation[sheet][key] : {};
        newMap.targetMapValidation[sheet][key].name = val;
        newMap.targetMapValidation[sheet][key].type = value;
      }
    }

    const _ = require('lodash');
    newMap.sourceMapValidation[sheet] = _(newMap.sourceMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();
    if (newMap.mergeConfig && newMap.mergeConfig[sheet])
      delete newMap.mergeConfig[sheet];
    this.setState({mergeIntoError: undefined});
    this.props.updateState({map: newMap});
  }
    
}