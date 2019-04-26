import React from 'react';
// import _ from 'lodash';
import axios from 'axios';
import PropTypes from 'prop-types';

export default class Activate extends React.Component {
  static propTypes = {
    activate: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    activationError: undefined,
  }

  componentDidMount() {
    sessionStorage.removeItem('user');
    this.props.updateUser({});
    axios.get('/api/access/activate' + this.props.location.search)
      .then((result) => {
        if (result.data.success)
          window.location = '/login';
        else 
          this.setState({activationError: true, message: result.data.message})
      }).catch((error) => {
        this.setState({activationError: true, message: error.toString()})
      });  
  }

  render() {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#21BEFC' }}>
        <div style={{ marginTop: '20px', marginBottom: '50px', fontSize: '22px', color: 'black', fontWeight: 800  }}>
          <div>Activating...</div>
        </div>
        {this.state.activationError === false &&
          <div>Oops, Activation failed!</div>
        }
      </div>
    );
  }
}
