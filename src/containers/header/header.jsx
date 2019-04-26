import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ReactTooltip from 'react-tooltip'
import PropTypes from 'prop-types';
import backButton from '../../assets/svg/ic_chevron_left.svg';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import { updateUser } from '../../reducers/actions';


import * as styles from './styles';

const menu = require('../../assets/svg/ic_menu.svg');
const userpic = require('../../assets/svg/ic_user.svg');
const help = require('../../assets/svg/ic_help.png');
const { makeRequest } = require("../../utils/requestUtils");

class Header extends React.Component {
  static propTypes = {
    goBack: PropTypes.func.isRequired,
    showBackButton: PropTypes.bool
  }

  static defaultProps = {
    showBackButton: false
  }

  state = {
    openMenu: false
  }

  componentDidMount() {
    var _this = this;
    if (!this.props.user) {
      makeRequest('get', '/api/access/getuser?user=' + sessionStorage.getItem('user'))
        .then((result) => {
          if (result.data.success)
            _this.props.dispatch(updateUser(result.data.user));
        })              
    }
  }

  getUser() {
    return (
      <div style={{fontSize: 12, fontWeight: 600}}>
        {this.props.user ? this.props.user.name : ''}<br/>
        <div style={{marginTop: -15}}>
          {this.props.user ? this.props.user.email : ''}
        </div>
      </div>
    )
  }

  openHelp = (e) => {
    window.location = '/help';
  }

  handleChange = (e, key, value) => {
    if (value === 2)
      window.location = '/login';
  }

  showHideMenu = (e) => {
    var showMenu = sessionStorage.getItem('showMenu');
    showMenu = showMenu !== undefined ? showMenu === "true" : false;
    sessionStorage.setItem('showMenu', !showMenu);
    this.props.refresh();
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', 
                      justifyContent: 'space-between', paddingRight: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {
              this.props.showBackButton
                ? <div {...styles.backContainer} onClick={this.props.goBack}>
                  <img src={backButton} alt={'Go Back'} />
                </div>
                : null
            }
            <img src={menu} style={{ width: 22, cursor: 'pointer', marginLeft: 20, marginRight: 5 }} 
                alt={'Show/Hide'}onClick={this.showHideMenu}/>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Universal Data Mapper</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center' }}>
            <img src={userpic} style={{ width: 22, cursor: 'pointer' }} alt={'profile'} />
            <DropDownMenu underlineStyle={{display: 'none'}} style={{height: 'unset', marginLeft: -20}} value={1} onChange={this.handleChange}>
              <MenuItem value={1} disabled={true} primaryText={this.getUser()} />
              <Divider/>
              <MenuItem value={2} primaryText="Sign Out" />
            </DropDownMenu>
            <ReactTooltip id={'help'} place="right" type="dark" effect="float">
              <span>Help</span>
            </ReactTooltip>            
            <img src={help} data-tip data-for={'help'}
              style={{ width: 22, cursor: 'pointer', paddingRight: 5 }} alt={'help'} onClick={this.openHelp}/>
          </div>
        </div>
      </MuiThemeProvider>         
    );
  }
}

export default compose(
  connect(
    state => ({
      user: state.app.company.user
    }),
    null),
)(Header);
