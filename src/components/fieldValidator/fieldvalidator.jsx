import React from 'react';
import SelectField from 'material-ui/SelectField';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';

import { root } from '../../assets/variable';
import PropTypes from 'prop-types';

const key = require('../../assets/svg/ic_key.svg');

export default class FieldValidator extends React.Component {
  static propTypes = {
    sheet: PropTypes.string.isRequired,
    fieldKey: PropTypes.string.isRequired,
    fieldName: PropTypes.string.isRequired,
    fieldType: PropTypes.string.isRequired,
    unique: PropTypes.bool,
    required: PropTypes.bool,
    onFieldTypeChange: PropTypes.func.isRequired,
    onFieldRequired: PropTypes.func.isRequired,
    onFieldUnique: PropTypes.func.isRequired,
    onFieldIdentifier: PropTypes.func.isRequired
  }
  
  render() {
    const { onFieldTypeChange, onFieldRequired, onFieldIdentifier, onFieldUnique, disabled } = this.props;
    // const { onFieldTypeChange, disabled } = this.props;
    
    return (
      <div key={this.props.sheet + '-' + this.props.fieldKey} 
            style={{display: 'flex', flexDirection: 'row', margin: 10, padding: 10, alignItems: 'center',
                  boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
        <div style={{ fontSize: '18px', fontWeight: 700, flex: 0.6 }}>{this.props.fieldName}</div>
        <div style={{display: 'flex', flex: this.props.showUniqueRequired ? 0.6 : 1, justifyContent: 'center'}}>
          <SelectField 
            floatingLabelText="Type"
            data-sheet={this.props.sheet} data-key={this.props.fieldKey} data-value={this.props.fieldName}             
            value={this.props.fieldType}
            onChange={onFieldTypeChange.bind(this, this.props.sheet, this.props.fieldKey, this.props.fieldName)}
            disabled={disabled}
          >
            <MenuItem value={"String"} primaryText="String"  />
            <MenuItem value={"Date"} primaryText="Date"  />
            <MenuItem value={"Number"} primaryText="Number"  />
          </SelectField>
        </div>
        {this.props.showUniqueRequired && onFieldIdentifier &&
        <div style={{display: 'flex', flex: 0.15, flexDirection: 'row', alignItems: 'center'}}>
          <img src={key} style={{ width: '15px', paddingRight: 8 }} alt={'key'} />
          <Checkbox data-sheet={this.props.sheet} data-key={this.props.fieldKey} data-value={this.props.fieldName} 
            iconStyle={{fill: root.switchStyleFillColor}}
            label="Key"
            switched={true}
            checked={this.props.identifier }
            onCheck={onFieldIdentifier}
          />      
        </div>}        
        {this.props.showUniqueRequired && 
        <div style={{display: 'flex', flex: 0.15, justifyContent: 'center'}}>
          <Checkbox data-sheet={this.props.sheet} data-key={this.props.fieldKey} data-value={this.props.fieldName} 
            iconStyle={{fill: root.switchStyleFillColor}}
            label="Required"
            switched={true}
            checked={this.props.required }
            onCheck={onFieldRequired}
          />      
        </div>}
        {this.props.showUniqueRequired && 
        <div style={{display: 'flex', flex: 0.15, justifyContent: 'center'}}>
          <Checkbox data-sheet={this.props.sheet} data-key={this.props.fieldKey} data-value={this.props.fieldName} 
            iconStyle={{fill: root.switchStyleFillColor}}
            label="Unique"
            switched={true}
            checked={this.props.unique }
            onCheck={onFieldUnique}
          />  
        </div>}      
      </div>
    );
  }
}
