import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4'; 
import FlexTable from '../../../../components/flexTable';
import SkipCondition from './skipCondition';
import SkipConditionRow from './skipConditionRow';

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

export default class SkipConditionView extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    updateState: PropTypes.func.isRequired
  }
  
  state = {
    newOrEditCondition: false,
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
  
  render() {    
    const { sourceSheet, sheet, mapkey, fields, skip} = this.props;
    const conditions = skip ? skip.conditions : [];

    return (
      <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
        <div {...Styles.headingContainer} style={{fontSize: '14px', fontWeight: 'bold', 
                  backgroundColor: root.conditionViewContainerBackground, justifyContent: 'space-between'}}  >
          <div>
            Skip Conditions: 
          </div>
          <div>
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
              rowComponent={SkipConditionRow}
              rowProps={{
                editCondition: this.editCondition,
                editConnector: this.props.editSkipConnector,
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
          <SkipCondition 
            _state={this.props._state} sheet={sheet} 
            sourceSheet={sourceSheet}
            mapkey={mapkey}
            fields={fields} 
            index={this.state.editCondition} 
            condition={this.state.editCondition >= 0 ? conditions[this.state.editCondition] : undefined}
            cancel={this.props.cancelSkipCondition}
            submit={this.props.updateSkipCondition}
          />
        }
      </div>  

    );
  }
}
