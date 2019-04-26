import React from 'react';
import FlexTable from '../../components/flexTable';
import JobRow from './components/jobRow';
import {Tabs, Tab} from 'material-ui/Tabs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import DialogModal from '../../components/dialog';

import { root } from '../../assets/variable';
import * as styles from './styles';

const { makeRequest } = require("../../utils/requestUtils");

export default class jobsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      jobs: [],
      deleteConfirm: false,
      deleteId: undefined,
      selected: 0
    };
  }

  componentDidMount() {
    makeRequest('get', '/api/jobs/jobs')
      .then((result) => {
        if (result.data.success) {
          this.setState({loaded: true, jobs: result.data.jobs});
        } 
        return;        
      }).catch((error) => {
        return;
      });
  }

  refresh = (e) => {
    e.preventDefault();
    this.reload();
  }

  reload = () => {
    window.location.reload();
  }
  
  deleteJobWithConfirmation = (e) => {
    this.setState({deleteId: [ e.currentTarget.dataset.id ], deleteJobName: e.currentTarget.dataset.filename, deleteConfirm: true})
    window.scrollTo(0, 0)
  }
  
  deleteSelected = (e) => {
    var selected = [];
    this.state.jobs.map((job) => {
      if (job.selected)
        selected.push(job.id);
      return job;
    })
    this.setState({deleteId: selected, deleteConfirm: true})
    window.scrollTo(0, 0)
  }

  selectAllRows = (checked) => {
    var jobs = this.state.jobs;

    jobs.map((job) => {
      job.selected = checked;
      return job;
    })
    var selected = checked ? jobs.length : 0;
    this.setState({jobs, selected})
  }

  handleRowSelect = (e, checked) => {
    var index = e.currentTarget.dataset.index;
    var jobs = this.state.jobs;
    jobs[index].selected = checked;
    var selected = this.state.selected;
    selected += checked ? 1 : -1;
    this.setState({jobs, selected})
  }

  deleteJob = () => {
    if (!this.state.deleteId) {
      this.setState({deleteConfirm: false, deleteId: undefined});
      return;
    }

    makeRequest('post', '/api/jobs/deletejob', {ids: this.state.deleteId})
      .then((result) => {
        this.reload();
        this.setState({deleteConfirm: false, deleteId: undefined});
      }).catch((error) => {
        this.setState({deleteConfirm: false, deleteId: undefined});
      });    
  }

  deleteConfirm = (action, checked, args) => {
    if (action === 'YES')
      this.deleteJob();
    else
      this.setState({deleteConfirm: false, deleteId: undefined});    
  }  

  render() {    
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)' }}>
          {this.state.deleteConfirm && 
          <div style={{ display: 'flex', flexDirection: 'row', padding: 10, fontSize: '14px', fontWeight: 'bold', 
                    alignItems: 'center', color: '#e0e0e0' }}>
            <DialogModal 
              style={{display: 'inline'}}
              needYes={true}
              needNo={true}
              open={true}
              title={"Delete Job"}
              handleAction={this.deleteConfirm}
              content={this.state.selected > 0 ?
                          'Are you sure you want to delete the selected jobs?' : 
                          'Are you sure you want to delete the job ' + this.state.deleteJobName + '?'}
            />
          </div>}      
          
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, justifyContent: 'flex-start',
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>Jobs </div>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>
                <div onClick={e => this.refresh(e)}>
                  <label {...styles.importButtonStyle}  > REFRESH </label>
                </div>            
              </div>
            </div>

            <Tabs style={{whiteSpace: 'unset'}}
                  inkBarStyle={styles.inkBarStyle} tabItemContainerStyle={styles.tabItemContainerStyle}>
              <Tab key={'owned'} label={'My Jobs'}>        
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', 
                            overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                  {this.state.selected > 0 &&
                  <div style={{ height: 'auto', borderRadius: '3px', marginLeft: 10, marginRight: 10, fontSize: '13px', fontWeight: 700,
                    backgroundColor: root.rowBackground, border: '1px solid ' + root.rowBorderColor,
                    display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', 
                    alignContent: 'flex-start', padding: 20, margin: 10 }}>
                    { this.state.selected } selected
                    <div style={{paddingLeft: 20}} onClick={e => this.deleteSelected(e)}>
                      <label {...styles.importButtonStyle}  > DELETE </label>
                    </div>            
                  </div>}
                  <FlexTable
                    showSelectAll={true}
                    selectedAll={this.state.selected > 0 && this.state.selected === this.state.jobs.length}
                    selectAllRows={this.selectAllRows}
                    data={this.state.jobs}
                    columns={[
                      { name: <div style={{paddingLeft: 40}}>JOB</div>, width: 0.3, style: styles.headerColumnContainer },
                      { name: 'MAP', width: 0.3, style: styles.headerColumnContainer },
                      { name: 'STATUS', width: 0.2, style: styles.headerColumnContainer },
                      { name: 'ACTION', width: 0.2, style: styles.headerColumnContainer },
                    ]}
                    rowComponent={JobRow}
                    rowProps={{
                      reload: this.reload,
                      deleteJob: this.deleteJobWithConfirmation,
                      handleRowSelect: this.handleRowSelect
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
                      title: 'Loading jobs data...',
                      message: 'You could have some ☕ while we load your data!'
                    }}
                  />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
