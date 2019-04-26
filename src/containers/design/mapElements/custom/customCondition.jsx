import React from 'react';
import uuidv4 from 'uuid/v4'; 
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';
import * as Styles from './styles';

export default class SimpleCondition extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  }

  state = {
    condition: this.initCondition(this.props.condition),
    codeError: undefined,
    map: this.props._state.map
  }

  initCondition(cond) {
    if (cond) {
      return ({
        code: cond.code,
      });
    }

    return ({
      code: '',
    })
  }

  cancel = (e) => {
    e.preventDefault();
    this.setState({condition: this.initCondition(this.props.condition)});
    this.props.cancel();    
  }

  submit = (e) => {
    e.preventDefault();
    var condition = this.state.condition ? this.state.condition : {};

    
    if (!(this.refs.codeField.getValue() && this.refs.codeField.getValue().length > 0)) {
      this.setState({codeError: 'Enter code snippet'});
      return;
    } else {
      condition.code = this.refs.codeField.getValue();  
      this.setState({codeError: undefined});      
    }

    this.props.submit(condition, this.props.index);    
  }

  render() {
    const condition = this.state.condition ? this.state.condition : undefined;
                  
    return (
      <div key={uuidv4()} style={{display: 'flex', flexDirection: 'column'}}> 
        <div {...Styles.conditionContainer} >
          <div key={uuidv4()}  style={{display: 'flex', flexDirection: 'column', width: '100%'}}> 
            <div style={{display: 'flex', flexDirection: 'row'}} >
              <div style={{flex: 1, width: '100%'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', width: '100%' }}>Custom Code (Advanced Usage):</div>
                <div style={{ height: 270, overflow: 'auto', width: '100%' }}>
                  <TextField
                    data-sheet={this.props.sheet} data-key={this.props.mapkey} data-val={this.props.value}                     
                    hintText="Code Snippet"
                    errorText={this.state.codeError ? this.state.codeError : 
                      "Please ensure that you follow conventions to produce a valid custom processing code"}
                    errorStyle={{color: this.state.codeError ? 'red' : 'unset'}}
                    defaultValue={condition && condition.code ? condition.code : ''}
                    floatingLabelText="Code Snippet"
                    multiLine={true}
                    rows={8}
                    onKeyDown={ (e) => {
                      if (e.key === 'Tab') {
                        e.preventDefault();
                        var newCaretPosition;
                        newCaretPosition = e.currentTarget.selectionStart + "    ".length;
                        e.currentTarget.value = e.currentTarget.value.substring(0, e.currentTarget.selectionStart) + "    " + e.currentTarget.value.substring(e.currentTarget.selectionStart, e.currentTarget.value.length);
                        e.currentTarget.selectionStart = newCaretPosition;
                        e.currentTarget.selectionEnd = newCaretPosition;
                        e.currentTarget.focus();
                        return false;
                      }
                    }}
                    style={{width: '100%'}} 
                    ref="codeField"
                  />
                </div>
              </div>  
            </div>
          </div>  
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 60, margin: 10 }}>
          <div onClick={e => this.cancel(e)}>
            <label {...Styles.importButtonStyle}  >CANCEL </label>
          </div>
          <div onClick={e => this.submit(e)}>
            <label {...Styles.importButtonStyle}  >SUBMIT </label>
          </div>
        </div>                         
      </div>    
    )
  }
}
