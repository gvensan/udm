import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ReactTooltip from 'react-tooltip'

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const info = require('../../../../assets/svg/ic_info.png');
const del = require('../../../../assets/svg/ic_delete.svg');
const warn = require('../../../../assets/svg/ic_warning.svg');
const user = require('../../../../assets/svg/ic_user.png');
const admin = require('../../../../assets/svg/ic_admin.png');
const noadmin = require('../../../../assets/svg/ic_nonadmin.png');

const { makeRequest } = require("../../../../utils/requestUtils");

class DisplayInfo extends React.Component {
  render() {
    return (
      <div style={{display: 'flex',flexDirection: 'row', flex: 1, padding: 5}}>
        <div style={{flex: 0.4, fontSize: '13px', alignItems: 'left', fontWeight: 'bold'}}>{this.props.title}:</div>
        <div style={{flex: 0.6, fontSize: '13px', textAlign: 'left'}}>{this.props.value}</div>
      </div>
    )
  }
}

class UserRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewDetails: false
    }
  }

  infoUser = (e) => {
    e.preventDefault();
    this.setState({viewDetails: !this.state.viewDetails});
  }
  
  toggleAdmin = (e) => {
    var id = e.currentTarget.dataset.id;

    makeRequest('post', '/api/access/toggleadmin', {email: id})
      .then((result) => {
        window.location.reload();
      }).catch((error) => {
        window.location.reload();
      });        
  }

  displayMaps = (list) => {
    if (!list || !list.length)
      return <div/>;

    return (
      <div>
        {list.map((item) => {
          return <span>{item}<br/></span>
        })}
      </div>
    );
  }
  
  render() {
    const { data } = this.props;
    return (
      <div>
        <ReactTooltip id={'unverifieduser'} place="right" type="dark" effect="float">
          <span>Unverified user</span>
        </ReactTooltip>            
        <ReactTooltip id={'verifieduser'} place="right" type="dark" effect="float">
          <span>Verified user</span>
        </ReactTooltip>            
        <ReactTooltip id={'adminuser'} place="right" type="dark" effect="float">
          <span>Admin user</span>
        </ReactTooltip>            
        <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', paddingTop: '10px',
              paddingBottom: '10px', paddingLeft: '10px', marginTop: '10px' }}>
          <div style={{ display: 'flex', flex: 0.25, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>
            {data.status === 'UNVERIFIED' &&
              <img data-id={data.id} src={warn} data-tip data-for={'unverifieduser'}
                style={{ width: '15px', paddingRight: 5}} alt={'warn'} />}
            {data.status !== 'UNVERIFIED' &&
              <img data-id={data.id} src={user} data-tip data-for={data.admin ? 'adminuser' : 'verifieduser'}
                style={{ width: '15px', paddingRight: 5}} alt={'user'} />}
            {data.name}{this.props.user && this.props.user.email === data.email ? ' *' : ''}          
          </div>
          <div style={{ display: 'flex', flex: 0.25, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>{data.email}</div>
          <div style={{ display: 'flex', flex: 0.15, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>{data.ownedMaps ? data.ownedMaps.length : 0}</div>
          <div style={{ display: 'flex', flex: 0.15, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>{data.sharedMaps ? data.sharedMaps.length : 0}</div>
          <div style={{ display: 'flex', flex: 0.15, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>{data.countJobs}</div>
          <div style={{ display: 'flex', flexDirection: 'row', flex: 0.1, fontSize: '13px', justifyContent: 'flex-start', fontWeight: 'bold' }}>
            <div>
              <ReactTooltip id={'noAdmin'} place="right" type="dark" effect="float">
                <span>Remove Admin privilege</span>
              </ReactTooltip>            
              <ReactTooltip id={'admin'} place="right" type="dark" effect="float">
                <span>Grant Admin privilege</span>
              </ReactTooltip>            
              <img data-id={data.email} src={data.admin ? admin : noadmin}  data-tip data-for={data.admin ? 'noAdmin' : 'admin'}
                style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'admin'} 
                onClick={e => this.toggleAdmin(e)} />
              <ReactTooltip id={'userInfo'} place="right" type="dark" effect="float">
                <span>{'User Info'}</span>
              </ReactTooltip>            
              <img data-id={data.id} src={info} data-tip data-for={'userInfo'}
                style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'info'} 
                onClick={e => this.infoUser(e)} />
              <ReactTooltip id={'deleteUser'} place="right" type="dark" effect="float">
                <span>{'Delete User'}</span>
              </ReactTooltip>            
              <img data-id={data.email} data-tip data-for={'deleteUser'}
                src={del} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
                onClick={e => this.props.user && this.props.user.email  !== data.email ? this.props.deleteUser(e) : {}} />
            </div>
          </div>
        </div>

        {this.state.viewDetails &&
        <div>
          <div style={{ height: '35px', borderRadius: '3px', margin: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
            <div style={{ height: 'auto', display: 'flex', flex: 1, fontSize: '13px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
              <div onClick={e => this.infoUser(e)}>
                <label {...Styles.importButtonStyle}  >
                  CLOSE
                </label>
              </div>            
            </div>
          </div>
          <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
            <DisplayInfo title="Name" value={data.name}/>
            <DisplayInfo title="Status" value={data.status}/>
            <DisplayInfo title="Created" value={data.createdAt}/>
            <DisplayInfo title="Last login" value={data.lastLoginAt}/>
          </div>
          <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
            <DisplayInfo title="Owned Maps" value={this.displayMaps(data.ownedMaps)} />
            <DisplayInfo title="Shared Maps" value={this.displayMaps(data.sharedMaps)} />
          </div>
        </div>}      
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
)(UserRow);
