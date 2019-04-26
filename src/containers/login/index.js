import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Login from './login';
import { updateUser } from '../../reducers/actions';

export default compose(
  connect(null, { updateUser }),
  withRouter
)(Login);
