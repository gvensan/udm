import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4'; 
import FlexTable from '../../../../components/flexTable';
import SwitchCondition from './switchCondition';
import SwitchDefaultCondition from './switchDefaultCondition';
import SwitchRow from './switchRow';
import SwitchDefaultRow from './switchDefaultRow';
import CustomCondition from '../custom/customCondition';
import CustomRow from '../custom/customRow';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

export default class SwitchView extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }
  
  state = {
    newOrEditCondition: false,
    defaultCondition: false, 
    editDefaultCondition: false, 
    editCondition: -1,
    deleteCondition: -1,
    final: false
  }

  setFinally = (e) => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: true});
  }
  
  setNewCondition = (e) => {
    this.setState({newOrEditCondition: true, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  setDefaultCondition = (e) => {
    this.setState({newOrEditCondition: false, defaultCondition: true, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  editCondition = (index) => {
    this.setState({newOrEditCondition: true, defaultCondition: false, editDefaultCondition: false, editCondition: index, deleteCondition: -1, final: false});
  }

  editDefaultCondition = () => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: true, editCondition: -1, deleteCondition: -1, final: false});
  }

  editFinalCondition = (index) => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: true});
  }

  cancelCondition = () => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }
  
  cancelDefaultCondition = () => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }
  
  cancelFinalCondition = () => {
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  deleteCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapConfig[sheet][fields[mapkey]].switch.conditions.splice(index, 1);

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  deleteDefaultCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    delete newMap.mapConfig[sheet][fields[mapkey]].switch.defaultCondition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: true, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  deleteFinalCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    delete newMap.mapConfig[sheet][fields[mapkey]].switch.final;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }  
  
  updateDefaultCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].switch.defaultCondition = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  updateCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index < 0)
      newMap.mapConfig[sheet][fields[mapkey]].switch.conditions.push(condition);
    else
      newMap.mapConfig[sheet][fields[mapkey]].switch.conditions[index] = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  updateFinalCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].switch.final = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, defaultCondition: false, editDefaultCondition: false, editCondition: -1, deleteCondition: -1, final: false});
  }

  render() {    
    const { sourceSheet, sheet, mapkey, fields } = this.props;
    const conditions = this.props._state.map.mapConfig[sheet][fields[mapkey]].switch.conditions;
    const final = this.props._state.map.mapConfig[sheet][fields[mapkey]].switch.final;
    var newSwitch = !this.state.defaultCondition && (this.state.newOrEditCondition || !(conditions && conditions.length));
    var defaultCondition = this.props._state.map.mapConfig[sheet][fields[mapkey]].switch.defaultCondition;

    return (
      <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Switch Mapping: 
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}} >
            <div onClick={e => this.setFinally(e)}>
              <label {...Styles.importButtonStyle}  >FINALLY </label>
            </div>
            {!defaultCondition && 
            <div onClick={e => this.setDefaultCondition(e)}>
              <label {...Styles.importButtonStyle}  >DEFAULT </label>
            </div>}
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
                { name: 'LHS', width: 0.267, style: Styles.headerColumnContainer },
                { name: 'Operator', width: 0.1, style: Styles.headerColumnContainer },
                { name: 'RHS', width: 0.267, style: Styles.headerColumnContainer },
                { name: 'RESULT', width: 0.267, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={SwitchRow}
              rowProps={{
                editCondition: this.editCondition,
                deleteCondition: this.deleteCondition,
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
        {defaultCondition &&
        <div style={{display: 'flex', flexDirection: 'row'}} >
          <div style={{flex: 1, width: '100%'}}>
          <FlexTable
              showSelectAll={false}
              data={[defaultCondition]}
              columns={[
                { name: 'DEFAULT', width: 0.9, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={SwitchDefaultRow}
              rowProps={{
                editCondition: this.editDefaultCondition,
                deleteCondition: this.deleteDefaultCondition,
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

        {(this.state.defaultCondition || this.state.editDefaultCondition) &&
          <SwitchDefaultCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            namedlookups={this.props._state.map.namedlookups ? this.props._state.map.namedlookupsList : []}
            fields={fields} 
            condition={this.props._state.map.mapConfig[sheet][fields[mapkey]].switch.defaultCondition ?
                      this.props._state.map.mapConfig[sheet][fields[mapkey]].switch.defaultCondition : undefined}
            cancel={this.cancelDefaultCondition}
            submit={this.updateDefaultCondition}
          />
        }

        {newSwitch &&
          <SwitchCondition 
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
