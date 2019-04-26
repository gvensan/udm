import React from 'react';
import uuidv4 from 'uuid/v4'; 
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}

export default class DCSummary extends React.Component {
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
    namedLookupString: ''
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
  }

  constructSheetMapper(sheetName, map) {
    return (
      <div>
        {map.mapCopyConfig && map.mapCopyConfig.indexOf(sheetName) >= 0 &&
        <div {...Styles.headerRowContainer}  >
          <div style={{...Styles.headerLeftRow}}>
            &nbsp;&nbsp;&nbsp;&nbsp;{'Copy all attributes:'}
          </div>
          <div style={{ flex: 0.5, fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588' }}>TRUE</div>
        </div>}
        {map.mapCopyByNameConfig && map.mapCopyByNameConfig.indexOf(sheetName) >= 0 &&
        <div {...Styles.headerRowContainer}  >
          <div style={{...Styles.headerLeftRow}}>
            &nbsp;&nbsp;&nbsp;&nbsp;{'Copy attributes with same name:'}
          </div>
          <div style={{ flex: 0.5, fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588' }}>TRUE</div>
        </div>}
      </div>
    );
  }

  constructPreprocessorDetail(preprocessor) {
    return (
      <div>
        {preprocessor.preprocessorType === 'Dedup by removal' && <span></span>}
        {preprocessor.preprocessorType === 'Dedup by obfuscation' && <span></span>}
        {preprocessor.preprocessorType === 'Skip first N rows' && <span>Number of rows: {preprocessor.skipRows}</span>}

        {preprocessor.preprocessorType === 'Skip last N rows' && <span>Number of rows: {preprocessor.skipRows}</span>}
        {preprocessor.preprocessorType === 'Skip after N rows' && <span>Row Number: {preprocessor.skipAfterRows}</span>}
        {preprocessor.preprocessorType === 'Skip after if equals to' && <span>Value: {preprocessor.skipAfterValue}</span>}
        {preprocessor.preprocessorType === 'Skip after if not equals to' && <span>Value: {preprocessor.skipAfterValue}</span>}
        {preprocessor.preprocessorType === 'Skip after if empty' && <span></span>}
        {preprocessor.preprocessorType === 'Skip row if empty' && <span></span>}
        {preprocessor.preprocessorType === 'Skip row if not empty' && <span></span>}
        {preprocessor.preprocessorType === 'Skip row if less than' && <span>Condition Value: {preprocessor.lessValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if less than or equals to' && <span>Condition Value: {preprocessor.lessValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if greater than' && <span>Condition Value: {preprocessor.greaterValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if greater than or equals to' && <span>Condition Value: {preprocessor.greaterValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if equals to' && <span>Condition Value: {preprocessor.equalsValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if not equals to' && <span>Condition Value: {preprocessor.equalsValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if in list' && <span>List: {preprocessor.listValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if not in list' && <span>List: {preprocessor.listValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if starts with' && <span>Condition Value: {preprocessor.startEndValue}</span>}
        {preprocessor.preprocessorType === 'Skip row if ends with' && <span>Condition Value: {preprocessor.startEndValue}</span>}
        {preprocessor.preprocessorType === 'Skip row(s) if aggregate equals to' && 
          <span>Aggregate On: {preprocessor.aggregateOnKey}<br/>Condition Value: {preprocessor.equalsValue}</span>}
        {preprocessor.preprocessorType === 'Skip row(s) if aggregate not equals to' && <span>Number of rows: {preprocessor.skipRows}</span>}
        {preprocessor.preprocessorType === 'Date Range Fix' && 
          <span>From Date: {preprocessor.fromDate}<br/>To Date: {preprocessor.fromDate}</span>}
        {preprocessor.preprocessorType === 'Empty Value' && <span></span>}
        {preprocessor.preprocessorType === 'Uppercase' && <span></span>}
        {preprocessor.preprocessorType === 'Lowercase' && <span></span>}
        {preprocessor.preprocessorType === 'Number round up' && <span>Precision: {preprocessor.precision}</span>}
        {preprocessor.preprocessorType === 'Number round down' && <span>Precision: {preprocessor.precision}</span>}
      </div>      
    )
  }

  constructPreprocessor(preprocessor, index) {
    return (
      <div {...Styles.headerRowContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: 10}}>{!index ? 'Preprocessors:' : ''}</div>
        <div style={{...Styles.headerRightRow, paddingLeft: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <StageIndicator style={{fontSize: 11}} height={18} width={18} phase={index+1} notooltip={true} />
          <div>
            <div>{preprocessor.preprocessorType}</div>
            {this.constructPreprocessorDetail(preprocessor)}
          </div>
        </div>
      </div>
    );
  }

  constructLookup(lookup, index) {
    return (
      <div {...Styles.headerRowContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: 10}}>{lookup.lookupName}</div>
        <div style={{...Styles.headerRightRow}}>
          <div style={{fontStyle: 'italic', paddingTop: 10}}>Source: </div>
          <div>{lookup.reuseSource ? 'INTERNAL' : 'EXTERNAL'}</div>
          <div style={{fontStyle: 'italic', paddingTop: 10}}>File: </div>
          <div>{lookup.reuseSource ? lookup.localLookupFile : lookup.externalLookupFile}</div>
          <div style={{fontStyle: 'italic', paddingTop: 10}}>Sheets: </div>
          <div>{lookup.reuseSource ? lookup.localLookupSheets.join(', ') : lookup.externalLookupSheets.join(', ')}</div>
        </div>
      </div>
    );
  }      

  constructValidationRules(validation) {
    var dateFields = Object.values(validation).filter((val) => {
      return val.type === 'Date';
    })
    var numberFields = Object.values(validation).filter((val) => {
      return val.type === 'Number';
    })

    var requiredFields = Object.values(validation).filter((val) => {
      return val.required && val.required === true;
    })

    var uniqueFields = Object.values(validation).filter((val) => {
      return val.unique && val.unique === true;
    })

    if (!(dateFields.length + numberFields.length + requiredFields.length + uniqueFields.length))
      return <div>None</div>;

    return (
      <div>
        {dateFields.length > 0 && 
        <div style={{...Styles.headerRightRow, paddingTop: 10}}>
          <div style={{fontStyle: 'italic'}}>Date Attributes:</div>
          <div>{dateFields.map((field) => {return field.name}).join(', ')}</div>
        </div>}
        {numberFields.length > 0 && 
        <div style={{...Styles.headerRightRow, paddingTop: 10}}>
          <div style={{fontStyle: 'italic'}}>Number Attributes: </div>
          <div>{numberFields.map((field) => {return field.name}).join(', ')}</div>
        </div>}
        {requiredFields.length > 0 && 
        <div style={{...Styles.headerRightRow, paddingTop: 10}}>
          <div style={{fontStyle: 'italic'}}>Required Attributes: </div>
          <div>{requiredFields.map((field) => {return field.name}).join(', ')}</div>
        </div>}
        {uniqueFields.length > 0 && 
        <div style={{...Styles.headerRightRow, paddingTop: 10}}>
          <div style={{fontStyle: 'italic'}}>Unique Attributes: </div>
          <div>{uniqueFields.map((field) => {return field.name}).join(', ')}</div>
        </div>}
      </div>
    )
  }

  drawMap(map) {
    return (
      <div key={'mapInfo'}>
        {this.drawRow('Map Info')}
        {this.drawChildRow('Name', map.name)}
        {this.drawChildRow('ID', map.id)}
        {this.drawChildRow('Status', map.status)}
        {this.drawChildRow('Reuse Source', map.reuseSource ? 'TRUE' : 'FALSE')}
        {this.drawChildRow('Merge Files', map.mergeFiles ? 'TRUE' : 'FALSE')}
      </div>
    )
  }

  drawRow(left, right = '', leftIndent = 0, rightIndent = 0) {
    return (
      <div {...Styles.subHeaderContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: leftIndent ? leftIndent*10 : 0}}>{left}</div>
        <div style={{...Styles.headerRightRow, paddingLeft: rightIndent ? rightIndent*10 : 0}}>{right}</div>
      </div>
    );
  }

  drawChildRow(left, right = '', leftIndent = 0, rightIndent = 0) {
    return (
      <div {...Styles.headerRowContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: leftIndent ? leftIndent*10 : 0}}>{left}</div>
        <div style={{...Styles.headerRightRow, paddingLeft: rightIndent ? rightIndent*10 : 0}}>{right}</div>
      </div>
    );
  }

  drawGridChildRow(left, right = '', leftIndent = 0, rightIndent = 0) {
    return (
      <div {...Styles.headerGridRowContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: leftIndent ? leftIndent*10 : 0}}>{left}</div>
        <div style={{...Styles.headerRightRow, paddingLeft: rightIndent ? rightIndent*10 : 0}}>{right}</div>
      </div>
    );
  }

  drawMappedElementRow(elements, leftIndent = 0, rightIndent = 0) {
    var left = elements[0];
    var right = '';
    var rightElement = elements[1];
    if (rightElement.mapMode === 'Simple')
      right = this.constructSimpleMap(rightElement.simple.conditions[0]);
    else if (rightElement.mapMode === 'Conditional')
      right = this.constructConditionalMap(rightElement.conditional);
    else if (rightElement.mapMode === 'Switch')
      right = this.constructSwitchMap(rightElement.switch.conditions);
    else if (rightElement.mapMode === 'Computed')
      right = this.constructComputedMap(rightElement.computed.conditions);
    else if (rightElement.mapMode === 'Aggregated')
      right = this.constructAggregatedMap(rightElement.aggregated.conditions);
    else if (rightElement.mapMode === 'Custom')
      right = this.constructCustomMap();

    return (
      <div {...Styles.headerGridChildRowContainer}  >
        <div style={{...Styles.headerLeftRow, paddingLeft: leftIndent ? leftIndent*10 : 0}}>{left}</div>
        <div style={{...Styles.headerRightRow, paddingLeft: rightIndent ? rightIndent*10 : 0}}>{right}</div>
      </div>
    );
  }

  constructMapConfig(targetSheet, map) {
    var mappingIgnored = (map.targetIgnoreMap && map.targetIgnoreMap.indexOf(targetSheet) >= 0) || 
                            (map.mapIgnoreConfig && map.mapIgnoreConfig.indexOf(targetSheet) >= 0);
    if (mappingIgnored)
      return this.drawChildRow('Map Ignored', mappingIgnored ? 'TRUE' : 'FALSE', 1);

    var config = map.mapConfig[targetSheet]._config;

    return (
      <div>
        {this.drawChildRow('Map Ignored', mappingIgnored ? 'TRUE' : 'FALSE', 1)}
        {this.drawChildRow('Data Consideration', config.distinctRows ? 'Distinct rows' :
                                                    config.distinctCompositeRows ? 'Distinct composite rows' : 
                                                      'All rows', 1)}
        {this.drawChildRow('Source Sheet', config.sourceSheet, 1)}
        {this.drawChildRow('Source Column(s)', config.distinctCompositeRows ? config.sourceColumns.join(', ') : config.sourceColumn, 1)}
        {this.drawChildRow('Copy attributes', map.mapCopyConfig && map.mapCopyConfig.indexOf(targetSheet) >= 0 ? 
                              'TRUE' : 'FALSE', 1)}
        {this.drawChildRow('Copy attributes by name', map.mapCopyByNameConfig && map.mapCopyByNameConfig.indexOf(targetSheet) >= 0 ? 
                              'TRUE' : 'FALSE', 1)}
      </div>      
    )
  }


  constructMappedAttrubutes(targetSheet, map) {
    var mappingIgnored = (map.targetIgnoreMap && map.targetIgnoreMap.indexOf(targetSheet) >= 0) || 
                            (map.mapIgnoreConfig && map.mapIgnoreConfig.indexOf(targetSheet) >= 0);
    var config = map.mapConfig && map.mapConfig[targetSheet] ? map.mapConfig[targetSheet] : undefined;
    if (mappingIgnored || !config)
      return '';

    return (
      <div>
        {Object.entries(config).map((element) => {
          if (element[0] === '_config')
            return '';
          return this.drawMappedElementRow(element, 1);
        })}
      </div>      
    )
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
              <StageIndicator condition={true} title={'Post Processing'} jumpto={_this.props.jumpto} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator condition={true} title={'Summary'} phase={PHASES.DCSUMMARY}/>
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
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <h2 style={{flex: 1, fontWeight: 800}}>Mapper Configuration:</h2>
                {_this.props._state.map && _this.props._state.map.id &&
                  _this.drawMap(_this.props._state.map)}
                {_this.props._state.map && _this.props._state.map.id &&
                  _this.drawRow('Source File', _this.props._state.map.sourceFile)}
                {_this.props._state.map && _this.props._state.map.id &&
                  _this.drawRow('Source Sheets', '')}

                {/* SOURCE */}
                {_this.props._state.map && _this.props._state.map.sourceMap &&
                  Object.keys(_this.props._state.map.sourceMap).map((sourceSheet) => {
                    return (
                    <div key={'src-'+sourceSheet}>
                      {_this.drawGridChildRow(sourceSheet)}
                      {_this.drawChildRow('Header Row', 
                              _this.props._state.map.sourceHeaderRow && _this.props._state.map.sourceHeaderRow[sourceSheet] &&
                              _this.props._state.map.sourceHeaderRow[sourceSheet] !== "undefined" ? 
                              _this.props._state.map.sourceHeaderRow[sourceSheet] : 1,
                            1, 0)}
                      {_this.drawChildRow('Sheet Ignored', 
                              _this.props._state.map.sourceIgnoreMap && 
                              _this.props._state.map.sourceIgnoreMap.indexOf(sourceSheet) >= 0 ? 'TRUE' : 'FALSE',
                            1, 0)}
                      {_this.drawChildRow('Sheet Merged', 
                              _this.props._state.map.mergeConfig && 
                              _this.props._state.map.mergeConfig[sourceSheet] ? 
                                  'YES, merges into ' + _this.props._state.map.mergeConfig[sourceSheet] : 'No',
                            1, 0)}
                      {_this.drawChildRow('Validation Rules', 
                              _this.props._state.map.sourceMapValidation && 
                              _this.props._state.map.sourceMapValidation[sourceSheet] ? 
                                this.constructValidationRules(_this.props._state.map.sourceMapValidation[sourceSheet]) : 'None',
                            1, 0)}

                      {_this.props._state.map.sourcePreprocessor && _this.props._state.map.sourcePreprocessor[sourceSheet] &&
                        (_this.props._state.map.sourceIgnoreMap && _this.props._state.map.sourceIgnoreMap.indexOf(sourceSheet) < 0) &&
                        _this.props._state.map.sourcePreprocessor[sourceSheet].map((preprocessor, index) => {
                          return _this.constructPreprocessor(preprocessor, index)
                      })}
                    </div>)
                })}

                {/* NAMED LOOKUPS */}
                {_this.props._state.map && _this.props._state.map.namedlookups &&
                  _this.drawRow('Named Lookups', '')}
                
                {_this.props._state.map && _this.props._state.map.namedlookups &&
                  _this.props._state.map.namedlookupsList && _this.props._state.map.namedlookupsList.length > 0 &&
                  _this.props._state.map.namedlookupsList.map((lookup, index) => {
                    return _this.constructLookup(lookup, index)
                  })
                }

                {/* TARGET */}
                {_this.props._state.map && _this.props._state.map.id &&
                  _this.drawRow('Target File', _this.props._state.map.targetFile)}
                {_this.props._state.map && _this.props._state.map.id &&
                  _this.drawRow('Target Sheets', '')}
                
                {/* TARGET */}
                {_this.props._state.map && _this.props._state.map.targetMap &&
                  Object.keys(_this.props._state.map.targetMap).map((targetSheet) => {
                    return (
                    <div key={'tgt-'+targetSheet}>
                      {_this.drawGridChildRow(targetSheet)}
                      {_this.drawChildRow('Sheet Ignored', 
                              _this.props._state.map.targetIgnoreMap && 
                              _this.props._state.map.targetIgnoreMap.indexOf(targetSheet) >= 0 ? 'TRUE' : 'FALSE',
                            1, 0)}
                      {_this.drawChildRow('Validation Rules', 
                              _this.props._state.map.targetMapValidation && 
                              _this.props._state.map.targetMapValidation[targetSheet] ? 
                                this.constructValidationRules(_this.props._state.map.targetMapValidation[targetSheet]) : 'None',
                            1, 0)}

                    </div>)
                })}

                {/* DATA TRANSFORMATION */}
                <div {...Styles.headerContainer}  >
                  <div style={{...Styles.headerLeftRow}}>Mapped Sheets</div>
                  <div style={{...Styles.headerRightRow}}></div>
                </div>
                {/* MAPPED */}
                {_this.props._state.map && _this.props._state.map.targetMap &&
                  Object.keys(_this.props._state.map.targetMap).map((targetSheet) => {
                    return (
                    <div key={'map-'+targetSheet}>
                      {_this.drawGridChildRow(targetSheet)}
                      {_this.constructMapConfig(targetSheet, _this.props._state.map)}
                      {_this.constructMappedAttrubutes(targetSheet, _this.props._state.map)}
                    </div>)
                })}                
              </div>
            </div>
          </div>}
        </div>
      </MuiThemeProvider>
    );    
  }

  constructSimpleMap(condition) {
    if (condition.leftSimpleMode === 'Lookup Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div style={{flex: 0.25}}>Simple Map</div>
          <div style={{flex: 0.75}}><span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
            <br/>{condition.leftSimpleValue.lookupSheet}[{condition.leftSimpleValue.lookupName}]</div>
        </div>
      );
    else if (condition.leftSimpleMode === 'Static Value') 
      return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div style={{flex: 0.25}}>Simple Map</div>
          <div style={{flex: 0.75}}><span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
            <br/>{condition.leftSimpleValue.staticValue}</div>
        </div>
      );
    else if (condition.leftSimpleMode === 'vLookup Name') 
      return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div style={{flex: 0.25}}>Simple Map</div>
          <div style={{flex: 0.75}}>
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
        </div>
      );        
              
    return <div/>;
  }

  constructConditionalMap(conditional) {
    var conditions = conditional.conditions;
    var result = [];
    var trueCondition = <div/>;
    var falseCondition = <div/>;

    // true condition
    if (conditional.trueCondition.mode === 'Static Value') 
      trueCondition = (
        <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span><i>Static</i></span>
          <br/>{conditional.trueCondition.result.staticValue}
        </div>
      );
    else if (conditional.trueCondition.mode === 'Lookup Value')
      trueCondition = (
        <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span><i>Lookup</i></span>
          <br/>{conditional.trueCondition.result.lookupSheet}[{conditional.trueCondition.result.lookupName}]
        </div>
      );
    else if (conditional.trueCondition.mode === 'vLookup Name')
      trueCondition = (
        <div style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {conditional.trueCondition.result.lookupSheet}[{conditional.trueCondition.result.lookupName}]<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {conditional.trueCondition.result.lookedupName}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {conditional.trueCondition.result.lookedupSheetName ? conditional.trueCondition.result.lookedupSheetName : 1}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
          {(conditional.trueCondition.result.lookedupKey ? conditional.trueCondition.result.lookedupKey : 'ERROR') + ' [' +
            (conditional.trueCondition.result.lookedupKeyName ? conditional.trueCondition.result.lookedupKeyName : 'ERROR') + ']'
          }<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
          {(conditional.trueCondition.result.lookedupValue ? conditional.trueCondition.result.lookedupValue : 'ERROR') + ' [' +
            (conditional.trueCondition.result.lookedupValueName ? conditional.trueCondition.result.lookedupValueName : 'ERROR') + ']'
          }<br/> 
        </div>
      );
    else 
      trueCondition = (
        <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{conditional.trueCondition.mode}</i></span>
      );


    
    // false condition
    if (conditional.falseCondition.mode === 'Static Value') 
      falseCondition = (
        <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span><i>Static</i></span>
          <br/>{conditional.falseCondition.result.staticValue}
        </div>
      );
    else if (conditional.falseCondition.mode === 'Lookup Value')
      falseCondition = (
        <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span><i>Lookup</i></span>
          <br/>{conditional.falseCondition.result.lookupSheet}[{conditional.falseCondition.result.lookupName}]
        </div>
      );
    else if (conditional.falseCondition.mode === 'vLookup Name')
      falseCondition = (
        <div style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {conditional.falseCondition.result.lookupSheet}[{conditional.falseCondition.result.lookupName}]<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {conditional.falseCondition.result.lookedupName}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {conditional.falseCondition.result.lookedupSheetName ? conditional.falseCondition.result.lookedupSheetName : 1}<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
          {(conditional.falseCondition.result.lookedupKey ? conditional.falseCondition.result.lookedupKey : 'ERROR') + ' [' +
            (conditional.falseCondition.result.lookedupKeyName ? conditional.falseCondition.result.lookedupKeyName : 'ERROR') + ']'
          }<br/>
          <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
          {(conditional.falseCondition.result.lookedupValue ? conditional.falseCondition.result.lookedupValue : 'ERROR') + ' [' +
            (conditional.falseCondition.result.lookedupValueName ? conditional.falseCondition.result.lookedupValueName : 'ERROR') + ']'
          }<br/> 
        </div>
      );
    else
      falseCondition = <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{conditional.falseCondition.mode}</i></span>
                
    
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div style={{flex: 0.25}}>Conditional Map</div>
        <div style={{flex: 0.75, display: 'flex', flexDirection: 'column'}}>
          {conditions.map((condition) => {
            result = [];
            // left condition mode
            if (condition.leftConditionMode === 'Lookup Value') 
              result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span><br/>
                  {condition.leftConditionValue.lookupSheet}[{condition.leftConditionValue.lookupName}]
                </div>
              );
            else if (condition.leftConditionMode === 'vLookup Name') 
              result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
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
              );
            else  result.push (<div/>);   

            // condition
            if (condition.conditionType === 'Substring')
                result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>From: {condition.stringPosition}, Length: {condition.stringLength}</span>
                    <br/>
                  </div>
                );        
            else if (condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
                condition.conditionType === 'Contains')
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>{condition.subString}</span>
                    <br/>
                  </div>
                );        
            else result.push ( <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span>) ;

            // right condition
            if (!(condition.conditionType === 'Is Empty' || condition.conditionType === 'Is Not Empty' ||
                  condition.conditionType === 'Starts With' || condition.conditionType === 'Ends With' || 
                  condition.conditionType === 'Contains')) {
              if (condition.rightConditionMode === 'Static Value') 
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
                    <br/>{condition.rightConditionValue.staticValue}
                  </div>
                );
              else if (condition.rightConditionMode === 'Lookup Value') 
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
                    <br/>{condition.rightConditionValue.lookupSheet}[{condition.rightConditionValue.lookupName}]
                  </div>
                );
            } else result.push (<div/>);    
            
            return (
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                <div style={{flex: 0.4}}>{result[0]}</div>
                <div style={{flex: 0.2}}>{result[1]}</div>
                <div style={{flex: 0.4}}>{result[2]}</div>
              </div>
            )        
          })}

          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
            <div style={{flex: 0.4}}>{'TRUE'}</div>
            <div style={{flex: 0.6}}>{trueCondition}</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
            <div style={{flex: 0.4}}>{'FALSE'}</div>
            <div style={{flex: 0.6}}>{falseCondition}</div>
          </div>
        </div>
      </div>
    );
  }

  constructComputedMap(conditions) {
    var result = [];
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div style={{flex: 0.25}}>Computed Map</div>
        <div style={{flex: 0.75, display: 'flex', flexDirection: 'column'}}>
          {result = []}
          {conditions.map((condition) => {
            result = [];
            // left condition
            if (condition.leftComputedMode === 'Lookup Value') 
              result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
                  <br/>{condition.leftComputedValue.lookupSheet}[{condition.leftComputedValue.lookupName}]
                </div>
              );
            else if (condition.leftComputedMode === 'vLookup Name') 
              result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.leftComputedValue.lookupSheet}[{condition.leftComputedValue.lookupName}]<br/>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftComputedValue.lookedupName}<br/>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.leftComputedValue.lookedupSheetName ? condition.leftComputedValue.lookedupSheetName : 1}<br/>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
                  {(condition.leftComputedValue.lookedupKey ? condition.leftComputedValue.lookedupKey : 'ERROR') + ' [' +
                    (condition.leftComputedValue.lookedupKeyName ? condition.leftComputedValue.lookedupKeyName : 'ERROR') + ']'
                  }<br/>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
                  {(condition.leftComputedValue.lookedupValue ? condition.leftComputedValue.lookedupValue : 'ERROR') + ' [' +
                    (condition.leftComputedValue.lookedupValueName ? condition.leftComputedValue.lookedupValueName : 'ERROR') + ']'
                  }<br/> 
                </div>
              );            
            else if (condition.leftComputedMode === 'Static Value') 
              result.push (
                <div>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
                  <br/>{condition.leftComputedValue.staticValue}
                </div>
              );
                      
            else result.push(<div/>);

            // operation
            if (condition.conditionType === 'Concatenate' && condition.computedJoiner && condition.computedJoiner.length > 0)
              result.push (
                <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Joiner: {condition.computedJoiner}</span>
                  <br/>
                </div>
              );
            else if (condition.conditionType === 'Substring')
              result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>From: {condition.stringPosition}, Length: {condition.stringLength}</span>
                    <br/>
                  </div>
                );
            else result.push(<span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588', borderBottom: '1px dashed #607d8b36'}}><i>{condition.conditionType}</i></span>);

            // right condition
            if (!(condition.conditionType === '' || 
                  condition.conditionType === 'Uppercase' || condition.conditionType === 'Lowercase' || 
                  condition.conditionType === 'Substring' || condition.conditionType === 'Convert To String' ||
                  condition.conditionType === 'Convert To Number' || condition.conditionType === 'MD5 Token')) {
              if (condition.rightComputedMode === 'Static Value') 
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
                    <br/>{condition.rightComputedValue.staticValue}
                  </div>
                );
              else if (condition.rightComputedMode === 'vLookup Name') 
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {condition.rightComputedValue.lookupSheet}[{condition.rightComputedValue.lookupName}]<br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.rightComputedValue.lookedupName}<br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {condition.rightComputedValue.lookedupSheetName ? condition.rightComputedValue.lookedupSheetName : 1}<br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
                    {(condition.rightComputedValue.lookedupKey ? condition.rightComputedValue.lookedupKey : 'ERROR') + ' [' +
                      (condition.rightComputedValue.lookedupKeyName ? condition.rightComputedValue.lookedupKeyName : 'ERROR') + ']'
                    }<br/>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
                    {(condition.rightComputedValue.lookedupValue ? condition.rightComputedValue.lookedupValue : 'ERROR') + ' [' +
                      (condition.rightComputedValue.lookedupValueName ? condition.rightComputedValue.lookedupValueName : 'ERROR') + ']'
                    }<br/> 
                  </div>
                );            
              else if (condition.rightComputedMode === 'Lookup Value') 
                result.push (
                  <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                    <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
                    <br/>{condition.rightComputedValue.lookupSheet}[{condition.rightComputedValue.lookupName}]
                  </div>
                );
            } else result.push(<div/>);
                         
            return (
              <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                <div style={{flex: 0.4}}>{result[0]}</div>
                <div style={{flex: 0.2}}>{result[1]}</div>
                <div style={{flex: 0.4}}>{result[2]}</div>
              </div>
            )
          })}
        </div>                
      </div>
    );
  }

  constructSwitchMap(conditions) {
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div style={{flex: 0.25}}>Switch Map</div>
        <div style={{flex: 0.75}}>
        {conditions.map((condition) => {
          if (condition.leftConditionMode === 'Lookup Value') 
              return (
                <div style={{borderBottom: '1px dashed #607d8b36'}}>
                  <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span><br/>
                  {condition.leftConditionValue.lookupSheet}[{condition.leftConditionValue.lookupName}]<br/>
                </div>
              );
          else if (condition.leftConditionMode === 'vLookup Name') 
            return (
              <div style={{borderBottom: '1px dashed #607d8b36'}}>
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
            );        
          
          return <div/>;
        })}
        </div>
      </div>
    );
  }

  constructAggregatedMap(conditions) {
    var result = [];
    return (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        <div style={{flex: 0.25}}>Aggregated Map</div>
        <div style={{flex: 0.75, display: 'flex', flexDirection: 'column'}}>
        {conditions.map((condition) => {
          result = []
          if (condition.leftAggregatedMode === 'Lookup Value') 
            result.push (
              <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup</i></span>
                <br/>{condition.leftAggregatedValue.lookupSheet}[{condition.leftAggregatedValue.lookupName}]
              </div>
            );
          else if (condition.leftAggregatedMode === 'Static Value') 
            result.push (
              <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Static</i></span>
                <br/>{condition.leftAggregatedValue.staticValue}
              </div>
            );
          else if (condition.leftAggregatedMode === 'vLookup Name') 
            result.push (
              <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}  ><i>Lookup:</i></span> {condition.leftAggregatedValue.lookupSheet}[{condition.leftAggregatedValue.lookupName}]<br/>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {condition.leftAggregatedValue.lookedupName}<br/>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Sheet Name:</i></span> {condition.leftAggregatedValue.lookedupSheetName ? condition.leftAggregatedValue.lookedupSheetName : 1}<br/>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Key:</i></span> {condition.leftAggregatedValue.lookedupKey ? condition.leftAggregatedValue.lookedupKey : 1}<br/>
                <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup Value:</i></span> {condition.leftAggregatedValue.lookedupValue ? condition.leftAggregatedValue.lookedupValue : 1}            
              </div>
            );  
          else result.push (<div/>);

          if (condition.conditionType === 'Concatenate')
            result.push (
            <div style={{alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
              <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span><br/>
              <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>Joiner: {condition.computedJoiner}</span>
              <br/>
            </div>
            );
          else result.push (<span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{condition.conditionType}</i></span>);     
          
          return (
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottom: '1px dashed #607d8b36'}}>
              <div style={{flex: 0.4}}>{result[0]}</div>
              <div style={{flex: 0.2}}>{result[1]}</div>
            </div>
          )        
        })}
        </div>
      </div>
    );
  }

  constructCustomMap() {
      return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
          <div style={{flex: 0.25}}>Custom Map</div>
          <div style={{flex: 0.75}}>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Custom</i></span>
          </div>
        </div>
      );
  }
}
