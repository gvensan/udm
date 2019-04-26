import { connect } from 'react-redux';
import Alert from './alert';
import { removeAlert } from './actions';

export default connect(
  state => ({
    alertItems: state.app.alert.alertItems
  }), {
    removeAlert
  }
)(Alert);
