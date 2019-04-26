import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Iframe from 'react-iframe'

const { makeRequest } = require("../../utils/requestUtils");

export default class helpContainer extends React.Component {
  state = {
    error: ''
  }

  cancel = (e) => {
    e.preventDefault();
    window.location.reload();
  }

  submit = (e) => {
    e.preventDefault();
    if (!(this.refs.question.getValue() && this.refs.question.getValue().length > 0)) {
      this.setState({error: 'Do you have a question 🤔'})
      return;
    }

    makeRequest('post', '/api/access/question', { question: this.refs.question.getValue()});
    window.location.reload();
  }


  render() {    
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: 20, height: '100%',
                        overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>Help </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%',
                      background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <Iframe url="/api/access/help"  style={{height: '100%'}} position="unset" />
          </div>
        </div>          
      </MuiThemeProvider>
    );
  }
}
