import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import NavItem from '../navItem';
import Constants from '../../constants';

class SideNav extends React.Component {
  static propTypes = {
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired
    }).isRequired
  }

  render() {
    const { pathname } = this.props.location;
    const { push } = this.props.history;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', top: 0, left: 0, position: 'sticky' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 7, paddingBottom: 7, marginBottom: 20 }}>
          <img src={Constants.imagePaths.udmLogo} alt="logo" style={{ height: 36 }} />
        </div>
        <NavItem push={push} currentPath={pathname} urlPath={'/design'} path={'design'} label={'Design'} />
        <NavItem push={push} currentPath={pathname} urlPath={'/repository'} path={'repo'} label={'Maps'} />
        <NavItem push={push} currentPath={pathname} urlPath={'/job'} path={'upload'} label={'Upload'} />
        <NavItem push={push} currentPath={pathname} urlPath={'/jobs'} path={'jobs'} label={'Jobs'} />
        {this.props.user && Object.keys(this.props.user).length && 
          (this.props.user.admin || this.props.user.email.endsWith('giri@numberz.in')) &&
          <NavItem push={push} currentPath={pathname} urlPath={'/users'} path={'users'} 
                  noMargin={false} label={<span>Mapper<br/>Users</span>} />}
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
)(SideNav);
