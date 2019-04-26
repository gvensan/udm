import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import ReactTooltip from 'react-tooltip'

import { root } from '../../../../assets/variable';
import * as styles from './styles';

const info = require('../../../../assets/svg/ic_info.png');
const del = require('../../../../assets/svg/ic_delete.svg');
const edit = require('../../../../assets/svg/ic_edit.svg');
const clone = require('../../../../assets/svg/ic_clone.png');
const share = require('../../../../assets/svg/ic_share.png');
const unshare = require('../../../../assets/svg/ic_unshare.png');
const exp = require('../../../../assets/svg/ic_download.svg');

class DisplayInfo extends React.Component {
  render() {
    return (
      <div style={{display: 'flex', flexDirection: 'row',
                  // display: this.props.noflex ? 'unset' : 'flex', flexDirection: this.props.noflex ? 'unset' : 'row', 
                  flex: this.props.noflex ? 'unset' : 1, padding: this.props.noflex ? 0 : 5, width: '100%'}}>
        {this.props.title && 
          <div style={{flex: this.props.noflex ? 'unset' : 0.4, fontSize: '13px', alignItems: 'left', fontWeight: 'bold'}}>{this.props.title}:&nbsp;&nbsp;</div>}
        <div style={{flex: this.props.noflex ? 'unset' : 0.6, fontSize: '13px', textAlign: 'left', fontWeight: 'normal'}}>{this.props.value}</div>
      </div>
    )
  }
}

export default class MapRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logEntries: [],
      value: '',
      copied: false,
      viewDetails: false,
      viewId: undefined
    }
  }

  closeLog = (e) => {
    this.setState({logEntries: []});
  }

  editMap = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    window.location = '/design/'+id;  
  }

  runMapJob = (e) => {
    e.preventDefault();
    var id = e.currentTarget.dataset.id;
    window.location = '/job/'+id;  
  }

  infoMap = (e) => {
    e.preventDefault();
    this.setState({viewDetails: !this.state.viewDetails, viewId: e.currentTarget.dataset.id});
  }

  closeMap = (e) => {
    e.preventDefault();
    this.setState({viewDetails: false});
  }

  render() {
    const { data } = this.props;
    if (data.chained)
      return <div/>;

    var isChained = data.chainMaps && data.chainedMaps && data.chainedMaps && data.chainedMaps.length > 0;
    var _this = this;
    
    return (
    <div>
      <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', 
                    background: root.rowBackground, border: '1px solid ' + root.rowBorderColor, 
                    display: 'flex', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', paddingTop: '10px',
                    paddingBottom: '10px', paddingLeft: '10px', marginTop: '10px', marginBottom: isChained ? 0 : 'inherit'}}>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.4, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>
          {this.props.handleRowSelect && 
          <div style={{ display: 'flex', flex: 0.02, fontSize: '13px', alignItems: 'center', fontWeight: 'bold' }}>
            <Checkbox
              data-index={this.props.index}
              iconStyle={{fill: root.switchStyleFillColor}}
              checked={data.selected ? data.selected === true : false}
              onCheck={this.props.handleRowSelect}
            />
          </div>}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%'}} > 
            {data.status === 'VALID' ? 
              <span style={{display: 'block', textAlign: 'center', backgroundColor: root.mapValidBackground, 
                          color: 'white', alignItems: 'center', fontWeight: 'small', marginRight: 3, 
                          padding: 4}}>&#10004;</span> :
              <span style={{display: 'block', textAlign: 'center', backgroundColor: root.mapInvalidBackground, 
                          color: 'white', alignItems: 'center', fontWeight: 'small',marginRight: 3,
                          padding: 4 }}>&#x2716;</span>
            }
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%'}} > 
              {data.name}<br/>
              {data.description &&
                <pre style={{wordWrap: 'break-word', fontWeight: 'small', fontSize: '9px', fontStyle: 'italic'}}>{data.description}</pre>}
              {data.lastUpdatedAt}<br/>
              {data.shared ? 'Shared by: ' + (data.owner ? data.owner : data.creator) : ''}
              {data.shared ? <br/> : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flex: 0.4, fontSize: '13px', alignItems: 'left', fontWeight: 'bold',
                      flexDirection: 'column', width: '100%'  }}>
          <DisplayInfo title="Source" value={data.sourceFile} noflex={true}/>
          <DisplayInfo title="Target" value={data.targetFile} noflex={true}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', flex: 0.2, fontSize: '13px', justifyContent: 'flex-start', alignItems: 'center', fontWeight: 'bold' }}>
          <div>
            <ReactTooltip id={'mapInfo'} place="right" type="dark" effect="float">
              <span>Map Info</span>
            </ReactTooltip>            
            <img data-id={data.id} src={info} data-tip data-for={'mapInfo'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'info'} 
              onClick={e => this.infoMap(e)} />
            {data.owned &&
              <span>
                <ReactTooltip id={'editMap'} place="right" type="dark" effect="float">
                  <span>Edit Map</span>
                </ReactTooltip>            
                <img data-id={data.id} src={edit} data-tip data-for={'editMap'}
                  style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
                  onClick={e => this.editMap(e)} />
              </span>}
            <ReactTooltip id={'cloneMap'} place="right" type="dark" effect="float">
              <span>Clone Map</span>
            </ReactTooltip>            
            <img data-id={data.id} src={clone} data-tip data-for={'cloneMap'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'clone'} 
              onClick={e => this.props.cloneMap(e)} />
            <ReactTooltip id={'exportMap'} place="right" type="dark" effect="float">
              <span>Download Map bundle</span>
            </ReactTooltip>            
            <img data-id={data.id} src={exp} data-tip data-for={'exportMap'}
              style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'export'} 
              onClick={e => this.props.exportMap(e)} />
            {data.owned && !(data.chainedMaps && data.chainedMaps.length > 0) &&
              <span>
                <ReactTooltip id={'share'} place="right" type="dark" effect="float">
                  <span>Share Map</span>
                </ReactTooltip>            
                <ReactTooltip id={'unshare'} place="right" type="dark" effect="float">
                  <span>Unshare Map</span>
                </ReactTooltip>            
                <img data-id={data.id} src={data.shared ? unshare : share} data-tip data-for={data.shared ? 'unshare' : 'share'}
                  style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }}
                  alt={'share'} onClick={e => this.props.toggleShare(e)} />
              </span>}
            {data.owned &&
              <span>
                <ReactTooltip id={'deleteMap'} place="right" type="dark" effect="float">
                  <span>Delete Map</span>
                </ReactTooltip>            
                <img data-id={data.id} data-mapname={data.name} data-mapchained={data.chainMaps} src={del} 
                  data-tip data-for={'deleteMap'} style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'delete'} 
                  onClick={e => this.props.deleteMapWithConfirmation(e)} />
              </span>}
          </div>
        </div>
      </div>
      {this.state.viewDetails && this.state.viewId === data.id &&
      <div>
        <div style={{ height: '35px', borderRadius: '3px', margin: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
          <div style={{ height: 'auto', display: 'flex', flex: 1, fontSize: '13px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
            <div onClick={e => this.closeMap(e)}>
              <label {...styles.importButtonStyle}  >
                CLOSE
              </label>
            </div>            
          </div>
        </div>
        <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
          <DisplayInfo title="ID" value={data.id}/>
          <DisplayInfo title="Name" value={data.name}/>
          <DisplayInfo title="Description" value={data.description}/>
          <DisplayInfo title="Created" value={data.createdAt}/>
          <DisplayInfo title="Creator" value={data.creator}/>
          {data.owner && <DisplayInfo title="Owner" value={data.owner}/>}
          {!data.owner && <DisplayInfo title="Owner" value={data.creator}/>}
          {data.originalName && <DisplayInfo title="Orignal Map Name" value={data.originalName}/>}
          <DisplayInfo title="Shared" value={data.shared ? 'Yes' : 'No'}/>
          <DisplayInfo title="Last Updated" value={data.lastUpdatedAt}/>
          <DisplayInfo title="Status" value={data.status}/>
          <DisplayInfo title="Source File" value={data.sourceFile}/>
          <DisplayInfo title="Source Sheets Ignored" value={data.sourceIgnoreMap && Object.keys(data.sourceIgnoreMap).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Source Validation" value={data.sourceMapValidation && Object.keys(data.sourceMapValidation).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Source Preprocessors" value={data.sourcePreprocessor && Object.keys(data.sourcePreprocessor).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Target File" value={data.targetFile}/>
          <DisplayInfo title="Target Sheets Ignored" value={data.targetIgnoreMap && Object.keys(data.targetIgnoreMap).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Target Validation" value={data.targetMapValidation && Object.keys(data.targetMapValidation).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Target Preprocessors" value={data.targetPreprocessor && Object.keys(data.targetPreprocessor).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Map Preprocessors" value={data.mapPreprocessor && Object.keys(data.mapPreprocessor).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Map Sheets Ignored" value={data.mapIgnoreMap && Object.keys(data.mapIgnoreMap).length ? 'Defined' : 'None' }/>
          <DisplayInfo title="Last Uploaded File for diff expected" value={data.diffSupported ? 'Yes' : 'No'}/>
        </div>
      </div>}

      {isChained && data.chainedMaps && data.chainedMaps && data.chainedMaps.length > 0 && _this.props.maps && 
        this.renderChainedMap(data, isChained)
      }
    </div>
    );
  }

  renderChainedMap(data, isChained) {
    var _this = this;
    return (
      <div style={{ height: 'auto', borderRadius: '3px', marginLeft: 10, marginRight: 10, 
                  backgroundColor: root.rowBackground, border: '1px solid ' + root.rowBorderColor,
                  display: 'flex', flexDirection: 'row', justifyContent: 'center', 
                  alignContent: 'flex-start', padding: 10, marginTop: isChained ? 0 : 'inherit', 
                  borderTop: isChained ? 'unset' : 'inherit' }}>
        <div style={{width: '100%'}}>
          {data.chainedMaps.map((_entry, index) => {
            var entry = _this.props.maps.find((map) => { return map.id === _entry.id});
            if (!entry)
              entry = _this.props.maps.find((map) => { return map.name === _entry.name});
            if (!entry)
              return '';

            var isChained = entry.chainMaps && entry.chainedMaps && entry.chainedMaps && entry.chainedMaps.length > 0;

            return (
              <div key={_entry.id} style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{height: 'auto', borderRadius: '3px', 
                    background: 'white', border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'row', 
                    justifyContent: 'flex-start', alignItems: 'center', padding: 10, marginTop: '10px' }}>
                  <div style={{flex: 0.4, alignItems: 'flex-start'}}>
                    <span role="img" aria-label="Snowman">&#128279;</span>&nbsp;
                      {entry.name}<br/>
                      {entry.description &&
                        <pre style={{fontWeight: 'small', fontSize: '9px', fontStyle: 'italic'}}>{entry.description}</pre>}
                      {/* <DisplayInfo title="Source" value={entry.sourceFile} noflex={true}/>
                      <DisplayInfo title="Target" value={entry.targetFile} noflex={true}/> */}
                      <DisplayInfo value={entry.lastUpdatedAt} noflex={true}/>
                  </div>
                  <div style={{ display: 'flex', flex: 0.4, fontSize: '13px', alignItems: 'left', fontWeight: 'bold',
                                flexDirection: 'column', width: '100%'  }}>
                    <DisplayInfo title="Source" value={entry.sourceFile} noflex={true}/>
                    <DisplayInfo title="Target" value={entry.targetFile} noflex={true}/>
                  </div>
                  <div style={{flex: 0.2, alignItems: 'flex-end', paddingLeft: 60}}>
                    <span>
                      <ReactTooltip id={'mapInfo'} place="right" type="dark" effect="float">
                        <span>Map Info</span>
                      </ReactTooltip>            
                      <img data-id={entry.id} src={info} data-tip data-for={'mapInfo'}
                        style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'info'} 
                        onClick={e => _this.infoMap(e)} />
                    </span>
                    <span>
                      <ReactTooltip id={'editChainedMap'} place="right" type="dark" effect="float">
                        <span>Edit Chained Map</span>
                      </ReactTooltip>            
                      <img data-id={entry.id} src={edit} data-tip data-for={'editChainedMap'}
                        style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'edit'} 
                        onClick={e => _this.editMap(e)} />
                    </span>
                    <span>
                      <ReactTooltip id={'cloneChainedMap'} place="right" type="dark" effect="float">
                        <span>Clone Chained Map</span>
                      </ReactTooltip>            
                      <img data-id={entry.id} src={clone} data-tip data-for={'cloneChainedMap'}
                        style={{ width: '15px', paddingRight: 15, cursor: 'pointer' }} alt={'clone'} 
                        onClick={e => _this.props.cloneMap(e)} />
                    </span>
                  </div>
                </div>

                {_this.state.viewDetails && _this.state.viewId === entry.id &&
                <div>
                  <div style={{ height: '35px', borderRadius: '3px', margin: '20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
                    <div style={{ height: 'auto', display: 'flex', flex: 1, fontSize: '13px', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                      <div onClick={e => _this.closeMap(e)}>
                        <label {...styles.importButtonStyle}  >
                          CLOSE
                        </label>
                      </div>            
                    </div>
                  </div>
                  <div style={{ height: 'auto', borderRadius: '3px', margin: '10px 10px', background: root.conditionContainerBackground, border: '1px solid #e4e4e4', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignContent: 'center' }}>
                    <DisplayInfo title="ID" value={entry.id}/>
                    <DisplayInfo title="Name" value={entry.name}/>
                    <DisplayInfo title="Description" value={entry.description}/>
                    <DisplayInfo title="Created" value={entry.createdAt}/>
                    <DisplayInfo title="Creator" value={entry.creator}/>
                    {entry.owner && <DisplayInfo title="Owner" value={entry.owner}/>}
                    {!entry.owner && <DisplayInfo title="Owner" value={entry.creator}/>}
                    {entry.originalName && <DisplayInfo title="Orignal Map Name" value={entry.originalName}/>}
                    <DisplayInfo title="Shared" value={entry.shared ? 'Yes' : 'No'}/>
                    <DisplayInfo title="Last Updated" value={entry.lastUpdatedAt}/>
                    <DisplayInfo title="Status" value={entry.status}/>
                    <DisplayInfo title="Source File" value={entry.sourceFile}/>
                    <DisplayInfo title="Source Sheets Ignored" value={entry.sourceIgnoreMap && Object.keys(entry.sourceIgnoreMap).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Source Validation" value={entry.sourceMapValidation && Object.keys(entry.sourceMapValidation).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Source Preprocessors" value={entry.sourcePreprocessor && Object.keys(entry.sourcePreprocessor).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Target File" value={entry.targetFile}/>
                    <DisplayInfo title="Target Sheets Ignored" value={entry.targetIgnoreMap && Object.keys(entry.targetIgnoreMap).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Target Validation" value={entry.targetMapValidation && Object.keys(entry.targetMapValidation).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Target Preprocessors" value={entry.targetPreprocessor && Object.keys(entry.targetPreprocessor).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Map Preprocessors" value={entry.mapPreprocessor && Object.keys(entry.mapPreprocessor).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Map Sheets Ignored" value={entry.mapIgnoreMap && Object.keys(entry.mapIgnoreMap).length ? 'Defined' : 'None' }/>
                    <DisplayInfo title="Last Uploaded File for diff expected" value={entry.diffSupported ? 'Yes' : 'No'}/>
                  </div>
                </div>}

                {isChained && entry.chainedMaps && entry.chainedMaps && entry.chainedMaps.length > 0 && _this.props.maps && 
                  _this.renderChainedMap(entry, isChained)
                }
                
              </div>
            );
          })}
        </div>
      </div>
    );    
  }
}
