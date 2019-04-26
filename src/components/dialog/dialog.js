import React, { Component } from 'react';
import uuidv4 from 'uuid/v4'; 
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox/Checkbox';

import { root } from '../../assets/variable';

export default class DialogModal extends Component {
  state = {
    open: false,
    checked: {}
  };

  componentWillMount() {
    if (this.props.open !== undefined)
      this.setState({ open: this.props.open });
  }

  handleOpen = () => {
    this.setState({open: true});
  };

  handleCancel = () => {
    this.handleClose('CANCEL');
  }

  handleOk = () => {
    this.handleClose('Ok');
  }

  handleYes = () => {
    this.handleClose('YES');
  }

  handleNo = () => {
    this.handleClose('NO');
  }

  handleSubmit = () => {
    this.handleClose('SUBMIT');
  }

  handleCheckbox = (e, checked) => {
    e.preventDefault();
    var _checked = this.state.checked;
    _checked[e.currentTarget.dataset.name] = checked;
    this.setState({checked: _checked});
  }

  handleClose = (action) => {
    this.setState({open: false});
    if (this.props.handleAction)
      this.props.handleAction(action, this.state.checked, this.props.args);
  };

  render() {
    const actions = [];
    if (this.props.needCancel) {
      actions.push(<FlatButton
        label="Cancel"
        secondary={true}
        onClick={this.handleCancel}
      />);
    }

    if (this.props.needSubmit) {
      actions.push(<FlatButton
        label="Submit"
        secondary={true}
        onClick={this.handleSubmit}
      />)
    }
    
    if (this.props.needOk) {
      actions.push(<FlatButton
        label="OK"
        secondary={true}
        onClick={this.handleOk}
      />)
    }

    if (this.props.needYes) {
      actions.push(<FlatButton
        label="YES"
        primary={false}
        onClick={this.handleYes}
      />)
    }

    if (this.props.needNo) {
      actions.push(<FlatButton
        label="NO"
        secondary={true}
        onClick={this.handleNo}
      />)
    }

    return (
      <div>
        {this.props.buttonLabel && 
          <RaisedButton label={this.props.buttonLabel} onClick={this.handleOpen} />}
        <Dialog
          title={this.props.title}
          actions={actions}
          modal={true}
          open={this.state.open}
          contentStyle={{width: '60%', maxWidth: 'none'}}
        >
          {this.props.content}
          {this.props.needCheckboxes &&
            <div style={{paddingTop: 20}}>
              {this.props.needCheckboxes.map((checkName) => {
                return (<Checkbox
                  key={uuidv4()}
                  iconStyle={{fill: root.switchStyleFillColor}}
                  label="Delete Chained Maps"
                  labelStyle={{fontWeight: 900}}
                  data-name={checkName}
                  checked={this.state.checked && this.state.checked[checkName]}
                  onCheck={this.handleCheckbox}
                />)  
              })}
            </div>
          }

        </Dialog>
      </div>
    );
  }
}
