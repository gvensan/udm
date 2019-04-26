import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Signup from './signup';
import { updateUser } from '../../reducers/actions';

export default compose(
  connect(null, { updateUser }),
  withRouter
)(Signup);
