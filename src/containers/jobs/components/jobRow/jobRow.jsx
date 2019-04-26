import React from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Checkbox from 'material-ui/Checkbox';
import ReactTooltip from 'react-tooltip'

import { root } from '../../../../assets/variable';
import * as Styles from './styles';

const moment = require('moment');
const HumanElapsed = require("../../../../utils/humanElapsed");
const { makeRequest } = require("../../../../utils/requestUtils");

const info = require('../../../../assets/svg/ic_info.png');
const edit = require('../../../../assets/svg/ic_edit.svg');
const log = require('../../../../assets/svg/ic_log.png');
const del = require('../../../../assets/svg/ic_delete.svg');
const run = require('../../../../assets/svg/ic_run.png');
const download = require('../../../../assets/svg/ic_download.svg');
const excel = require('../../../../assets/svg/ic_excel.png');
const crunching = require('../../../../assets/svg/ic_running.gif');
const stop = require('../../../../assets/svg/ic_stop.png');

class DisplayInfo extends React.Component {
  render() {
    return (
      <div style={{display: 'flex', flexDirection: 'row',
                  // display: this.props.noflex ? 'unset' : 'flex', flexDirection: this.props.noflex ? 'unset' : 'row', 
                  flex: this.props.noflex ? 'unset' : 1, padding: this.props.noflex ? 0 : 5, width: '100%'}}>
        <div style={{flex: this.props.noflex ? 'unset' : 0.4, fontSize: this.props.fontSize ? this.props.fontSize : '13px', alignItems: 'left', fontWeight: 'bold'}}>{this.props.title}:&nbsp;&nbsp;</div>
        <div style={{flex: this.props.noflex ? 'unset' : 0.6, fontSize: this.props.fontSize ? this.props.fontSize : '13px', textAlign: 'left', fontWeight: 'normal'}}>{this.props.value}</div>
      </div>
    )
  }
}

class LogOutput extends React.Component {
  render() {
    return (
      <div className={Styles.boxedText} style={{display: 'flex',flexDirection: 'column', flex: 1, paddingTop: 10, paddingBottom: 10}}>
        <div style={{whiteSpace: 'pre-wrap'}}>{this.props.entries}</div>
      </div>
    )
  }
}

export default class JobRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewLog: false,
      logEntries: [],
      value: '',
      copied: false,
      viewDetails: false,
      counter: moment().format('x')/1000,
      elapsed: 0,
      data: props.data,
    }

    this.tick = this.tick.bind(this);    
  }

  componentDidMount() {
    if (this.state.data && this.state.data.status === 'RUNNING') {
      if (this.state.timer)
        clearInterval(this.state.timer);
        
      let timer = setInterval(this.tick, 3000);
      this.setState({counter: moment().format('x')/1000, timer});
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  tick() {
    console.log((moment().format('x')/1000 - this.state.counter) + ' and ticking...')
    makeRequest('get', '/api/jobs/job?id=' + this.state.data.id)
      .then((result) => {
        if (result.data.success) {
          var job = result.data.job;
          this.setState({data: result.data.job, elapsed: moment().format('x')/1000 - this.state.counter });
          if (job.status !== 'RUNNING') {
            clearInterval(this.state.timer);
            this.forceUpdate();
          }
        } else {
          clearInterval(this.state.timer);          
        }
        return;        
      }).catch((error) => {
        clearInterval(this.state.timer);
        return;
      });    
  }

  editMap = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    window.location = '/design/'+id;  
  }

  closeLog = (e) => {
    this.setState({viewLog: false, logEntries: []});
  }

  downloadResult = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    window.location = '/api/jobs/download?id='+id+'&token='+sessionStorage.getItem('user');  
  }

  downloadMapResult = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    makeRequest('get', '/api/jobs/downloadmappedexists?id='+ id+'&token='+sessionStorage.getItem('user'))
      .then((result) => {
        if (result.data.success) {
          window.location = '/api/jobs/downloadmapped?id='+id+'&token='+sessionStorage.getItem('user');  
        }
      })
  }

  runJob = (e) => {
    e.preventDefault();
    this.setState({viewLog: false, logEntries: [], viewDetails: false});
    if (this.state.timer)
      clearInterval(this.state.timer);
    let timer = setInterval(this.tick, 3000);
    this.setState({counter: moment().format('x')/1000, timer});

    var id = e.currentTarget.dataset.id;
    makeRequest('post', '/api/jobs/run', {id});
    this.tick();
  }

  stopJob = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    makeRequest('post', '/api/jobs/stop', {id});
    clearInterval(this.state.timer);
    this.tick();
  }

  viewLog = (e) => {
    e.preventDefault();
    if (this.state.viewLog) {
      this.setState({viewLog: false, logEntries: [], viewDetails: false});
      return;
    }

    var id = e.currentTarget.dataset.id;
    makeRequest('get', '/api/jobs/viewlog?id='+ id)
      .then((result) => {
        if (result.data.success) {
          this.setState({viewLog: true, logEntries: result.data.logentries, viewDetails: false});
        } else {
          this.setState({viewLog: true, logEntries: result.data.logentries, viewDetails: false});
        }
      }).catch((error) => {
        console.log('Job log fetch failed - ', error.message);
      });        
  }

  infoJob = (e) => {
    e.preventDefault();
    this.setState({viewDetails: !this.state.viewDetails, viewLog: false});
  }
  
  editJob = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    window.location = '/job/'+id;  
  }

  render() {
    const { data } = this.state;
    const background = data.status === 'FAILED' ? root.rowFailedBackground : root.rowBackground;
  
    return (
    <div>
      <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', 
                    background: background,  border: '1px solid ' + root.rowBorderColor, display: 'flex', 
                    flexDirection: 'row', justifyContent: 'center', 
                    alignContent: 'center', paddingTop: '10px', paddingBottom: '10px', paddingLeft: '10px', marginTop: '10px' }}>
        <div style={{ display: 'flex', flex: 0.3, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>
          {this.props.handleRowSelect && 
          <div style={{ display: 'flex', flex: 0.02, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>
            <Checkbox
              data-index={this.props.index}
              iconStyle={{fill: root.switchStyleFillColor}}
              checked={data.selected ? data.selected === true : false}
              onCheck={this.props.handleRowSelect}
            />
          </div>}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%'}} > 
            {data.status === 'SUCCESS' &&
              <span style={{display: 'block', textAlign: 'center', 
                            backgroundColor: root.jobSuccessBackground, 
                            color: 'white', marginRight: 3, fontSize: '9px', alignItems: 'center', 
                            fontWeight: 'small', padding: 4}}>&#10004;</span>}
            {data.status !== 'SUCCESS' &&
                <span style={{display: 'block', textAlign: 'center', 
                              backgroundColor: data.status === 'RUNNING' ? 
                                    root.jobRunningBackground : root.jobFailedBackground, 
                              color: 'white', marginRight: 3, fontSize: '9px', alignItems: 'center', 
                              fontWeight: 'small', padding: 4 }}>&#x2716;</span>
            }
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left', fontWeight: 'bold',width: '100%' }} > 
              <DisplayInfo title="Input" value={data.inputFile} noflex={true} fontSize={'10px'}/>
              {data.diffFile && <DisplayInfo title="Diff" value={data.diffFile} noflex={true} fontSize={'10px'}/>}
              {data.lookupFiles && Object.keys(data.lookupFiles).length > 0 &&
                Object.keys(data.lookupFiles).map((luname) => {
                  return <DisplayInfo key={luname} title={"Lookup ["+luname + "]"} 
                            value={data.lookupFiles[luname]} noflex={true} fontSize={'10px'}/>
              })}
              {data.customFiles && data.customFiles.length > 0 &&
                  <DisplayInfo title="Custom Input" noflex={true} fontSize={'10px'}/>}
              {data.customFiles && data.customFiles.length > 0 &&
                data.customFiles.map((cname) => {
                  return <DisplayInfo title={''} value={cname} noflex={true} fontSize={'10px'}/>
              })}         
            </div> 
          </div>  
        </div>
        <div style={{ display: 'flex', flex: 0.3, fontSize: '13px', fontWeight: 'bold' }}>
          <span>
            <ReactTooltip id={'editMap'} place="right" type="dark" effect="float">
              <span>Edit Map</span>
            </ReactTooltip>            
            <img data-id={data.mapId} src={edit} data-tip data-for={'editMap'}
              style={{ width: '15px', paddingRight: 5, cursor: 'pointer' }} alt={'edit'} 
              onClick={e => this.editMap(e)} />
          </span>{data.mapName}
        </div>
        {data.status === 'RUNNING' &&
          <div style={{ display: 'flex', flex: 0.2, flexDirection: 'column', fontSize: '13px', fontWeight: 'bold'}}>
            <div>
              <img data-id={data.id} src={stop}  data-tip data-for={'stopJob'}
                style={{ width: 15, paddingRight: 15, cursor: 'pointer' }} alt={'stop'} 
                onClick={e => this.stopJob(e)} />            
              {'Time Elapsed: ' + HumanElapsed(this.state.elapsed)}
            </div>
            <div>{data.message}</div>
          </div>
        }
        {data.status !== 'RUNNING' &&
          <div style={{ display: 'flex', flex: 0.2, flexDirection: 'column', fontSize: '13px', fontWeight: 'bold' }}>
            <div> {data.status}</div>
            <div> {data.message}</div>
            {data.messageGroup && <div style={{fontStyle: 'italic'}}>{data.messageGroup }</div>}
            <div> {data.lastExecutedAt}</div>
          </div>
        }
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.2, fontSize: '13px', justifyContent: 'flex-start', fontWeight: 'bold' }}>
          {data.status === 'RUNNING' &&
          <div>
              <img width={25} src={crunching} alt={'crunching...'}/>
          </div>}
          {(true || data.status !== 'RUNNING') &&
          <div style={{visibility: data.status !== 'RUNNING' ? '' : 'hidden'}}>
            <ReactTooltip id={'jobInfo'} place="right" type="dark" effect="float">
              <span>Job Info</span>
            </ReactTooltip>            
            <img data-id={data.id} src={info} data-tip data-for={'jobInfo'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'info'} 
              onClick={e => this.infoJob(e)} />
            <ReactTooltip id={'jobEdit'} place="right" type="dark" effect="float">
              <span>Job Edit</span>
            </ReactTooltip>            
            <img data-id={data.id} src={edit} data-tip data-for={'jobEdit'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'info'} 
              onClick={e => this.editJob(e)} />
            <ReactTooltip id={'jobLog'} place="right" type="dark" effect="float">
              <span>Job Execution log</span>
            </ReactTooltip>            
            <img data-id={data.id} src={log}  data-tip data-for={'jobLog'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'log'} 
              onClick={e => this.viewLog(e)} />
            <ReactTooltip id={'downloadJob'} place="right" type="dark" effect="float">
              <span>Download Job bundle</span>
            </ReactTooltip>            
            <img data-id={data.id} src={download}  data-tip data-for={'downloadJob'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'download'} 
              onClick={e => this.downloadResult(e)} />
            <ReactTooltip id={'downloadMap'} place="right" type="dark" effect="float">
              <span>Download Mapped output</span>
            </ReactTooltip>            
            <img data-id={data.id} src={excel}  data-tip data-for={'downloadMap'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'download map'} 
              onClick={e => this.downloadMapResult(e)} />
            <ReactTooltip id={'executeJob'} place="right" type="dark" effect="float">
              <span>Execute Job</span>
            </ReactTooltip>            
            <img data-id={data.id} src={run}  data-tip data-for={'executeJob'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'run'} 
              onClick={e => this.runJob(e)} />
            <ReactTooltip id={'deleteJob'} place="right" type="dark" effect="float">
              <span>Delete Job</span>
            </ReactTooltip>            
            <img data-id={data.id} src={del}  data-filename={data.inputFile} data-tip data-for={'deleteJob'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
              onClick={e => this.props.deleteJob(e)} />
          </div>}
        </div>
      </div>
      {this.state.viewLog && 
      <div>
        <div style={{ height: '35px', borderRadius: '3px', margin: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
          <div style={{ height: 'auto', display: 'flex', flex: 1, fontSize: '13px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
            <div onClick={e => this.closeLog(e)}>
              <label {...Styles.importButtonStyle}  >
                CLOSE
              </label>
              <CopyToClipboard text={this.state.logEntries} onCopy={() => this.setState({copied: true})}>
                <label {...Styles.importButtonStyle}  >
                  COPY TO CLIPBOARD
                </label>
              </CopyToClipboard>
            </div>            
          </div>
        </div>
        <div style={{ height: '300px', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
          <LogOutput entries={this.state.logEntries}/>
        </div>
      </div>}
      {this.state.viewDetails &&
      <div>
        <div style={{ height: '35px', borderRadius: '3px', margin: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
          <div style={{ height: 'auto', display: 'flex', flex: 1, fontSize: '13px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
            <div onClick={e => this.infoJob(e)}>
              <label {...Styles.importButtonStyle}  >
                CLOSE
              </label>
            </div>            
          </div>
        </div>
        <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, 
                      border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', 
                      justifyContent: 'center', alignContent: 'center' }}>
          <DisplayInfo title="ID" value={data.id}/>
          <DisplayInfo title="Map Name" value={data.mapName}/>
          <DisplayInfo title="Map Id" value={data.mapId}/>
          <DisplayInfo title="Created" value={data.createdAt}/>
          <DisplayInfo title="Creator" value={data.creator}/>
          <DisplayInfo title="Input file" value={data.inputFile}/>
          {data.customFilesCount && data.customFilesCount > 0 && data.customFile1 &&
            <DisplayInfo title="Custom Input File1" value={data.customFile1}/>}
          {data.customFilesCount && data.customFilesCount > 1 && data.customFile2 &&
            <DisplayInfo title="Custom Input File2" value={data.customFile2}/>}
          {data.diffFile && <DisplayInfo title="Diff File" value={data.diffFile}/>}
          <DisplayInfo title="Last executed" value={data.lastExecutedAt}/>
          <DisplayInfo title="PID" value={data.pid}/>
          <DisplayInfo title="Status" value={data.status}/>
          <DisplayInfo title="Message" value={data.message}/>
        </div>
      </div>}      
    </div>
    );
  }
}
