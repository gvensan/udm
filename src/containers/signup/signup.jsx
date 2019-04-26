import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Constants from '../../constants';

import { root } from '../../assets/variable.js';
import * as styles from './styles';

export default class Signup extends React.Component {
  static propTypes = {
    signup: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    name: '',
    nameError: undefined,
    loginEmail: '',
    emailError: undefined,
    password1: '',
    password1Error: undefined,
    password2: '',
    password2Error: undefined,
    signupError: undefined
  }

  componentWillMount() {
    sessionStorage.removeItem('user');
    this.props.updateUser({});
  }

  onSignup = (e) => {
    e.preventDefault();

    if (this.state.name === '') {
      this.setState({nameError: 'Specify a valid name'});
      return;
    }

    if (this.state.loginEmail === '') {
      this.setState({emailError: 'Specify a valid email id'});
      return;
    }

    if (this.state.password1 === '') {
      this.setState({password1Error: 'Specify a password'});
      return;
    }

    if (this.state.password2 === '') {
      this.setState({password2Error: 'Reenter password for confirmation'});
      return;
    }

    if (this.state.password1 !== this.state.password2) {
      this.setState({password2Error: 'Password confirmation mismatch, try again'});
      return;
    }

    var _this = this;
    const { history } = this.props;
    axios.post('/api/access/signup', { name: this.state.name, email: this.state.loginEmail, password: this.state.password1 }) 
      .then(function(result) {
        if (result.data.success) {
          _this.setState({
            signupError: ''
          });
          history.push('/login');              
        } else {
          _this.setState({
            signupError: result.data.message
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
          <label htmlFor="name" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Name</label>          
          <input id="name" {...styles.inputStyle} type="text" value={this.state.name} onChange={(event) => this.setState({ name: event.target.value, nameError: '' })} />
          {this.state.nameError &&
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.nameError}</div>}
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="name" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Email</label>          
          <input id="name" {...styles.inputStyle} type="text" value={this.state.loginEmail} onChange={(event) => this.setState({ loginEmail: event.target.value, emailError: '' })} />
          {this.state.emailError &&
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.emailError}</div>}
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="password1" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Password</label>          
          <input {...styles.inputStyle} type="password" value={this.state.password1} onChange={(event) => this.setState({ password1: event.target.value, password1Error: '' })} />
          {this.state.password1Error &&
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.password1Error}</div>}
        </div>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <label htmlFor="password2" style={{marginLeft: 10, pointerEvents: 'none', userSlect: 'none', }}>Repeat password</label> 
          <input {...styles.inputStyle} type="password" value={this.state.password2} onChange={(event) => this.setState({ password2: event.target.value, password2Error: '' })} />
          {this.state.password2Error && 
            <div style={{ marginBottom: 10, marginLeft: 10, color: 'white' }}>{this.state.password2Error}</div>}
        </div>
        <div>Already have an account? <a href={'/login'}>Login</a>.</div>     
        {this.state.signupError && 
          <div style={{ margin: 10, color: 'white' }}>{this.state.signupError}</div>}
        <div style={{ marginTop: '20px'}} onClick={e => this.onSignup(e)}>
          <label {...styles.importButtonStyle}  >
            SIGNUP
          </label>
        </div>
      </div>
    );
  }
}
