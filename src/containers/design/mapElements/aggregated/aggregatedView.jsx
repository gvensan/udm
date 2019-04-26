import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4'; 
import FlexTable from '../../../../components/flexTable';
import AggregatedCondition from './aggregatedCondition';
import AggregatedRow from './aggregatedRow';
import SkipCondition from '../skip/skipCondition';
import SkipConditionRow from '../skip/skipConditionRow';
import CustomCondition from '../custom/customCondition';
import CustomRow from '../custom/customRow';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

export default class AggregatedView extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }
  
  state = {
    newOrEditCondition: 
      (this.props && this.props.sheet && this.props._state && this.props._state.map && 
          this.props._state.map.mapConfig && this.props._state.map.mapConfig[this.props.sheet]) &&
      (!this.props._state.map.mapConfig[this.props.sheet][this.props.fields[this.props.mapkey]].aggregated.conditions || 
        !this.props._state.map.mapConfig[this.props.sheet][this.props.fields[this.props.mapkey]].aggregated.conditions.length) ?
        true : false,
    editCondition: -1,
    deleteCondition: -1,
    newOrEditSkipCondition: false,
    editSkipCondition: -1,
    deleteSkipCondition: -1,
    final: false,
    skip: false 
  }

  setFinally = (e) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1,
                    final: true, skip: false});
  }
  
  editFinalCondition = (index) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1,
                    final: true, skip: false});
  }

  updateFinalCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].aggregated.final = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1,
                    final: false, skip: false});
  }

  deleteFinalCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    delete newMap.mapConfig[sheet][fields[mapkey]].aggregated.final;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }  

  cancelFinalCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }  
  
  setNewCondition = (e) => {
    this.setState({newOrEditCondition: true, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }
  
  editConnector = (index, connector) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].aggregated.conditions[index].connector = connector;
    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
  }
  
  editCondition = (index) => {
    this.setState({newOrEditCondition: true, editCondition: index, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }

  cancelCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }
  
  deleteCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.conditions.splice(index, 1);

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }

  updateCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index < 0)
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.conditions.push(condition);
    else
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.conditions[index] = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1,
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }

  setNewSkipCondition = (e) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: true, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: true});
  }
  
  editSkipConnector = (index, connector) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions[index].connector = connector;
    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
  }
  
  editSkipCondition = (index) => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: true, editSkipCondition: index, deleteSkipCondition: -1, 
                    final: false, skip: true});
  }

  cancelSkipCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }
  
  deleteSkipCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions.splice(index, 1);

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }

  updateSkipCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (!newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions)
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions = [];
    if (index < 0)
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions.push(condition);
    else
      newMap.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions[index] = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1, 
                    newOrEditSkipCondition: false, editSkipCondition: -1, deleteSkipCondition: -1, 
                    final: false, skip: false});
  }
  

  render() {    
    const { sourceSheet, sheet, mapkey, fields } = this.props;
    const conditions = this.props._state.map.mapConfig[sheet][fields[mapkey]].aggregated.conditions;
    const skipConditions = this.props._state.map.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions;
    const final = this.props._state.map.mapConfig[sheet][fields[mapkey]].aggregated.final;
    const skip = this.state.skip || (this.props._state.map.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions &&
                    this.props._state.map.mapConfig[sheet][fields[mapkey]].aggregated.skipConditions.length > 0);

    return (
      <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Aggregated Mapping: 
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}} >
            <div onClick={e => this.setNewSkipCondition(e)}>
              <label {...Styles.importButtonStyle}  >SKIP CONDITIONS </label>
            </div>
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
                { name: 'LHS', width: 0.45, style: Styles.headerColumnContainer },
                { name: 'Operator', width: 0.45, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={AggregatedRow}
              rowProps={{
                editAggregated: this.editCondition,
                editConnector: this.editConnector,
                deleteAggregated: this.deleteCondition
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
          <AggregatedCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            fields={fields} 
            namedlookups={this.props._state.map.namedlookups ? this.props._state.map.namedlookupsList : []}
            index={this.state.editCondition} 
            condition={this.state.editCondition >= 0 ? conditions[this.state.editCondition] : undefined}
            cancel={this.cancelCondition}
            submit={this.updateCondition}
          />
        }    

        {skip &&
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Skip Conditions: 
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}} >
            <div onClick={e => this.setNewSkipCondition(e)}>
              <label {...Styles.importButtonStyle}  >ADD </label>
            </div>
          </div>       
        </div>}

        {skip &&
        <div style={{display: 'flex', flexDirection: 'row'}} >
          <div style={{flex: 1, width: '100%'}}>
            <FlexTable
              showSelectAll={false}
              data={skipConditions}
              columns={[
                { name: 'LHS', width: 0.45, style: Styles.headerColumnContainer },
                { name: 'Operator', width: 0.45, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={SkipConditionRow}
              rowProps={{
                editCondition: this.editSkipCondition,
                editConnector: this.editSkipConnector,
                deleteCondition: this.deleteSkipCondition
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

        {this.state.newOrEditSkipCondition && 
          <SkipCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            fields={fields} 
            index={this.state.editSkipCondition} 
            condition={this.state.editSkipCondition >= 0 ? skipConditions[this.state.editSkipCondition] : undefined}
            cancel={this.cancelSkipCondition}
            submit={this.updateSkipCondition}
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
