import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4'; 
import FlexTable from '../../../../components/flexTable';
import CustomCondition from './customCondition';
import CustomRow from './customRow';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

export default class CustomView extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired,
  }
  
  state = {
    newOrEditCondition: true,
    editCondition: -1,
    deleteCondition: -1,
  }

  setNewCondition = (e) => {
    this.setState({newOrEditCondition: true, editCondition: -1, deleteCondition: -1});
  }

  editCondition = (index) => {
    this.setState({newOrEditCondition: true, editCondition: index, deleteCondition: -1});
  }

  cancelCondition = () => {
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1});
  }
  
  deleteCondition = (index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index >= 0)
      newMap.mapConfig[sheet][fields[mapkey]].custom.conditions.splice(index, 1);

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1});
  }

  updateCondition = (condition, index) => {
    const { sheet, mapkey, fields } = this.props;
    var newMap = this.props._state.map;
    if (index < 0)
      newMap.mapConfig[sheet][fields[mapkey]].custom.conditions.push(condition);
    else
      newMap.mapConfig[sheet][fields[mapkey]].custom.conditions[index] = condition;

    this.props.updateState({map: newMap, expandedSheet: sheet, expandedKey: mapkey});
    this.setState({newOrEditCondition: false, editCondition: -1, deleteCondition: -1});
  }

  render() {    
    const { sheet, mapkey, fields } = this.props;
    const conditions = this.props._state.map.mapConfig[sheet][fields[mapkey]].custom.conditions;

    return (
      <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Custom Mapping: 
          </div>
          {/* {(!conditions || conditions.length === 0) &&
          <div>
            <div onClick={e => this.setNewCondition(e)}>
              <label {...Styles.importButtonStyle}  >SET </label>
            </div>
          </div>}         */}
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}} >
          <div style={{flex: 1, width: '100%'}}>
            <FlexTable
              showSelectAll={false}
              data={conditions}
              columns={[
                { name: 'Code', width: 0.9, style: Styles.headerColumnContainer },
                { name: 'ACTION', width: 0.1, style: Styles.headerColumnContainer },
              ]}
              rowComponent={CustomRow}
              rowProps={{
                editCondition: this.editCondition,
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
          <CustomCondition 
            _state={this.props._state} sheet={sheet} 
            mapkey={mapkey}
            fields={fields} 
            index={this.state.editCondition} 
            condition={this.state.editCondition >= 0 ? conditions[this.state.editCondition] : undefined}
            cancel={this.cancelCondition}
            submit={this.updateCondition}
          />
        }
      </div>  
    );
  }
}
