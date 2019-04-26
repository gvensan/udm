import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import MainLayout from './layouts/mainLayout';
import Login from './containers/login';
import Signup from './containers/signup';
import Activate from './containers/activate';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    sessionStorage.user ? (
      <Component {...props} />
    ) :
      (
        <Redirect to={{
          pathname: '/login',
          state: { from: props.location }
        }}
        />
      )
  )}
  />
);

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.shape({})
};

PrivateRoute.defaultProps = {
  location: {}
};

export default (
  <Switch>
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route path="/activate" component={Activate} />
    <PrivateRoute path="/" component={MainLayout} />
  </Switch>
);
