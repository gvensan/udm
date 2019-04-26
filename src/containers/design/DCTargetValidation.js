import React from 'react';
import uuidv4 from 'uuid/v4'; 
import {Tabs, Tab} from 'material-ui/Tabs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ReactTooltip from 'react-tooltip'
import Checkbox from 'material-ui/Checkbox';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FieldValidator from '../../components/fieldValidator';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const _ = require('lodash');
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

const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}
export default class DCTargetValidation extends React.Component {
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

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', flexDirection: 'row' }}>
              <StageIndicator condition={true} title={'Mapper'} jumpto={this.props.jumpto} phase={PHASES.DCMAPPER}/>
              <StageIndicator condition={true} title={'Source Validation'} jumpto={this.props.jumpto} phase={PHASES.DCSOURCEVALIDATION}/>
              <StageIndicator condition={true} title={'Target Validation'} phase={PHASES.DCTARGETVALIDATION}/>
              <StageIndicator condition={true} title={'Map & Transform'} jumpto={this.props.jumpto} phase={PHASES.DCMAPANDTRANSFORM}/>
              <StageIndicator condition={true} title={'Post Processing'} jumpto={this.props.jumpto} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator condition={true} title={'Summary'} jumpto={this.props.jumpto} phase={PHASES.DCSUMMARY}/>
            </div>     

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div onClick={e => this.props.prev(e)}>
                  <label {...Styles.importButtonStyle}  >PREV </label>
                </div>
                <div onClick={e => this.props.validate(e, 2)}>
                  <label {...Styles.importButtonStyle}  >VALIDATE </label>
                </div>
                <div onClick={e => this.props.save(e, 2)}>
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
                    <div>Congratulations, target validation rules are valid</div><br/>
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
            initialSelectedIndex= {sessionStorage.getItem('tabIndex') !== undefined ? _.toNumber(sessionStorage.getItem('tabIndex')) : 0}>
            {this.renderTargetSheets()}
          </Tabs>   
        </div>
      </MuiThemeProvider>
    );
  }

  onActive = (e) => {
    sessionStorage.setItem('tabIndex', e.props.index)
  }

  renderTargetSheets() {
    var targetSheets = Object.keys(this.props._state.map.targetMap);
    var tabs = [];
    var uuidkey = undefined;
    var shortName = undefined;
    targetSheets.map((name) => {
      uuidkey = uuidv4();
      shortName = name.length > 7 && targetSheets.length > 5 ? name.substring(0, 7) + '...' : name;
      tabs.push(
        <Tab key={name} label={shortName} data-tip data-for={uuidkey} onActive={this.onActive}>
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
                  checked={this.props._state.map.targetIgnoreMap && this.props._state.map.targetIgnoreMap.indexOf(name) >= 0}
                  onCheck={this.ignoreTargetSheet}
                />
              </div>
            </div>
            <br/>
            <div>
              <div>
                {!(this.props._state.map.targetIgnoreMap && this.props._state.map.targetIgnoreMap.indexOf(name) >= 0) &&
                  this.renderTargetFields(name, this.props._state.map.targetMap[name], this.props._state.map.reuseSource)}
              </div>
            </div>
          </div>
        </Tab>        
      );

      return name;
    });

    return tabs;
  }
 
  renderTargetFields = (sheet, fields, reuseSource) => {
    var list = [];
    Object.keys(fields).map((key) => {
      list.push(
        <FieldValidator
          key={uuidv4()}
          sheet={sheet}
          fieldKey={key}
          fieldName={fields[key]}
          fieldType={this.props._state.map.targetMapValidation && this.props._state.map.targetMapValidation[sheet] &&
                      this.props._state.map.targetMapValidation[sheet][key] && this.props._state.map.targetMapValidation[sheet][key].type ? 
                      this.props._state.map.targetMapValidation[sheet][key].type : 'String'}
          identifier={this.props._state.map.targetMapValidation && this.props._state.map.targetMapValidation[sheet] &&
                    this.props._state.map.targetMapValidation[sheet][key] ? 
                    this.props._state.map.targetMapValidation[sheet][key].identifier : false }
          unique={this.props._state.map.targetMapValidation && this.props._state.map.targetMapValidation[sheet] &&
                    this.props._state.map.targetMapValidation[sheet][key] ? 
                    this.props._state.map.targetMapValidation[sheet][key].unique : false }
          required={this.props._state.map.targetMapValidation && this.props._state.map.targetMapValidation[sheet] && 
                    this.props._state.map.targetMapValidation[sheet][key] ? 
                    this.props._state.map.targetMapValidation[sheet][key].required : false}
          disabled={reuseSource}
          onFieldTypeChange={this.updateTargetType.bind(this)}
          onFieldIdentifier={this.updateTargetIdentifier.bind(this)}
          onFieldRequired={this.updateTargetRequired.bind(this)}
          onFieldUnique={this.updateTargetUnique.bind(this)}
          showUniqueRequired={true}
        />
      );

      return key;
    });

    return list;
  }  

  updateTargetType = (sheet, key, val, e, index, value) => {
    var newMap = this.props._state.map;
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
    const _ = require('lodash');
    newMap.targetMapValidation[sheet] = _(newMap.targetMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }  

  updateTargetIdentifier = (e, checked) => {
    var key = e.target.dataset.key;
    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;

    newMap.targetMapValidation = newMap.targetMapValidation ? newMap.targetMapValidation : {};
    newMap.targetMapValidation[sheet] = newMap.targetMapValidation[sheet] ? newMap.targetMapValidation[sheet] : {};
    if (newMap.targetMapValidation && newMap.targetMapValidation[sheet]) {
      Object.keys(newMap.targetMapValidation[sheet]).map((key) => {
        newMap.targetMapValidation[sheet][key] = newMap.targetMapValidation[sheet][key] ? newMap.targetMapValidation[sheet][key] : {};
        newMap.targetMapValidation[sheet][key].identifier = false;
        return key;
      })
      newMap.targetMapValidation[sheet][key] = newMap.targetMapValidation[sheet][key] ? newMap.targetMapValidation[sheet][key] : {};
      newMap.targetMapValidation[sheet][key].identifier = checked;
    }

    const _ = require('lodash');
    newMap.targetMapValidation[sheet] = _(newMap.targetMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }

  updateTargetRequired = (e, checked) => {
    var key = e.target.dataset.key;
    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;
    if (newMap.targetMapValidation && newMap.targetMapValidation[sheet] && newMap.targetMapValidation[sheet][key] && 
        newMap.targetMapValidation[sheet][key].required) {
      newMap.targetMapValidation[sheet][key].required = !newMap.targetMapValidation[sheet][key].required;
    } else {
      newMap.targetMapValidation = newMap.targetMapValidation ? newMap.targetMapValidation : {};
      newMap.targetMapValidation[sheet] = newMap.targetMapValidation[sheet] ? newMap.targetMapValidation[sheet] : {};
      newMap.targetMapValidation[sheet][key] = newMap.targetMapValidation[sheet][key] ? newMap.targetMapValidation[sheet][key] : {};
      newMap.targetMapValidation[sheet][key].required = checked;
    }

    const _ = require('lodash');
    newMap.targetMapValidation[sheet] = _(newMap.targetMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }

  updateTargetUnique = (e, checked) => {
    var key = e.target.dataset.key;
    var sheet = e.target.dataset.sheet;
    var newMap = this.props._state.map;
    if (newMap.targetMapValidation && newMap.targetMapValidation[sheet] && newMap.targetMapValidation[sheet][key] && 
        newMap.targetMapValidation[sheet][key].unique) {
      newMap.targetMapValidation[sheet][key].unique = !newMap.targetMapValidation[sheet][key].unique;
    } else {
      newMap.targetMapValidation = newMap.targetMapValidation ? newMap.targetMapValidation : {};
      newMap.targetMapValidation[sheet] = newMap.targetMapValidation[sheet] ? newMap.targetMapValidation[sheet] : {};
      newMap.targetMapValidation[sheet][key] = newMap.targetMapValidation[sheet][key] ? newMap.targetMapValidation[sheet][key] : {};
      newMap.targetMapValidation[sheet][key].unique = checked;
    }
    const _ = require('lodash');
    newMap.targetMapValidation[sheet] = _(newMap.targetMapValidation[sheet]).toPairs().sortBy(0).fromPairs().value();

    this.props.updateState({map: newMap});
  }  

  ignoreTargetSheet = (e, checked) => {
    e.preventDefault();
    var sheet = e.target.dataset.sheet;
    var map = this.props._state.map;
    if (!map.targetIgnoreMap)
      map.targetIgnoreMap = [];

    if (checked && map.targetIgnoreMap.indexOf(sheet) < 0)
      map.targetIgnoreMap.push(sheet);
    else if (!checked && map.targetIgnoreMap.indexOf(sheet) >= 0)
      map.targetIgnoreMap.splice(map.targetIgnoreMap.indexOf(sheet), 1);

    this.props.updateState({map: map});
  }
  
}