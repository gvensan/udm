import React from 'react';
import uuidv4 from 'uuid/v4'; 
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import FileUpload from '../../components/fileUpload';
import LookupFileUpload from '../../components/lookupFileUpload';
import StageIndicator from '../../components/stage';
import PropTypes from 'prop-types';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const { makeRequest } = require("../../utils/requestUtils");
const del = require('../../assets/svg/ic_delete.svg');

const PHASES = {
  DCMAPPER: 1,
  DCSOURCEVALIDATION: 2,
  DCTARGETVALIDATION: 3,
  DCMAPANDTRANSFORM: 4,
  DCPOSTPROCESSING: 5,
  DCSUMMARY: 6
}

export default class DCMapper extends React.Component {
  static propTypes = {
    _state: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    jumpto: PropTypes.func.isRequired,
    validate: PropTypes.func.isRequired,
    start: PropTypes.func.isRequired,
    updateState: PropTypes.func.isRequired,
    loadMapState: PropTypes.func.isRequired,
    updateAndLoadMapState: PropTypes.func.isRequired,
    saveAndLoadMapState: PropTypes.func.isRequired
  }
  
  state = {
    namedLookupString: '',
    nameError: undefined
  }

  handleReuseSourceFile = (e, checked) => {
    e.preventDefault();

    var _this = this;
    makeRequest('post', '/api/mapper/reusesource', {reuse: checked, id: this.props._state.designId})
      .then((result) => {
        if (result.data.success) {
          window.location = '/design/' + _this.props._state.designId;
        } else {
          var error = <div>{result.data.message}</div>;
          _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false,  targetFileError: error, abandon: true });
        }
        return;        
      }).catch((error) => {
        _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false, targetFileError: error.message });
        return;
      });
  }
    
  mapNameUpdate = (e) => {
    e.preventDefault();
    var name = e.currentTarget.value;

    makeRequest('get', '/api/mapper/maps')
    .then((result) => {
      if (result.data.success) {
        var maps = result.data.maps.filter((map) => {
          return (map.name === name);
        });
        if (maps.length) {
          this.setState({nameError: 'A map already exists with the specified name'})
          return;
        }

        var newMap = this.props._state.map ? this.props._state.map : {};
        newMap.name = name;
        this.setState({nameError: undefined})
        this.props.updateState({map: newMap});  
        this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);  
      }
    })
  }

  mapDescriptionUpdate = (e) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.description = e.currentTarget.value;
    this.props.updateState({map: newMap});    
    this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);  
  }

  customFilesCountUpdate = (e, value) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.customFilesCount = this.refs.customapfilecount.getValue();
    this.props.updateState({map: newMap});    
  }

  handleCustomMapping = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.customMapping = checked;
    this.props.updateState({map: newMap});    
  }

  handleMergeFiles = (e, checked) => {
    e.preventDefault();

    makeRequest('post', '/api/mapper/mergefiles', {mergeFiles: checked, id: this.props._state.designId});
    this.props.loadMapState(this.props._state.designId);
  }

  customMappingFileNameUpdate = (e, value) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.customMappingFile = this.refs.cmfname.getValue();
    this.props.updateState({map: newMap});    
  }  
  
  handleCustomMappingFile = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.namedcustommappingfilelookups = checked;
    this.props.updateState({map: newMap});    
  }

  handleSourceFileSelect = (e) => {
    e.preventDefault();

    if (this.props._state.sourceFileReady)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('id',this.props._state.designId)
    formData.append('headerRow',this.props._state.map.headerRow)
    formData.append('name',this.props._state.map.name)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.props.updateState({ sourceFileUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/mapper/source', formData, config)
      .then((result) => {
        if (result.data.success) {
          // _this.props.updateAndLoadMapState(
          //                       _this.props._state.designId,
          //                       { sourceFileUploadInProgress: false, sourceFileReady: true, 
          //                         sourceFileError: undefined, sourceFile: result.data.inputFile });

          window.location = '/design/' + _this.props._state.designId;
        } else {
          var error = <div>{result.data.message}</div>;
          _this.props.updateState({ sourceFileUploadInProgress: false, sourceFileReady: false,  sourceFileError: error, abandon: true });
        }
        return;        
      }).catch((error) => {
        _this.props.updateState({ sourceFileUploadInProgress: false, sourceFileReady: false, sourceFileError: error.message });
        return;
      });
  }

  resetSource = (e) => {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.props._state.designId,
      name: this.props._state.map.name
    };

    this.props.updateState({ sourceFileUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/mapper/resetsource', data)
      .then((result) => {
        if (result.data.success) {
          window.location = '/design/' + _this.props._state.designId;
        } else {
          var error = <div>{result.data.message}<br/>Cannot reset source file!</div>;
          _this.props.updateState({ sourceFileUploadInProgress: false, sourceFileReady: false,  sourceFileError: error, abandon: true });            
        }
        return;        
      }).catch((error) => {
        _this.props.updateState({ sourceFileUploadInProgress: false, sourceFileReady: false, sourceFileError: error.message });
        return;
      });    
  }

  resetTarget = (e) => {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.props._state.designId,
      name: this.props._state.map.name
    };

    this.props.updateState({ targetFileUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/mapper/resettarget', data)
      .then((result) => {
        if (result.data.success) {
          window.location = '/design/' + _this.props._state.designId;
        } else {
          var error = <div>{result.data.message}<br/>Cannot reset target file!</div>;
          _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false,  targetFileError: error, abandon: true });
        }
        return;        
      }).catch((error) => {
        _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false, targetFileError: error.message });
        return;
      });    
  }

  handleTargetFileSelect = (e) => {
    e.preventDefault();
    
    if (this.props._state.targetFileReady)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('id',this.props._state.designId)
    formData.append('name',this.props._state.map.name)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.props.updateState({ targetFileUploadInProgress: true });    
    
    var _this = this;
    makeRequest('post', '/api/mapper/target', formData, config)
      .then((result) => {
        if (result.data.success) {
          _this.props.updateAndLoadMapState(
                                _this.props._state.designId,
                                { targetFileUploadInProgress: false, targetFileReady: true, ready: true, 
                                  targetFileError: undefined, targetFile: result.data.inputFile });
        } else {
          var error = <div>{result.data.message}</div>;
          _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false,  targetFileError: error, abandon: true });
        }
        return;        
      }).catch((error) => {
        _this.props.updateState({ targetFileUploadInProgress: false, targetFileReady: false, targetFileError: error.message });
        return;
      });
  }

  handleNamedLookups = (e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    newMap.namedlookups = checked;
    this.props.updateState({map: newMap});    
  }

  handleNamedLookupsReset = (e) => {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    var _this = this;
    makeRequest('post', '/api/mapper/lookupdelete', {user, id: _this.props._state.designId, index: -1})
      .then((result) => {
        _this.props.loadMapState(_this.props._state.designId);
      }).catch((error) => {
        _this.props.loadMapState(_this.props._state.designId);
      });      
    }

  handleLookupReset(lindex, e) {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    var _this = this;
    makeRequest('post', '/api/mapper/lookupdelete', {user, id: _this.props._state.designId, index: lindex})
      .then((result) => {
        _this.props.loadMapState(_this.props._state.designId);
      }).catch((error) => {
        _this.props.loadMapState(_this.props._state.designId);
      });    
  }

  addNamedLooup = (e) => {
    e.preventDefault();

    var newMap = this.props._state.map ? this.props._state.map : {};
    var namedlookupsList = newMap.namedlookupsList ? newMap.namedlookupsList : [];
    namedlookupsList.push({
      reuseSource: true,
      lookupName: 'lookup',
      lookupSheet: undefined,
      localLookupFile: this.props._state.map.sourceFile,
      localLookupSheets: Object.keys(this.props._state.map.sourceMap),
      externalLookupFile: undefined,
      externalLookupSheets: [],
      externalLookupSourceMap: undefined,
      externalLookupFileReady: false,
      externalLookupFileUploadInProgress: false,
      externalLookupFileError: undefined,
      abandon: false
    });
    newMap.namedlookupsList = namedlookupsList;
    newMap.namedlookups = true;
    this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);
  }

  handleExternalLookupSelect = (lindex, e, checked) => {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    var namedlookupsList = newMap.namedlookupsList ? newMap.namedlookupsList : [];
    namedlookupsList[lindex].reuseSource = !checked;
    namedlookupsList[lindex].lookupSheet = undefined;
    this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);
  }

  handleExternalLookupName = (lindex, e) => {
    e.preventDefault();
    
    var newMap = this.props._state.map ? this.props._state.map : {};
    var namedlookupsList = newMap.namedlookupsList ? newMap.namedlookupsList : [];
    namedlookupsList[lindex].lookupName = e.currentTarget.value;
    
    this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);
  }

  handleExternalLookupSourceFileSelect = (e) => {
    e.preventDefault();

    var lindex = e.target.dataset.index;
    var newMap = this.props._state.map ? this.props._state.map : {};
    var namedlookupsList = newMap.namedlookupsList ? newMap.namedlookupsList : [];
    if (lindex >= namedlookupsList.length)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('index',lindex)
    formData.append('id',this.props._state.designId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    namedlookupsList[lindex].externalLookupFileUploadInProgress = true;
    this.props.updateState({ map: newMap});

    var _this = this;
    var error = undefined;
    makeRequest('post', '/api/mapper/lookupsource', formData, config)
      .then((result) => {
        if (result.data.success) {
          _this.props.loadMapState(_this.props._state.designId);
        } else {
          error = <div>{result.data.message}</div>;
          namedlookupsList[lindex].externalLookupFileError = error;
          namedlookupsList[lindex].externalLookupFileUploadInProgress = false;
          namedlookupsList[lindex].externalLookupFileReady = false;
          _this.props.updateState({ map: newMap});
        }
        return;        
      }).catch((error) => {
        error = <div>{error.message}</div>;
        namedlookupsList[lindex].externalLookupFileError = error;
        namedlookupsList[lindex].externalLookupFileUploadInProgress = false;
        namedlookupsList[lindex].externalLookupFileReady = false;
        _this.props.updateState({ map: newMap});
      return;
      });
  }

  handleLookupSheetSelect(lindex, e, index, id) {
    e.preventDefault();
    var newMap = this.props._state.map ? this.props._state.map : {};
    var namedlookupsList = newMap.namedlookupsList ? newMap.namedlookupsList : [];
    namedlookupsList[lindex].lookupSheet =  id;
    this.props.saveAndLoadMapState(this.props._state.designId, this.props.state);
  }

  abortAndStartNew() { 
    this.props.updateState({ newConfirm: true});
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                          overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', flexDirection: 'row' }}>
              <StageIndicator condition={true} title={'Mapper'} phase={PHASES.DCMAPPER}/>
              <StageIndicator condition={!this.state.nameError && this.props._state.targetFileReady && 
                                        this.props._state.map !== undefined && this.props._state.map.name !== undefined} 
                                title={'Source Validation'} jumpto={this.props.jumpto} phase={PHASES.DCSOURCEVALIDATION}/>
              <StageIndicator  condition={!this.state.nameError && this.props._state.targetFileReady && 
                                        this.props._state.map !== undefined && this.props._state.map.name !== undefined} 
                                title={'Target Validation'} jumpto={this.props.jumpto} phase={PHASES.DCTARGETVALIDATION}/>
              <StageIndicator  condition={!this.state.nameError && this.props._state.targetFileReady && 
                                        this.props._state.map !== undefined && this.props._state.map.name !== undefined} 
                                title={'Map & Transform'} jumpto={this.props.jumpto} phase={PHASES.DCMAPANDTRANSFORM}/>
              <StageIndicator  condition={!this.state.nameError && this.props._state.targetFileReady && 
                                        this.props._state.map !== undefined && this.props._state.map.name !== undefined} 
                                title={'Post Processing'} jumpto={this.props.jumpto} phase={PHASES.DCPOSTPROCESSING}/>
              <StageIndicator  condition={!this.state.nameError && this.props._state.targetFileReady && 
                                        this.props._state.map !== undefined && this.props._state.map.name !== undefined} 
                                title={'Summary'} jumpto={this.props.jumpto} phase={PHASES.DCSUMMARY}/>
            </div>     

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {!(this.props._state.targetFileReady && this.props._state.map && this.props._state.map.name) &&
              <div onClick={e => this.abortAndStartNew(e)}>
                <label {...Styles.importButtonStyle}  >
                  START NEW
                </label>
              </div>}

              {this.props._state.targetFileReady && this.props._state.map && this.props._state.map.name &&                  
              <div style={{ display: 'flex', flexDirection: 'row'}}>
                <div onClick={e => !this.state.nameError && this.props.prev(e)}>
                  <label {...Styles.importButtonStyle}  >PREV </label>
                </div>
                <div onClick={e => !this.state.nameError && this.props.validate(e, 1)}>
                  <label {...Styles.importButtonStyle}  >VALIDATE </label>
                </div>
                <div onClick={e => !this.state.nameError && this.props.save(e, 1)}>
                  <label {...Styles.importButtonStyle}  >SAVE </label>
                </div>
                <div onClick={e => !this.state.nameError && this.props.next(e)}>
                  <label {...Styles.importButtonStyle}  >NEXT </label>
                </div>
              </div>}

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', 
                            height: 'auto', marginTop: 20, marginBottom: 10}}>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Map Name:&nbsp;
                  {this.props._state.map.name && <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>{this.props._state.map.name}</span>}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Source File:&nbsp;
                  {this.props._state.map.name && <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>{this.props._state.sourceFile}</span>}
                </div>
                <div style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: '#1a237e' }}>
                Target File:&nbsp;
                  {this.props._state.targetFile && <span style={{ fontSize: '10px', fontWeight: '800', fontStyle: 'italic', letterSpacing: '0.5px', color: root.titleInfoColor }}>{this.props._state.targetFile}</span>}
                </div>
              </div>   
            </div>                    
          </div>
          

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>       
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>
              {this.props._state.validated && 
                <div style={{ color: '#4caf50'}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    <div>Congratulations, source validation rules are valid</div><br/>
                  </div>
                </div>              
              }
              {this.props._state.error && this.props._state.error.length &&
                <div style={{ color: 'unset', marginBottom: 20}}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>
                    {this.props._state.error.map((_error, index) => {
                      return <div key={uuidv4()}><i style={{color: _error.startsWith('Warning') ? 'orange' : 'red'}}>{_error}</i></div>;
                    })}
                  </div>
                </div>    
              }
            </div>
          </div>
          
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', height: '100%'}}>
                <TextField
                  errorText={this.state.nameError ? this.state.nameError : "Distinct identification of the map"}
                  errorStyle={{color: this.state.nameError ? 'red' : 'unset'}}
                  hintText="Enter a name"
                  floatingLabelText="Map Name"
                  defaultValue={this.props._state.map ? this.props._state.map.name : ''}
                  style={{ width: '40%'}}
                  onBlur={this.mapNameUpdate}
                /><br/>
                <TextField
                  errorText="Description"
                  errorStyle={{color: 'unset'}}
                  hintText="Enter brief description of the map"
                  floatingLabelText="Map Description"
                  rows={4}
                  multiLine={true}
                  defaultValue={this.props._state.map ? this.props._state.map.description : ''}
                  style={{ width: '40%'}}
                  onBlur={this.mapDescriptionUpdate}
                />
            </div>
          </div>

          {((this.props._state.map && this.props._state.map.name) || 
            (this.props._state.map.name && this.props._state.map.name.length)) &&
          <div id="sourceFile" style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <FileUpload 
              info={"Source Excel file's sheets and headers will be retrieved for mapper design"}
              abandon={this.props._state.abandon}
              fileReady={this.props._state.sourceFileReady}
              htmlFor={"newfile"}
              file={this.props._state.sourceFile}
              mode={"source"}
              fileUploadInProgress={this.props._state.sourceFileUploadInProgress}
              fileError={this.props._state.sourceFileError}
              handleFileSelect={this.handleSourceFileSelect}
              handleFileReset={this.resetSource}
            />
          </div>}

          {((this.props._state.map && this.props._state.map.name) || 
            (this.props._state.map.name && this.props._state.map.name.length)) && this.props._state.sourceFileReady &&
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <FileUpload 
              info={"Target Excel file's sheets and headers will be retrieved for mapper design"}
              abandon={this.props._state.abandon}
              fileReady={this.props._state.map.reuseSource ? true : this.props._state.targetFileReady}
              htmlFor={"lastfile"}
              file={this.props._state.targetFile}
              mode={"target"}            
              fileUploadInProgress={this.props._state.targetFileUploadInProgress}
              fileError={this.props._state.targetFileError}
              handleFileSelect={this.handleTargetFileSelect} 
              marginTop={40}
              handleReuseSourceFile={this.handleReuseSourceFile}            
              handleFileReset={this.resetTarget}
              reuseSource={this.props._state.map.reuseSource}            
            />
          </div>}

          {((this.props._state.map && this.props._state.map.name) || 
            (this.props._state.map.name && this.props._state.map.name.length)) && 
            this.props._state.sourceFileReady && this.props._state.map.reuseSource &&
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Consolidate Files
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                      onClick={this.handleMergeFiles.bind(this)} />
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                    Consolidate data in one or more excel files
                  </div>
                </div>
                <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Merge Files"
                    labelStyle={{fontWeight: 900}}
                    checked={this.props._state.map.mergeFiles !== undefined ? this.props._state.map.mergeFiles : false}
                    onCheck={this.handleMergeFiles}
                    />
                </div>
              </div>
            </div>
          </div>}

          {((this.props._state.map && this.props._state.map.name) || 
            (this.props._state.map.name && this.props._state.map.name.length)) && this.props._state.sourceFileReady &&
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <div style={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Named Lookups 
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                      onClick={this.handleNamedLookupsReset.bind(this)} />
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                    Use of uploaded external source for vlookup in the mapping
                  </div>
                </div>
                <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Lookups"
                    labelStyle={{fontWeight: 900}}
                    checked={this.props._state.map.namedlookups !== undefined ? this.props._state.map.namedlookups : false}
                    onCheck={this.handleNamedLookups}
                    />
                  {this.props._state.map.namedlookups &&
                  <div style={{ marginTop: 20}} onClick={e => this.addNamedLooup(e)}>
                    <label {...Styles.importButtonStyle}  >ADD LOOKUP </label>
                  </div>}
                </div>
              </div>
              {this.props._state.map.namedlookups && this.props._state.map.namedlookupsList &&
                this.props._state.map.namedlookupsList.length > 0 &&
              <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', flexDirection: 'row', marginTop: 24}}>
                {this.props._state.map.namedlookupsList.map((namedLookup, lindex) => 
                <div key={uuidv4()} style={{ width: '28%', display: 'flex', flexDirection: 'column', justifyContent: 'left', 
                              alignItems: 'flex-start', padding: 16, marginRight: 8, marginBottom: 8, 
                              border: '1px dotted ' + root.dottedBorderColor}}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Named Lookup [{lindex+1}] </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                      onClick={this.handleLookupReset.bind(this, lindex)} />
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'left', width: '100%'}}>
                    <Checkbox
                      iconStyle={{fill: root.switchStyleFillColor}}
                      label="External Lookup"
                      labelStyle={{fontWeight: 900}}
                      checked={!namedLookup.reuseSource}
                      onCheck={this.handleExternalLookupSelect.bind(this, lindex)}
                      style={{width: '90%', marginTop: 16, marginBottom: -16}}
                    />
                    <TextField
                      errorText="Enter a lookup name"
                      errorStyle={{color: 'unset'}}
                      hintText="Lookup Name"
                      floatingLabelText="Lookup Name"
                      style={{width: '90%'}}
                      onBlur={this.handleExternalLookupName.bind(this, lindex)}
                      defaultValue={namedLookup.lookupName ? namedLookup.lookupName : ''}
                    />
                    <LookupFileUpload 
                      abandon={namedLookup.abandon}
                      fileReady={namedLookup.reuseSource ? true : namedLookup.externalLookupFileReady}
                      index={lindex}
                      marginTop={32}
                      // marginBottom={-24}
                      file={namedLookup.reuseSource ? namedLookup.localLookupFile : namedLookup.externalLookupFile}
                      fileUploadInProgress={namedLookup.reuseSource ? false : namedLookup.externalLookupFileUploadInProgress}
                      fileError={namedLookup.reuseSource ? undefined : namedLookup.externalLookupFileError}
                      handleFileSelect={this.handleExternalLookupSourceFileSelect}
                    />
                  </div>
                  
                </div>)}
              </div>}
            </div>
          </div>}
              
          {/* {((this.props._state.map && this.props._state.map.name) || 
            (this.props._state.map.name && this.props._state.map.name.length)) && this.props._state.sourceFileReady &&
          <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                      boxShadow: root.regularBorderColor + ' 2px 2px 4px 2px'}}> 
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Custom Mapping Required </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                  Executes custom mapping code built for specific purpose, this in turn skip the mapping configuration on a per-sheet basis.
                </div>
              </div>
              <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <Checkbox
                  iconStyle={{fill: root.switchStyleFillColor}}
                  label="Custom Mapping"
                  labelStyle={{fontWeight: 900}}
                  checked={this.props._state.map.customMapping !== undefined ? this.props._state.map.customMapping : false}
                  onCheck={this.handleCustomMapping}
                />
              </div>
            </div>
            {this.props._state.map.customMapping &&
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', flexDirection: 'column'}}>
                <div style={{flex: 1}}>
                  <TextField
                    errorText="Custom Mapping Implementation file"
                    errorStyle={{color: 'unset'}}
                    fullWidth={true}
                    hintText="Enter a valid implementation file"
                    floatingLabelText="Mapping Implementation File"
                    value={this.props._state.map.customMappingFile}
                    onChange={this.customMappingFileNameUpdate}
                    ref="cmfname"
                  />
                </div>
                <div style={{flex: 1}}>
                  <TextField
                    errorText="Number of additional files supporting the custom map process expected:"
                    errorStyle={{color: 'unset'}}
                    fullWidth={true}
                    hintText="Enter number of files"
                    floatingLabelText="Number of files"
                    defaultValue={0}
                    value={this.props._state.map && Number(this.props._state.map.customFilesCount) ? Number(this.props._state.map.customFilesCount) : 0}
                    ref="customapfilecount"
                    onChange={this.customFilesCountUpdate}
                  />
                </div>         
              </div>}
          </div>} */}
        </div>
      </MuiThemeProvider>
    );    
  }
}
