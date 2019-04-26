import React from 'react';
import FlexTable from '../../components/flexTable';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import UserRow from './components/userRow';
import ActivityTable from './components/activityTable';
import {Tabs, Tab} from 'material-ui/Tabs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as styles from './styles';

const { makeRequest } = require("../../utils/requestUtils");

class UsersContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      clients: [],
      users: [],
      rows: [],
      header: [],
      deleteConfirm: false,
      deleteId: undefined
    };
  }

  componentDidMount() {
    makeRequest('get', '/api/access/users')
      .then((result) => {
        if (result.data.success) {
          this.setState({loaded: true, users: result.data.users});
        } 
      }).catch((error) => {
        return;
      });

    makeRequest('get', '/api/access/activitylog')
      .then((result) => {
        if (result.data.success && result.data.entries.length > 0) {
          var entries = result.data.entries;
          var header = [];
          Object.keys(entries[0]).map((key) => {
            header.push({
              key: key,
              label: key.toUpperCase(),
              sortable: true,
              style: {
                width: key === 'activity' ? 'auto' : '15%',
              },
            
            })
            return key;
          });
          this.setState({ rows: entries, header: header });
        } 
      }).catch((error) => {
        return;
      });
  }

  addClient = (e) => {
    window.location = '/newclient';
  }
  
  refresh = (e) => {
    e.preventDefault();
    this.reload();
  }

  reload = () => {
    window.location.reload();
  }
  
  deleteUserWithConfirmation = (e) => {
    this.setState({deleteId: e.currentTarget.dataset.id, deleteConfirm: true})
  }


  deleteUser = () => {
    if (!this.state.deleteId) {
      this.setState({deleteConfirm: false, deleteId: undefined});
      return;
    }

    makeRequest('post', '/api/access/deleteuser', {email: this.state.deleteId})
      .then((result) => {
        this.reload();
        this.setState({deleteConfirm: false, deleteId: undefined});
      }).catch((error) => {
        this.setState({deleteConfirm: false, deleteId: undefined});
      });    
  }

  deleteConfirm = (e) => {
    e.preventDefault();
    var action = e.currentTarget.innerText;
    
    if (action === 'YES')
      this.deleteUser();
    else
      this.setState({deleteConfirm: false, deleteId: undefined});    
  }  

  render() {    
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          {this.state.deleteConfirm && 
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                        overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>Will result in deletion of all maps and jobs associated createdby the user, are you sure you want to delete? </div>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
                <div onClick={e => this.deleteConfirm(e)}>
                  <label {...styles.importButtonStyle}  >
                    YES
                  </label>
                </div>
                <div style={{paddingLeft: 10}} onClick={e => this.deleteConfirm(e)}>
                  <label {...styles.importButtonStyle}  >
                    NO
                  </label>
                </div>
              </div>
            </div>
          </div>
          }    
          
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, justifyContent: 'flex-start',
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>Users </div>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>
                <div onClick={e => this.refresh(e)}>
                  <label {...styles.importButtonStyle}  > REFRESH </label>
                </div>            
              </div>
            </div>

            <Tabs style={{whiteSpace: 'unset'}}
                  inkBarStyle={styles.inkBarStyle} tabItemContainerStyle={styles.tabItemContainerStyle}>
              {/* <Tab key={'owned'} label={'Registered Clients'}>        
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                            overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                  <FlexTable
                    showSelectAll={false}
                    data={this.state.clients}
                    columns={[
                      { name: 'CUSTOMER', width: 0.25, style: styles.headerColumnContainer },
                      { name: 'STAGE', width: 0.25, style: styles.headerColumnContainer },
                      { name: 'USERS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'MAPS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'JOBS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'ACTION', width: 0.1, style: styles.headerColumnContainer },
                    ]}
                    rowComponent={UserRow}
                    rowProps={{
                      reload: this.reload,
                      deleteUser: this.deleteClientWithConfirmation
                    }}
                    headerStyle={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: '#ffffff',
                      margin: '0px 10px',
                      border: 'none',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      paddingLeft: '10px',
                      marginTop: '10px'
                    }}
                    loader={{
                      loading: !this.state.loaded,
                      title: 'Loading clients data...',
                      message: 'You could have some ☕ while we load your data!'
                    }}
                  />
                  <div style={{marginTop: 20, zIndex: 9999}}>
                    <FloatingActionButton
                      style={{marginRight: 20, bottom: 20, right: 0, position: 'fixed'}} 
                      onClick={this.addClient}>
                      <ContentAdd/>
                    </FloatingActionButton>
                  </div>                  
                </div>
              </Tab> */}
              <Tab key={'owned'} label={'Registered Users'}>        
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                            overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                  <FlexTable
                    showSelectAll={false}
                    data={this.state.users}
                    columns={[
                      { name: 'NAME', width: 0.25, style: styles.headerColumnContainer },
                      { name: 'EMAIL', width: 0.25, style: styles.headerColumnContainer },
                      { name: 'MAPS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'SHARED MAPS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'JOBS', width: 0.15, style: styles.headerColumnContainer },
                      { name: 'ACTION', width: 0.1, style: styles.headerColumnContainer },
                    ]}
                    rowComponent={UserRow}
                    rowProps={{
                      reload: this.reload,
                      deleteUser: this.deleteUserWithConfirmation
                    }}
                    headerStyle={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: '#ffffff',
                      margin: '0px 10px',
                      border: 'none',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                      paddingLeft: '10px',
                      marginTop: '10px'
                    }}
                    loader={{
                      loading: !this.state.loaded,
                      title: 'Loading users data...',
                      message: 'You could have some ☕ while we load your data!'
                    }}
                  />
                </div>
              </Tab>
              <Tab key={'owned'} label={'User Activity'}>        
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                            overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                  <ActivityTable rows={this.state.rows} header={this.state.header} />
                </div>
              </Tab>
            </Tabs>
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
)(UsersContainer);
