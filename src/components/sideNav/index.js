import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import SideNav from './sideNav';

export default compose(
  withRouter
)(SideNav);
