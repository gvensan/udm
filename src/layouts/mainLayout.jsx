import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import _ from 'lodash';
import { matchPath } from 'react-router';
import PropTypes from 'prop-types';
import * as styles from './styles';
import SideNav from '../components/sideNav';
import Header from '../containers/header';
import DesignContainer from '../containers/design';
import UploadContainer from '../containers/upload';
import MapsContainer from '../containers/maps';
import JobsContainer from '../containers/jobs';
import UsersContainer from '../containers/users';
import HelpContainer from '../containers/help';

class MainLayout extends React.Component {
  static propTypes = {
    history: PropTypes.shape({
      goBack: PropTypes.func
    }).isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      goBack: props.history.goBack,
    };
  }

  componentWillReceiveProps = ({ location }) => {
    const isMatch = matchPath(location.pathname, {
      path: [],
      exact: true
    });
    this.setState({ showBackButton: _.get(isMatch, 'isExact', false) });
  }

  refresh = () => {
    this.forceUpdate();
  }

  render() {
    var showMenu = sessionStorage.getItem('showMenu');
    showMenu = showMenu !== undefined ? showMenu === "true" : false;

    return (
      <div {...styles.rootContainer}>
        {showMenu && <div {...styles.sidebarContainer}>
          <SideNav />
        </div>}
        <div {...styles.contentContainer}>
          <div {...styles.topBarContainer}>
            <Header showBackButton={this.state.showBackButton} goBack={this.state.goBack} refresh={this.refresh}/>
          </div>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', padding: '15px' }}>
            <Route exact={true} path="/" render={() => <DesignContainer />} />
            <Route exact={true} path="/design" render={() => <DesignContainer />} />
            <Route exact={true} path="/design/:id" render={() => <DesignContainer />} />
            <Route exact={true} path="/repository" render={() => <MapsContainer />} />
            <Route exact={true} path="/repository/:tab" render={() => <MapsContainer />} />
            <Route exact={true} path="/job" render={() => <UploadContainer />} />
            <Route exact={true} path="/job/:id" render={() => <UploadContainer />} />
            <Route exact={true} path="/jobs" render={() => <JobsContainer />} />
            <Route exact={true} path="/users" render={() => <UsersContainer />} />
            <Route exact={true} path="/help" render={() => <HelpContainer />} />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  connect(
    state => ({
      user: state.app.company.user
    }),
    null),
)(MainLayout);
