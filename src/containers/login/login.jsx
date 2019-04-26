import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Constants from '../../constants';

import { root } from '../../assets/variable.js';
import * as styles from './styles';

export default class Login extends React.Component {
  static propTypes = {
    login: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    loginEmail: '',
    emailError: undefined,
    password: '',
    passwordError: undefined,
    error: ''
  }

  componentWillMount() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('name');
    sessionStorage.removeItem('email');
    this.props.updateUser({});
  }

  onLogin = (e) => {
    e.preventDefault();

    if (this.state.loginEmail === '') {
      this.setState({emailError: 'Specify a valid email id'});
      return;
    }

    if (this.state.password === '') {
      this.setState({passwordError: 'Specify a password'});
      return;
    }

    var _this = this;
    const { history } = this.props;
    axios.post('/api/access/login', { email: this.state.loginEmail, password: this.state.password }) 
      .then(function(result) {
        if (result.data.success) {
          _this.setState({
            loginError: undefined
          });
          sessionStorage.setItem('showMenu', true);
          sessionStorage.setItem('user', result.data.token);
          _this.props.updateUser({name: result.data.name, email: result.data.email, 
                                  user: result.data.token, admin: result.data.admin});
          history.push('/design');              
        } else {
          _this.setState({
            loginError: result.data.message
          });          
        }
      })    
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', 
                    flexDirection: 'column', background: root.topbarContainerBackground }}>
        <div style={{ marginTop: '20px', marginBottom: '50px', fontSize: '22px', color: 'black', fontWeight: 800  }}>
          <img src={Constants.imagePaths.udmLogo} alt="logo" style={{ height: 32, marginBottom: -5, paddingRight: 5 }} />
          <span>Universal Data Mapper</span>
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="name" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Email</label>          
          <input id="name" {...styles.inputStyle} type="text" value={this.state.loginEmail} onChange={(event) => this.setState({ loginEmail: event.target.value, emailError: '' })} />
          {this.state.emailError &&
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.emailError}</div>}
        </div>

        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="password" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Password</label>          
          <input id="password" {...styles.inputStyle} type="password" value={this.state.password} onChange={(event) => this.setState({ password: event.target.value, passwordError: '' })} />
          {this.state.passwordError &&
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.passwordError}</div>}
        </div>

        <div>Don't have an account? <a href={'/signup'}>Create one</a>.</div>
        {this.state.loginError && 
          <div style={{ margin: 10, color: '#00235f' }}>{this.state.loginError}</div>}
        <div style={{ marginTop: '20px'}} onClick={e => this.onLogin(e)}>
          <label {...styles.importButtonStyle}  >
            LOGIN
          </label>
        </div>
      </div>
    );
  }
}
