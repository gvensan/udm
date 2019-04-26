import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import uuidv4 from 'uuid/v4'; 
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Checkbox from 'material-ui/Checkbox';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MergeFileUpload from '../../components/mergeFileUpload';
import JobFileUpload from '../../components/jobFileUpload';
import DialogModal from '../../components/dialog';

import { root } from '../../assets/variable';
import * as Styles from './styles';

const { makeRequest } = require("../../utils/requestUtils");
const del = require('../../assets/svg/ic_delete.svg');

class UploadContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newConfirm: false,
      success: undefined,
      abandon: false,
      error: '',
      result: null,
      inputFilesUploadInProgress: false,
      inputFileReady: false,
      inputFilesError: undefined,
      inputFile: undefined,
      customFilesUploadInProgress: [],
      customFilesReady: [],
      customFilesError: [],
      customFiles: [],
      lookupFilesUploadInProgress: [],
      lookupFilesReady: [],
      lookupFilesError: [],
      lookupFiles: [],
      mergeFilesUploadInProgress: [],
      mergeFilesReady: [],
      mergeFilesError: [],
      mergeFiles: [],
      filesExpected: 0,        
      filesUploaded: 0,
      diffFileUploadInProgress: false,
      diffFileReady: false,
      diffFileError: undefined,
      diffFile: undefined,
      maps: [],
      map: undefined,
      mapId: undefined,
      mapName: undefined,
      namedlookups: false,
      namedlookupsList: [],
      useSheetNumbers: false,
      ready: false,
      entries: [],
      uploadId: uuidv4()
    };
  }
  
  componentDidMount() {
    var _this = this;
    if (this.props.match.params.id) {
      makeRequest('get', '/api/jobs/job?id=' + this.props.match.params.id)
        .then((result) => {
          if (result.data.success) {
            var job = result.data.job;

            var _state = {
              success: undefined,
              abandon: false,
              error: '',
              result: null,
              inputFilesUploadInProgress: false,
              inputFileReady: job.inputFile ? true : false,
              inputFilesError: undefined,
              inputFile: job.inputFile,
              customFilesUploadInProgress: job.customFiles ? Array(job.customFiles.length).fill(false) : [],
              customFilesReady: job.customFiles ? Array(job.customFiles.length).fill(true) : [],
              customFilesError: job.customFiles ? Array(job.customFiles.length).fill(undefined) : [],
              customFiles: job.customFiles ? job.customFiles : [],
              lookupFilesUploadInProgress: job.lookupFiles ? Array(Object.keys(job.lookupFiles).length).fill(false) : [],
              lookupFilesReady: job.lookupFiles ? Array(Object.keys(job.lookupFiles).length).fill(true) : [],
              lookupFilesError: job.lookupFiles ? Array(Object.keys(job.lookupFiles).length).fill(undefined) : [],
              lookupFiles: job.lookupFiles ? job.lookupFiles : [],
              mergeFilesUploadInProgress: job.mergeFiles ? Array(job.mergeFiles.length).fill(false) : [],
              mergeFilesReady: job.mergeFiles ? Array(job.mergeFiles.length).fill(true) : [],
              mergeFilesError: job.mergeFiles ? Array(job.mergeFiles.length).fill(undefined) : [],
              mergeFiles: job.mergeFiles ? job.mergeFiles : [],
              diffFileUploadInProgress: false,
              diffFileReady: job.diffFile ? true : false,
              diffFileError: undefined,
              diffFile: job.diffFile,
              filesExpected: 0,    
              filesUploaded: 0,
              useSheetNumbers: job.useSheetNumbers === true ? true : false,
              ready: true,
              entries: [],
              uploadId: job.id,
              job: job
            };

            _state.filesExpected++;
            if (_state.inputFileReady)
              _state.filesUploaded++;
            if (_state.diffFileReady) {
              _state.filesExpected++;
              _state.filesUploaded++;
            }
            _state.lookupFilesReady.map((ready) => {
              _state.filesExpected++;
              if (ready)
                _state.filesUploaded++;
              return ready;
            })
            _state.mergeFilesReady.map((ready) => {
              _state.filesExpected++;
              if (ready)
                _state.filesUploaded++;
              return ready;
            })
            _state.customFilesReady.map((ready) => {
              _state.filesExpected++;
              if (ready)
                _state.filesUploaded++;
              return ready;
            })
            _state.ready = _state.filesUploaded >=  _state.filesExpected ? true : false;

            makeRequest('get', '/api/mapper/maps')
              .then((result) => {
                if (result.data.success) {
                  var maps = result.data.maps.filter((map) => {
                    return (map.status === 'VALID');
                  });
                  _state.maps = maps;
                  if (this.props.match.params.id) {
                    var map = maps.find((_map) => {
                      return _map.id === job.mapId;
                    });

                    _this.setState({..._state});

                    if (map)
                      _this.updateSelectedMap(map);
                  }
                } 
                return;        
              }).catch((error) => {
                _this.setState({..._state});
                return;
              });    
        }
      })
      .catch((error) => {
        return;
      });       
    } else {
      makeRequest('get', '/api/mapper/maps')
      .then((result) => {
        if (result.data.success) {
          var maps = result.data.maps.filter((map) => {
            return (map.status === 'VALID');
          });
          _this.setState({maps: maps});
        } 
        return;        
      }).catch((error) => {
        return;
      });            
    }
  }
  
  selectMap(e, index, value) {
    e.preventDefault();
    var map = this.state.maps.find((_map) => {
      return _map.name === value;
    });
    
    this.updateSelectedMap(map);
  }

  handleUseSheetNumbers = (e, checked) => {
    e.preventDefault();

    this.setState({useSheetNumbers: checked});
  }

  updateSelectedMap = (map) => {
    var customFilesUploadInProgress = [];
    var customFilesReady = [];
    var customFilesError = [];
    var customFiles = [];
    var lookupFilesUploadInProgress = [];
    var lookupFilesReady = [];
    var lookupFilesError = [];
    var lookupFiles = [];
    var job = this.state.job ? this.state.job : undefined;

    var filesUploaded = 0;
    var filesExpected = 1; // input
    var i = 0;
    if (map.diffSupported && map.diffMandatory)
      filesExpected += 1; // diff file

    if (map.customFilesCount) {
      filesExpected += map.customFilesCount; // custom files
      for (i=0; i<map.customFilesCount; i++) {
        customFilesUploadInProgress.push(false);
        customFilesReady.push(job && job.customerFiles[i] ? true : false);
        customFilesError.push(undefined);
        customFiles.push(job && job.customerFiles[i] ? job.customerFiles[i] : undefined);
      }
    }

    if (map.namedlookups) {
      for (i=0; i<map.namedlookupsList.length; i++) {
        filesExpected += 1;
        lookupFilesUploadInProgress.push(false );
        lookupFilesReady.push(job && job.lookupFiles[map.namedlookupsList[i].lookupName] ? true : false);
        lookupFilesError.push(undefined);
        lookupFiles.push(job && job.lookupFiles[map.namedlookupsList[i].lookupName] ? 
                                job.lookupFiles[map.namedlookupsList[i].lookupName] : undefined);
      }
    }

    if (map.mergeFiles)
      filesExpected += 1; // merge files

    if (job) {
      if (job.inputFile)
        filesUploaded += 1;

      if (job.diffFile)
        filesUploaded += 1;

      if (job.customFiles)
        filesUploaded += job.customFiles.length;
  
      if (job.lookupFiles)
        filesUploaded += Object.keys(job.lookupFiles).length;
              
      if (job.mergeFiles)
        filesUploaded += job.mergeFiles.length;
    }      
            
    this.setState({map: map, mapId: map.id, mapName: map.name, namedlookups: map.namedlookups,
      namedlookupsList: map.namedlookupsList, 
      filesExpected: filesExpected, filesUploaded: filesUploaded,
      customFilesUploadInProgress, customFilesReady, customFilesError, customFiles,
      lookupFilesUploadInProgress, lookupFilesReady, lookupFilesError, lookupFiles,
    });
  }

  handleInputFileSelect = (e) => {
    e.preventDefault();
    if (this.state.inputFileReady)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.setState({ inputFilesUploadInProgress: true });

    var filesUploaded = this.state.filesUploaded + 1;
    var filesExpected = this.state.filesExpected;
    var lookupFilesUploadInProgress = this.state.lookupFilesUploadInProgress;
    var lookupFilesReady = this.state.lookupFilesReady;
    var lookupFilesError = this.state.lookupFilesError;
    var lookupFiles = this.state.lookupFiles;
    
    if (this.state.namedlookups) {
      for (var i=0; i<this.state.namedlookupsList.length; i++) {
        if (this.state.namedlookupsList[i].reuseSource) {
          filesUploaded += 1;
          lookupFilesUploadInProgress[i] = false;
          lookupFilesReady[i] = true;
          lookupFilesError[i] = undefined;
          lookupFiles[i] = file.name;
        }
      }
    }
    
    makeRequest('post', '/api/jobs/upload', formData, config)
      .then((result) => {
        if (result.data.success) {
          this.setState({ inputFilesUploadInProgress: false, inputFileReady: true, 
                          lookupFilesUploadInProgress, lookupFilesReady, lookupFilesError, lookupFiles,
                          filesUploaded: filesUploaded,
                          ready: filesUploaded >= filesExpected ? true : false, 
                          inputFile: result.data.inputFile });
        } else {
          this.setState({ inputFilesUploadInProgress: false, inputFileReady: false, inputFilesError: result.data.message });
        }
        return;        
      }).catch((error) => {
        this.setState({ inputFilesUploadInProgress: false, inputFileReady: false, inputFilesError: error.message });
        return;
      });
  }

  resetInput = (e) => {
    e.preventDefault();

    if (!this.state.inputFileReady)
      return;

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.state.uploadId
    };

    this.setState({ inpuFilesUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/jobs/resetinput', data)
      .then((result) => {
        if (result.data.success) {
          _this.setState({ inputFilesUploadInProgress: false, inputFileReady: false, filesUploaded: this.state.filesUploaded - 1,
                          inputFilesError: undefined, inputFile: undefined });
          window.location = '/job/' + _this.state.uploadId;
        } else {
          var error = <div>{result.data.message}<br/>Cannot reset input file!</div>;
          _this.setState({ inputFilesUploadInProgress: false, inputFileReady: false,  inputFilesError: error, abandon: true });            
        }
        return;        
      }).catch((error) => {
        _this.setState({ inputFilesUploadInProgress: false, inputFileReady: false, inputFilesError: error.message });
        return;
      });    
  }

  handleMergeFileSelect = (e) => {
    e.preventDefault();

    var index = e.target.dataset.index;
    if (index >= this.state.mergeFiles.length)
      return;
      
    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('index',index)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var _this = this;

    var filesUploaded = this.state.filesUploaded + 1;
    var filesExpected = this.state.filesExpected;
    var mergeFiles = undefined;
    var mergeFilesReady = undefined;
    var mergeFilesUploadInProgress = undefined;
    var mergeFilesError = undefined;
    
    makeRequest('post', '/api/jobs/mergefile', formData, config)
      .then((result) => {
        if (result.data.success) {
          mergeFiles = this.state.mergeFiles;
          mergeFiles[index] = file.name;
          mergeFilesReady = this.state.mergeFilesReady;
          mergeFilesReady[index] = true;
          mergeFilesUploadInProgress = this.state.mergeFilesUploadInProgress;
          mergeFilesUploadInProgress[index] = false;
          mergeFilesError = this.state.mergeFilesError;
          mergeFilesError[index] = undefined;
          _this.setState({mergeFiles, mergeFilesReady, 
                          mergeFilesUploadInProgress, mergeFilesError,
                          filesUploaded: filesUploaded,
                          ready: filesUploaded >= filesExpected ? true : false, 
              });        
        } else {
          mergeFiles = this.state.mergeFiles;
          mergeFiles[index] = file.name;
          mergeFilesReady = this.state.mergeFilesReady;
          mergeFilesReady[index] = false;
          mergeFilesUploadInProgress = this.state.mergeFilesUploadInProgress;
          mergeFilesUploadInProgress[index] = false;
          mergeFilesError = this.state.mergeFilesError;
          mergeFilesError[index] = <div>{result.data.message}</div>;
          _this.setState({ mergeFiles, mergeFilesReady, mergeFilesUploadInProgress, mergeFilesError});        
        }

        return;        
      }).catch((error) => {
        mergeFiles = this.state.mergeFiles;
        mergeFiles[index] = file.name;
        mergeFilesReady = this.state.mergeFilesReady;
        mergeFilesReady[index] = false;
        mergeFilesUploadInProgress = this.state.mergeFilesUploadInProgress;
        mergeFilesUploadInProgress[index] = false;
        mergeFilesError = this.state.mergeFilesError;
        mergeFilesError[index] = <div>{error.message}</div>;

        _this.setState({ mergeFiles, mergeFilesReady, mergeFilesUploadInProgress, mergeFilesError});        
        return;
      });
  }
  
  handleMergeReset(e) {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var _this = this;
    makeRequest('post', '/api/jobs/resetmerge', formData, config)
      .then((result) => {
        var mergeFiles = [];
        var mergeFilesReady = [];
        var mergeFilesUploadInProgress = [];
        var mergeFilesError = [];
        var filesUploaded = this.state.filesUploaded - this.state.mergeFiles.length;;
        _this.setState({ mergeFiles, mergeFilesReady, mergeFilesUploadInProgress, mergeFilesError, filesUploaded});                
      });
  }

  handleMergeFileReset(fileName, index, e) {
    e.preventDefault();

    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',fileName)
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var _this = this;
    makeRequest('post', '/api/jobs/resetmerge', formData, config)
      .then((result) => {
        var mergeFiles = this.state.mergeFiles;
        mergeFiles.splice(index, 1);
        var mergeFilesReady = this.state.mergeFilesReady;
        mergeFilesReady.splice(index, 1);
        var mergeFilesUploadInProgress = this.state.mergeFilesUploadInProgress;
        mergeFilesUploadInProgress.splice(index, 1);
        var mergeFilesError = this.state.mergeFilesError;
        mergeFilesError.splice(index, 1);
        var filesUploaded = this.state.filesUploaded-1;
        _this.setState({ mergeFiles, mergeFilesReady, mergeFilesUploadInProgress, mergeFilesError, filesUploaded});                
      });
  }

  addMergeFile = (e) => {
    e.preventDefault();

    var mergeFiles = this.state.mergeFiles;
    mergeFiles.push(undefined);
    var mergeFilesReady = this.state.mergeFilesReady;
    mergeFilesReady.push(false);
    var mergeFilesUploadInProgress = this.state.mergeFilesUploadInProgress;
    mergeFilesUploadInProgress.push(false)
    var mergeFilesError = this.state.mergeFilesError;
    mergeFilesError.push(undefined)
    this.setState({ mergeFiles, mergeFilesReady, mergeFilesUploadInProgress, mergeFilesError });
  }
  
  handleCustomFileSelect = (index, name, e) => {
    e.preventDefault();
    if (this.state.customFilesReady[index])
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('index',index)
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var customFilesUploadInProgress = this.state.customFilesUploadInProgress;
    customFilesUploadInProgress[index] = true;
    this.setState({ customFilesUploadInProgress });

    var filesUploaded = this.state.filesUploaded + 1;
    var filesExpected = this.state.filesExpected;

    makeRequest('post', '/api/jobs/uploadfile', formData, config)
      .then((result) => {
        if (result.data.success) {
          this.setState(prevState => ({ 
            customFilesUploadInProgress: {...prevState.customFilesUploadInProgress, [index]: false },
            customFilesReady: {...prevState.customFilesReady, [index]: true },
            filesUploaded: filesUploaded,
            ready: filesUploaded >= filesExpected ? true : false, 
            customFiles: result.data.inputFile }));
        } else {
          this.setState(prevState => ({ 
            customFilesUploadInProgress: {...prevState.customFilesUploadInProgress, [index]: false },
            customFilesReady: {...prevState.customFilesReady, [index]: false },
            customFilesError: {...prevState.customFilesError, [index]: result.data.message }
          }));
        }
        return;        
      }).catch((error) => {
        this.setState({ customFilesUploadInProgress: false, customFilesReady: false, customFilesError: error.message });
        return;
      });
  }

  resetCustom = (e) => {
    e.preventDefault();

    if (!this.state.customFilesReady)
      return;

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.state.designId,
      name: this.state.map.name
    };

    this.setState({ inpuFilesUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/job/resetcustom', data)
      .then((result) => {
        if (result.data.success) {
          _this.setState({ customFilesUploadInProgress: false, customFilesReady: false, filesUploaded: this.state.filesUploaded - 1,
                          customFilesError: undefined, customFiles: undefined });
          window.location = '/job/' + _this.state.uploadId;
        } else {
          var error = <div>{result.data.message}<br/>Cannot reset custom file!</div>;
          _this.setState({ customFilesUploadInProgress: false, customFilesReady: false,  customFilesError: error, abandon: true });            
        }
        return;        
      }).catch((error) => {
        _this.setState({ customFilesUploadInProgress: false, customFilesReady: false, customFilesError: error.message });
        return;
      });    
  }
  
  handleDiffFileSelect = (e) => {
    e.preventDefault();
    if (this.state.diffFileReady)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.setState({ diffFileUploadInProgress: true });

    var filesUploaded = this.state.filesUploaded + 1;
    var filesExpected = this.state.filesExpected;

    makeRequest('post', '/api/jobs/uploaddiff', formData, config)
      .then((result) => {
        if (result.data.success) {
          this.setState({ diffFileUploadInProgress: false, diffFileReady: true, filesUploaded: filesUploaded,
            ready: filesUploaded >= filesExpected ? true : false,
            diffFile: result.data.inputFile });
        } else {
          this.setState({ diffFileUploadInProgress: false, diffFileReady: false, diffFileError: result.data.message });
        }
        return;        
      }).catch((error) => {
        this.setState({ diffFileUploadInProgress: false, diffFileReady: false, diffFileError: error.message });
        return;
      });
  }

  resetDiff = (e) => {
    e.preventDefault();

    if (!this.state.diffFileReady)
      return;

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.state.designId,
      name: this.state.map.name
    };

    this.setState({ inpuFilesUploadInProgress: true });

    var _this = this;
    makeRequest('post', '/api/job/resetdiff', data)
      .then((result) => {
        if (result.data.success) {
          _this.setState({ diffFileUploadInProgress: false, diffFileReady: false, filesUploaded: this.state.filesUploaded - 1,
                          diffFileError: undefined, diffFile: undefined });
          window.location = '/job/' + _this.state.uploadId;
        } else {
          var error = <div>{result.data.message}<br/>Cannot reset diff file!</div>;
          _this.setState({ diffFileUploadInProgress: false, diffFileReady: false,  diffFileError: error, abandon: true });            
        }
        return;        
      }).catch((error) => {
        _this.setState({ diffFileUploadInProgress: false, diffFileReady: false, diffFileError: error.message });
        return;
      });    
  }  
  
  handleLookupFileSelect = (lookupIndex, lookupName, e) => {
    e.preventDefault();
    if (this.state.lookupFilesReady && this.state.lookupFilesReady[lookupName])
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    formData.append('id',this.state.uploadId)
    formData.append('mapId',this.state.mapId)
    formData.append('lookupName',lookupName)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var lookupFilesUploadInProgress = this.state.lookupFilesUploadInProgress;
    var lookupFilesReady = this.state.lookupFilesReady;
    var lookupFilesError = this.state.lookupFilesError;
    var lookupFiles = this.state.lookupFiles;

    lookupFilesUploadInProgress[lookupIndex] = true;
    this.setState({lookupFilesUploadInProgress});
  
    var filesUploaded = this.state.filesUploaded + 1;
    var filesExpected = this.state.filesExpected;
    
    var _this = this;
    makeRequest('post', '/api/jobs/uploadlookup', formData, config)
      .then((result) => {
        if (result.data.success) {
          lookupFilesUploadInProgress[lookupIndex] = false;
          lookupFilesReady[lookupIndex] = true;
          lookupFiles[lookupIndex] = result.data.inputFile;
          lookupFilesError[lookupIndex] = '';
          _this.setState({ lookupFilesUploadInProgress, lookupFilesReady, 
                            filesUploaded: filesUploaded, ready: filesUploaded >= filesExpected ? true : false, 
                            lookupFiles });
        } else {
          lookupFilesUploadInProgress[lookupIndex] = false;
          lookupFilesReady[lookupIndex] = false;
          lookupFilesError[lookupIndex] = result.data.message;
          _this.setState({ lookupFilesUploadInProgress, lookupFilesReady, lookupFilesError });
        }
        return;        
      }).catch((error) => {
        lookupFilesUploadInProgress[lookupIndex] = false;
        lookupFilesReady[lookupIndex] = false;
        lookupFilesError[lookupIndex] = error.message;
        _this.setState({ lookupFilesUploadInProgress, lookupFilesReady, lookupFilesError });
        return;
      });
  }

  resetLookup = (e) => {
    e.preventDefault();

    var lookupName = e.currentTarget.dataset.lookupName;
    var lookupIndex = e.currentTarget.dataset.index;
    if (!this.state.lookupFilesReady || !this.state.lookupFilesReady[lookupIndex])
      return;

    var user = sessionStorage.getItem('user');

    const data = {
      user: user,
      id: this.state.designId,
      name: this.state.map.name,
      lookupName: lookupName,
    };

    var lookupFilesUploadInProgress = this.state.lookupFilesUploadInProgress;
    var lookupFilesReady = this.state.lookupFilesReady;
    var lookupFilesError = this.state.lookupFilesError;
    var lookupFiles = this.state.lookupFiles;

    lookupFilesUploadInProgress[lookupIndex] = true;
    this.setState({lookupFilesUploadInProgress});

    var filesUploaded = this.state.filesUploaded - 1;
    var filesExpected = this.state.filesExpected;

    var _this = this;
    makeRequest('post', '/api/job/resetlookup', data)
      .then((result) => {
        if (result.data.success) {
          lookupFilesUploadInProgress[lookupIndex] = false;
          lookupFilesReady[lookupIndex] = false;
          lookupFiles[lookupIndex] = undefined;
          lookupFilesError[lookupIndex] = undefined;
          _this.setState({ lookupFilesUploadInProgress, lookupFilesReady, filesUploaded,
            ready: filesUploaded >= filesExpected ? true : false, 
            lookupFiles });
          window.location = '/job/' + _this.state.uploadId;
        } else {
          lookupFilesUploadInProgress[lookupIndex] = false;
          lookupFilesReady[lookupIndex] = false;
          var error = <div>{result.data.message}<br/>Cannot reset lookup file!</div>;
          lookupFilesError[lookupIndex] = error;

          _this.setState({ lookupFilesUploadInProgress, lookupFilesReady,  lookupFilesError });            
        }
        return;        
      }).catch((error) => {
        lookupFilesUploadInProgress[lookupIndex] = false;
        lookupFilesReady[lookupIndex] = false;
        lookupFilesError[lookupIndex] = error.message;
        _this.setState({ lookupFilesUploadInProgress, lookupFilesReady, lookupFilesError });
        return;
      });    
  }

  start = (e) => {
    e.preventDefault();
    var action = e.currentTarget.innerText;
    if (action === 'NEW UPLOAD')
      this.abortAndStartNew();
    else if (action === 'SUBMIT') {
      const data = {id: this.state.uploadId, name: this.state.mapName, useSheetNumbers: this.state.useSheetNumbers};

      makeRequest('post', '/api/jobs/submit', data);
      window.location = '/jobs';
    }
  }

  abortAndStartNew() { 
    this.setState({ newConfirm: true});
  }

  processStartNew = (action, checked, args) => {
    if (action === 'YES') {
      window.location = '/job';
    } else if (action === 'NO') {
      this.setState({newConfirm: false})
    }
  }


  regularMapName = (name) => {
    return <span style={{fontWeight: 'bold'}}>{name}</span>;
  }

  chainedMapName = (name) => {
    return (
      <span style={{fontWeight: 'normal', fontStyle: 'italic'}}>
        <span style={{paddingRight: 20}} role="img" aria-label="Snowman">&#128279;</span>
        {name}
      </span>
    );
  }

  buildMapMenu = (maps) => {
    var items = [];

    var resultMaps = maps.filter((map) => { return !map.chained || !map.chained.length});
    resultMaps.map((_map) => {
      items.push(<MenuItem key={uuidv4()} value={_map.name} primaryText={this.regularMapName(_map.name)}  />);
      if (_map.chainMaps) {
        _map.chainedMaps.map((_chainedMap) => {
          items.push(<MenuItem key={uuidv4()} value={_chainedMap.name} primaryText={this.chainedMapName(_chainedMap.name)}  />);
          return _chainedMap;
        })
      }

      return _map;
    });

    return items;
  }

  render() {    
    var lookups = [];
    var customs = [];

    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60, padding: 20, }}>
            <div style={{ fontSize: '18px', fontWeight: 900 }}>New Job</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', height: 60 }}>
                <div onClick={e => this.start(e)}>
                  <label {...Styles.importButtonStyle}  >
                    {this.state.ready ? 'SUBMIT' : 'NEW UPLOAD'}
                  </label>
                </div>
              </div>
            </div>                      
          </div>

          {this.state.newConfirm && 
            <div style={{ display: 'flex', flexDirection: 'row', padding: 10, fontSize: '14px', fontWeight: 'bold', 
                  alignItems: 'center', color: '#e0e0e0' }}>
              <DialogModal 
                style={{display: 'inline'}}
                needYes={true}
                needNo={true}
                open={true}
                title={"Abort job"}
                handleAction={this.processStartNew}
                content={'Are you sure you want to abort the current changes and start a new job?'}
              />
            </div>
          }
    
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20, paddingTop: 3,
                          overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            padding: 10, paddingBottom: 40, marginBottom: 10, 
                            background: 'white', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Choose Mapper:</div>
                <div style={{flex: 0.5}}>
                  <SelectField 
                    errorText={'Choose a map'}
                    errorStyle={{color: 'unset'}}
                    autoWidth={true}
                    fullWidth={true}
                    style={{width: 400}}
                    floatingLabelText="Mapper"
                    value={this.state.mapName}
                    onChange={this.selectMap.bind(this)}
                  >
                    {this.buildMapMenu(this.state.maps)}
                  </SelectField>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', paddingBottom: 20 }}>Use Sheet position instead of names</div>
                <div>
                  <Checkbox
                    iconStyle={{fill: root.switchStyleFillColor}}
                    label="Use Sheet numbers"
                    labelStyle={{fontWeight: 900}}
                    checked={this.state.useSheetNumbers === true ? true : false}
                    onCheck={this.handleUseSheetNumbers}
                    />  
                </div>            
              </div>
            </div>

            {this.state.mapName && 
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
              <div style={{padding: 10, paddingTop: 40, paddingBottom: 20, marginBottom: 10, 
                          boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
                <JobFileUpload 
                  info={"Upload input file for mapping"}
                  abandon={this.state.abandon}
                  fileReady={this.state.inputFileReady}
                  htmlFor={"inputfile"}
                  file={this.state.inputFile}
                  mode={"input"}
                  index={-1}
                  fileUploadInProgress={this.state.inputFilesUploadInProgress}
                  fileError={this.state.inputFilesError}
                  handleFileSelect={this.handleInputFileSelect.bind(this)}
                  handleFileReset={this.resetInput.bind(this)}
                />
              </div>
            </div>}    

            {this.state.mapName && this.state.map.diffSupported &&
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
              <div style={{padding: 10, paddingTop: 40, paddingBottom: 20, marginBottom: 10, 
                          boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
                <JobFileUpload 
                  info={"Upload last loaded data file in mapped output format for for diff processing"}
                  abandon={this.state.abandon}
                  fileReady={this.state.diffFileReady}
                  htmlFor={"difffile"}
                  file={this.state.diffFile}
                  mode={"diff"}
                  index={-1}
                  fileUploadInProgress={this.state.diffFileUploadInProgress}
                  fileError={this.state.diffFileError}
                  handleFileSelect={this.handleDiffFileSelect.bind(this)}
                  handleFileReset={this.resetDiff.bind(this)}
                />
              </div>
            </div>}      

            {this.state.mapName && this.state.map.diffSupported && this.state.map.customFilesCount > 0 &&
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
              {this.state.customFilesReady.forEach((fileReady, index) => {
                customs.push (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                    <div style={{padding: 10, paddingTop: 40, paddingBottom: 20, marginBottom: 10, 
                                boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
                      <JobFileUpload 
                        info={"Upload additinal data file for custom processing"}
                        abandon={this.state.abandon}
                        fileReady={this.state.customFilesReady[index]}
                        htmlFor={"customfile"}
                        file={this.state.customFiles[index]} 
                        mode={"custom"}
                        index={index}
                        fileUploadInProgress={this.state.customFilesUploadInProgress[index]}
                        fileError={this.state.customFilesError[index]}
                        handleFileSelect={this.handleCustomFileSelect.bind(this)}
                        handleFileReset={this.resetCustom.bind(this)}
                      />
                    </div>
                  </div>);
              })}
            </div>}
            {customs}

            {this.state.mapName && this.state.map.namedlookups && 
              this.state.map.namedlookupsList !== undefined && this.state.map.namedlookupsList.length > 0 &&
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
              {this.state.namedlookupsList.map((namedLookup, lookupIndex) => {
                lookups.push (
                  <div key={namedLookup.lookupName+'-'+lookupIndex} 
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                    <div style={{padding: 10, paddingTop: 40, paddingBottom: 20, marginBottom: 10, 
                                boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
                      <JobFileUpload 
                        info={"Upload named lookup data file for processing"}
                        abandon={this.state.abandon}
                        fileReady={this.state.lookupFilesReady[lookupIndex]}
                        htmlFor={namedLookup.lookupName}
                        file={this.state.lookupFiles[lookupIndex]} 
                        mode={"lookup"}
                        index={lookupIndex}
                        name={namedLookup.lookupName + (namedLookup.reuseSource ? ' (Reuse Source) ': '')}
                        fileUploadInProgress={this.state.lookupFilesUploadInProgress[lookupIndex]}
                        fileError={this.state.lookupFilesError[lookupIndex]}
                        handleFileSelect={this.handleLookupFileSelect.bind(this)}
                        handleFileReset={this.resetLookup.bind(this)}
                        disabled={namedLookup.reuseSource === true ? true : false}
                      />
                    </div>
                  </div>);
                return '';
              })}
            </div>}
            {lookups}

            {this.state.mapName && this.state.map.mergeFiles &&
            <div style={{padding: 10, paddingTop: 20, paddingBottom: 40, marginBottom: 10, 
                          boxShadow: 'rgba(0, 0, 0, 0.15) 2px 2px 4px 2px'}}> 
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <div style={{ width: '60%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Merge Files 
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                        onClick={this.handleMergeReset.bind(this)} />
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>
                      Consolidate data in one or more excel files
                    </div>
                  </div>
                  <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
                    <div style={{ marginTop: 20}} onClick={e => this.addMergeFile(e)}>
                      <label {...Styles.importButtonStyle}  >ADD FILE </label>
                    </div>
                  </div>                
                </div>
                {this.state.map.mergeFiles && this.state.mergeFiles &&
                  this.state.mergeFiles.length > 0 &&
                <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', flexDirection: 'row', marginTop: 24}}>
                  {this.state.mergeFiles.map((mergeFile, mindex) => 
                  <div key={uuidv4()} style={{ width: '28%', display: 'flex', flexDirection: 'column', justifyContent: 'left', 
                                alignItems: 'flex-start', padding: 16, marginRight: 8, marginBottom: 8, 
                                border: '1px dotted ' + root.dottedBorderColor}}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Merge Source [{mindex+1}] </div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                        onClick={this.handleMergeFileReset.bind(this, mergeFile, mindex)} />
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'left', width: '100%'}}>
                      <MergeFileUpload 
                        fileReady={this.state.mergeFilesReady[mindex]}
                        index={mindex}
                        marginTop={32}
                        // marginBottom={-24}
                        file={mergeFile}
                        fileUploadInProgress={this.state.mergeFilesUploadInProgress[mindex]}
                        fileError={this.state.mergeFilesError[mindex]}
                        handleFileSelect={this.handleMergeFileSelect}
                      />
                    </div>
                    
                  </div>)}
                </div>}
              </div>
            </div>}
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
    withRouter
)(UploadContainer);
