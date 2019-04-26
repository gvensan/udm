import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4'; 
import FlexTable from '../../../../components/flexTable';
import Condition from './condition';
import ResultCondition from './resultCondition';
import ConditionRow from './conditionRow';
import CustomCondition from '../custom/customCondition';
import CustomRow from '../custom/customRow';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

export default class ConditionalView extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }
  
  state = {
    newOrEditCondition: 
      (this.props && this.props.sheet && this.props._state && this.props._state.map && 
          this.props._state.map.mapConfig && this.props._state.map.mapConfig[this.props.sheet]) &&
      (!this.props._state.map.mapConfig[this.props.sheet][this.props.fields[this.props.mapkey]].conditional.conditions || 
        !this.props._state.map.mapConfig[this.props.sheet][this.props.fields[this.props.mapkey]].conditional.conditions.length) ?
        true : false,
    trueCondition: false,
    falseCondition: false,
    editCondition: -1,
    deleteCondition: -1,
    final: false    
  }

  setFinally = (e) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: true});
  }
    
  setNewCondition = (e) => {
    this.setState({newOrEditCondition: true, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  setTrueCondition = (e) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: true, falseCondition: false, final: false});
  }
  
  setFalseCondition = (e) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: true, final: false});
  }
  
  editConnector = (index, connector) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].conditional.conditions[index].connector = connector;
    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
  }
  
  editCondition = (index) => {
    this.setState({newOrEditCondition: true, editCondition: index, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  editFinalCondition = (index) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: true});
  }

  cancelCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  cancelFinalCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  deleteCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapConfig[sheet][fields[mapkey]].conditional.conditions.splice(index, 1);

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  deleteFinalCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    delete newMap.mapConfig[sheet][fields[mapkey]].conditional.final;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }    

  updateCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index < 0)
      newMap.mapConfig[sheet][fields[mapkey]].conditional.conditions.push(condition);
    else
      newMap.mapConfig[sheet][fields[mapkey]].conditional.conditions[index] = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  updateResultCondition = (condition, mode) => {
    const { sheet, mapkey, fields } = this.props;

    var newMap = this.props._state.map;
    if (mode)
      newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition = condition;
    else
      newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    trueCondition: false, falseCondition: false, final: false});
  }

  updateFinalCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].conditional.final = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, trueCondition: false, falseCondition: false, final: false});
  }

  constructCondition(mode) {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;

    if (mode) {
      if (newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.mode === 'Static Value') 
        return (
          <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span><i>Static</i></span>
            <br/>{newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.staticValue}
          </div>
        );
      else if (newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.mode === 'Lookup Value')
        return (
          <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span><i>Lookup</i></span>
            <br/>{newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookupSheet}[{newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookupName}]
          </div>
        );
      else if (newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.mode === 'vLookup Name')
        return (
          <div style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookupSheet}[{newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupSheetName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
            {(newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupKey ? newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupKey : 'ERROR') + ' [' +
              (newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupKeyName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupKeyName : 'ERROR') + ']'
            }<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
            {(newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupValue ? newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupValue : 'ERROR') + ' [' +
              (newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupValueName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.result.lookedupValueName : 'ERROR') + ']'
            }<br/> 
          </div>
        );
      else
        return <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{newMap.mapConfig[sheet][fields[mapkey]].conditional.trueCondition.mode}</i></span>
    } else {
      if (newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.mode === 'Static Value') 
        return (
          <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span><i>Static</i></span>
            <br/>{newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.staticValue}
          </div>
        );
      else if (newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.mode === 'Lookup Value')
        return (
          <div style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span><i>Lookup</i></span>
            <br/>{newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookupSheet}[{newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookupName}]
          </div>
        );
      else if (newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.mode === 'vLookup Name')
        return (
          <div style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookup:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookupSheet}[{newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookupName}]<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Named Lookup:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupName}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Sheet:</i></span> {newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupSheetName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupSheetName : 1}<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Key:</i></span> 
            {(newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupKey ? newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupKey : 'ERROR') + ' [' +
              (newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupKeyName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupKeyName : 'ERROR') + ']'
            }<br/>
            <span style={{fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>Lookedup Value:</i></span> 
            {(newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupValue ? newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupValue : 'ERROR') + ' [' +
              (newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupValueName ? newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.result.lookedupValueName : 'ERROR') + ']'
            }<br/> 
          </div>
        );
      else
        return <span style={{fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#231588'}}><i>{newMap.mapConfig[sheet][fields[mapkey]].conditional.falseCondition.mode}</i></span>
    }
  }
  
  render() {    
    const { sourceSheet, sheet, mapkey, fields } = this.props;
    const conditions = this.props._state.map.mapConfig[sheet][fields[mapkey]].conditional.conditions;
    const trueCondition = this.props._state.map.mapConfig[sheet][fields[mapkey]].conditional.trueCondition;
    const falseCondition = this.props._state.map.mapConfig[sheet][fields[mapkey]].conditional.falseCondition;
    const final = this.props._state.map.mapConfig[sheet][fields[mapkey]].conditional.final;

    return (
      <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Conditional Mapping: 
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}} >
            <div onClick={e => this.setFinally(e)}>
              <label {...Styles.importButtonStyle}  >FINALLY </label>
            </div>
            <div onClick={e => this.setNewCondition(e)}>
              <label {...Styles.importButtonStyle}  >ADD </label>
            </div>
          </div>          
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}} >
          <div style={{flex: 1, width: '100%'}}>
            <FlexTable
              showSelectAll={false}
              data={conditions}
              columns={[
                { name: 'LHS', width: 0.3, style: Styles.headerColumnContainer },
                { name: 'Operator', width: 0.2, style: Styles.headerColumnContainer },
                { name: 'RHS', width: 0.3, style: Styles.headerColumnContainer },
                { name: 'CONDITION', width: 0.1, style: Styles.headerColumnContainer1 },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={ConditionRow}
              rowProps={{
                editCondition: this.editCondition,
                editConnector: this.editConnector,
                deleteCondition: this.deleteCondition
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
        {this.state.newOrEditCondition && 
          <Condition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            namedlookups={this.props._state.map.namedlookups ? this.props._state.map.namedlookupsList : []}
            fields={fields} 
            index={this.state.editCondition} 
            condition={this.state.editCondition >= 0 ? conditions[this.state.editCondition] : undefined}
            cancel={this.cancelCondition}
            submit={this.updateCondition}
          />
        }
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.trueHeaderBackground, justifyContent: 'space-between', 
                  paddingTop: 20, paddingBottom: 20}}  >
          <div style={{display: 'flex', flexDirection: 'row', flex: 0.7, justifyContent: 'center'}}>
            <div style={{display: 'flex', flex: 0.3, flexDirection: 'column', justifyContent: 'center'}}>TRUE:</div>
            <div style={{display: 'flex', flex: 0.7, flexDirection: 'column', justifyContent: 'center'}}>
              {this.constructCondition(true)}</div>
            </div>
          <div>
            <div onClick={e => this.setTrueCondition(e)}>
              <label {...Styles.importButtonStyle}  >EDIT </label>
            </div>
          </div>          
        </div>
        {this.state.trueCondition && 
          <ResultCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            namedlookups={this.props._state.map.namedlookups ? this.props._state.map.namedlookupsList : []}
            fields={fields} 
            mode={true}
            condition={trueCondition ? trueCondition : undefined}
            cancel={this.cancelCondition}
            submit={this.updateResultCondition}
          />
        }
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.falseHeaderBackground, justifyContent: 'space-between', 
                  paddingTop: 20, paddingBottom: 20}}  >
          <div style={{display: 'flex', flexDirection: 'row', flex: 0.7, justifyContent: 'center'}}>
            <div style={{display: 'flex', flex: 0.3, flexDirection: 'column', justifyContent: 'center'}}>FALSE:</div>
            <div style={{display: 'flex', flex: 0.7, flexDirection: 'column', justifyContent: 'center'}}>
              {this.constructCondition(false)}
            </div>
          </div>
          <div>
            <div onClick={e => this.setFalseCondition(e)}>
              <label {...Styles.importButtonStyle}  >EDIT </label>
            </div>
          </div>          
        </div>
        {this.state.falseCondition && 
          <ResultCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            namedlookups={this.props._state.map.namedlookups ? this.props._state.map.namedlookupsList : []}
            fields={fields} 
            mode={false} 
            condition={falseCondition ? falseCondition : undefined}
            cancel={this.cancelCondition}
            submit={this.updateResultCondition}
          />
        }
        {final &&
        <div style={{display: 'flex', flexDirection: 'row'}} >
          <div style={{flex: 1, width: '100%'}}>
            <FlexTable
              showSelectAll={false}
              data={[ final ]}
              columns={[
                { name: 'Finally Block', width: 0.9, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={CustomRow}
              rowProps={{
                editCondition: this.editFinalCondition,
                deleteCondition: this.deleteFinalCondition,
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
        </div>}        

        {this.state.final && 
          <CustomCondition 
            _state={this.props._state} sheet={sheet} 
            mapkey={mapkey}
            fields={fields} 
            index={-1} 
            condition={final}
            cancel={this.cancelFinalCondition}
            submit={this.updateFinalCondition}
          />
        }                
      </div>  

    );
  }
}
