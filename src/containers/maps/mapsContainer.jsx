import React from 'react';
import { withRouter } from 'react-router-dom';
import FlexTable from '../../components/flexTable';
import {Tabs, Tab} from 'material-ui/Tabs';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MapRow from './components/mapRow';
import FileUpload from '../../components/fileUpload';
import DialogModal from '../../components/dialog';

import { root } from '../../assets/variable';
import * as styles from './styles';

const { makeRequest } = require("../../utils/requestUtils");

class MapsContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      maps: [],
      sharedMaps: [],
      deleteConfirm: false,
      deleteChained: false,
      deleteId: undefined,
      selected: 0,
      importError: undefined,
      initialIndex: props.match.params.tab && props.match.params.tab === 'shared' ? 1 : 0      
    };
  }

  componentDidMount() {
    makeRequest('get', '/api/mapper/maps')
      .then((result) => {
        if (result.data.success) {
          this.setState({loaded: true, maps: result.data.maps, sharedMaps: result.data.sharedMaps });
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
  
  import = (e) => {
    e.preventDefault();
    this.setState({importInProgress: true});
  }

  start = (e) => {
    e.preventDefault();
    var action = e.currentTarget.innerText;
    if (action === 'START NEW') {
      window.location.reload();
    }
  }

  cloneMap = (e) => {
    makeRequest('post', '/api/mapper/clonemap', {id: e.currentTarget.dataset.id})
      .then((result) => {
        this.reload();
      }).catch((error) => {
        this.reload();
      });    
  }
  
  toggleShare = (e) => {
    var id = e.currentTarget.dataset.id;

    makeRequest('post', '/api/mapper/toggleshare', {id})
      .then((result) => {
        this.reload();
      }).catch((error) => {
        this.reload();
      });        
  }
  
  exportMap = (e) => {
    var id = e.currentTarget.dataset.id;
    window.location = '/api/mapper/export?id='+id+'&token='+sessionStorage.getItem('user');  
  }

  deleteMapWithConfirmation = (e) => {
    this.setState({deleteId: [ e.currentTarget.dataset.id ], deleteMapName: e.currentTarget.dataset.mapname, 
                  deleteConfirm: true, deleteChained: e.currentTarget.dataset.mapchained === "true"})
    window.scrollTo(0, 0)
  }

  deleteSelected = (e) => {
    var selected = [];
    this.state.maps.map((map) => {
      if (map.selected)
        selected.push(map.id);
      return map;
    })
    this.setState({deleteId: selected, deleteConfirm: true})
    window.scrollTo(0, 0)
  }

  handleRowSelect = (e, checked) => {
    var index = e.currentTarget.dataset.index;
    var maps = this.state.maps;
    maps[index].selected = checked;
    var selected = this.state.selected;
    selected += checked ? 1 : -1;
    this.setState({maps, selected})
  }

  selectAllRows = (checked) => {
    var maps = this.state.maps;

    maps.map((map) => {
      map.selected = checked;
      return map;
    })
    var selected = checked ? maps.length : 0;
    this.setState({maps, selected})
  }

  deleteMap = () => {
    if (!this.state.deleteId) {
      this.setState({deleteConfirm: false, deleteId: undefined});
      return;
    }

    makeRequest('post', '/api/mapper/deletemap', {ids: this.state.deleteId, deleteChained: this.state.deleteChained})
      .then((result) => {
        if (result.data.success === false) {
          var error = <div>Operation failed: <br/>{result.data.message}</div>;
          this.setState({deleteConfirm: false, deleteId: undefined, importError: error});            
          return;
        }
        this.reload();
        this.setState({deleteConfirm: false, deleteId: undefined});
      }).catch((error) => {
        this.setState({deleteConfirm: false, deleteId: undefined});
      });    
  }
  
  deleteConfirm = (action, checked, args) => {    
    if (action === 'YES')
      this.deleteMap();
    else
      this.setState({deleteConfirm: false, deleteId: undefined});    
  }  

  unchainMap = (e) => {
    var id = e.currentTarget.dataset.id;
    var mapId = e.currentTarget.dataset.mapId;

    makeRequest('post', '/api/mapper/unchainmap', {id, mapId})
      .then((result) => {
        this.reload();
      }).catch((error) => {
        this.reload();
      });        
  }
  
  handleMapFileSelect = (e) => {
    e.preventDefault();

    if (this.state.mapFileReady)
      return;

    var file = e.target.files[0];
    var user = sessionStorage.getItem('user');

    const formData = new FormData();
    formData.append('file',file)
    formData.append('user',user)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    var _this = this;
    makeRequest('post', '/api/mapper/import', formData, config)
      .then((result) => {
        if (result.data.success) {
          _this.setState({ importError: undefined});            
          this.reload();
        } else {
          var error = <div>Operation failed: <br/>Import failed with error: {result.data.message}</div>;
          _this.setState({ importError: error});            
        }
        return;        
      }).catch((error) => {
        _this.setState({ importError: error.message });
        return;
      });
  }

  render() {    
    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                      overflowY: 'scroll', background: 'white', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.15)' }}>
          {this.state.importError &&
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between'}}>
            <div style={{ color: 'red'}}>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                <div><i>{this.state.importError}</i></div>
              </div>
            </div>    
          </div>}
          
          {this.state.deleteConfirm && 
          <div style={{ display: 'flex', flexDirection: 'row', padding: 10, fontSize: '14px', fontWeight: 'bold', 
                    alignItems: 'center', color: '#e0e0e0' }}>
            <DialogModal 
              style={{display: 'inline'}}
              needYes={true}
              needNo={true}
              open={true}
              title={"Delete Map"}
              handleAction={this.deleteConfirm}
              needCheckboxes={['chainedMaps']}
              content={this.state.selected > 0 ?
                'Will result in deletion of jobs associated with the maps, are you sure you want to delete selected maps?' :
                'Will result in deletion of jobs associated with the map, are you sure you want to delete map ' + this.state.deleteMapName + '?'}
            />
          </div>}      

          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                          overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>Maps </div>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>
                <div onClick={e => this.refresh(e)}>
                  <label {...styles.importButtonStyle}  > REFRESH </label>
                </div>            
              </div>
            </div>
            
            <Tabs style={{whiteSpace: 'unset'}} initialSelectedIndex={this.state.initialIndex}
                  inkBarStyle={styles.inkBarStyle} tabItemContainerStyle={styles.tabItemContainerStyle}>
              <Tab key={'owned'} label={'My Maps'}>        
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', 
                            overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                  <div style={{ padding: 20}}>
                    <FileUpload 
                      info={"Import an exported mapper design gzip file"}
                      htmlFor={"newfile"}
                      mode={"map"}
                      fileUploadInProgress={this.state.mapFileUploadInProgress}
                      fileError={this.state.mapFileError}
                      handleFileSelect={this.handleMapFileSelect}
                    />
                  </div>

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
                    selectedAll={this.state.selected > 0 && this.state.selected === this.state.maps.length}
                    selectAllRows={this.selectAllRows}
                    data={this.state.maps}
                    columns={[
                      { name: 'NAME', width: 0.4, style: styles.headerColumnContainer },
                      { name: 'FILES', width: 0.4, style: styles.headerColumnContainer },
                      { name: 'ACTION', width: 0.2, style: styles.headerColumnContainer },
                    ]}
                    rowComponent={MapRow}
                    rowProps={{
                      reload: this.reload,
                      deleteMapWithConfirmation: this.deleteMapWithConfirmation,
                      cloneMap: this.cloneMap,
                      toggleShare: this.toggleShare,
                      exportMap: this.exportMap,
                      unchainMap: this.unchainMap,
                      handleRowSelect: this.handleRowSelect,
                      maps: this.state.maps
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
                      title: 'Loading maps data...',
                      message: 'You could have some ☕ while we load your data!'
                    }}
                  />
                </div>
              </Tab>
              <Tab key={'shared'} label={'Shared Maps'}>
                <div>    
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 20,
                              overflowY: 'scroll', background: 'white', border: root.regularBorderColor + ' 2px 2px 4px 2px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60 }}>
                      <div style={{ fontSize: '18px', fontWeight: 900 }}>Maps </div>
                    </div>

                    <FlexTable
                      showSelectAll={false}
                      data={this.state.sharedMaps}
                      columns={[
                        { name: 'NAME', width: 0.4, style: styles.headerColumnContainer },
                        { name: 'FILES', width: 0.4, style: styles.headerColumnContainer },
                        { name: 'ACTION', width: 0.2, style: styles.headerColumnContainer },
                      ]}
                      rowComponent={MapRow}
                      rowProps={{
                        reload: this.reload,
                        deleteMapWithConfirmation: this.deleteMapWithConfirmation,
                        cloneMap: this.cloneMap,
                        exportMap: this.exportMap
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
                        title: 'Loading maps data...',
                        message: 'You could have some ☕ while we load your data!'
                      }}
                    />
                  </div>
                </div>   
              </Tab>
            </Tabs>   
          </div>             
        </div>   
      </MuiThemeProvider> 
    );
  }
}

export default withRouter(MapsContainer);
