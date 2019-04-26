import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import PropTypes from 'prop-types';
import { root } from '../../assets/variable';
import * as Styles from './styles';

const jsonFileType = 'application/json';
const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const gzipFileType = 'application/x-gzip, application/zip';
const del = require('../../assets/svg/ic_delete.svg');

export default class FileUpload extends React.Component {
  static propTypes = {
    info: PropTypes.string.isRequired,
    htmlFor: PropTypes.string.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
  }             
  
  onSelect = (e) => {
    this.props.handleFileSelect(e);
  }
  
  render() {
    const { handleReuseSourceFile, handleFileReset } = this.props;
    
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60, 
                      marginTop: this.props.marginTop ? this.props.marginTop : '' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              Upload {this.props.mode} {(this.props.mode === 'map' || this.props.mode === 'generator') ? 'gzip' : 'Excel'} 
              {handleFileReset &&
              <img src={del} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                onClick={handleFileReset} />}                          
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>{this.props.info}</div>
          </div>
          
          <div style={{width: '20%'}} disabled={this.props.fileReady || this.props.abandon}>
            <label className={this.props.fileReady ? Styles.importedButtonStyle : Styles.importButtonStyle} htmlFor={this.props.htmlFor}>
              {this.props.mode === 'map' ? 'IMPORT' : this.props.fileReady ? 'FILE LOADED' : 'UPLOAD'}
            </label>
            <input
              name={this.props.htmlFor}
              id={this.props.htmlFor}
              type="file"
              disabled={this.props.fileReady || this.props.abandon || this.props.reuseSourceFile}
              accept={this.props.mode === 'map' ? gzipFileType : 
                        this.props.mode === 'generator' ? jsonFileType : excelFileType}
              style={{ visibility: 'hidden' }}
              ref={(input) => { this.fileInput = input; }}
              onChange={this.onSelect}
            />
            {this.props.fileReady &&
              <div style={{marginTop: 5, fontSize: 10, fontWeight: 'bold'}}>{this.props.file}</div>
            }
            {this.props.fileUploadInProgress &&
              <div style={{marginTop: 5, fontSize: 10, fontWeight: 'bold'}}>Upload in progress...</div>
            }
          </div>
        </div>
        {handleReuseSourceFile &&
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <div/>
          <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
            <Checkbox
              iconStyle={{fill: root.switchStyleFillColor}}
              label="Reuse source file"
              labelStyle={{fontWeight: 900}}
              checked={this.props.reuseSource }
              onCheck={handleReuseSourceFile}
            />
          </div>
        </div>}
        {this.props.fileError &&
          <div style={{ height: 60, fontSize: '10px', fontWeight: 'bold', color: 'red'}}>
            File upload failed: {this.props.fileError} <br/>
            Reset {this.props.mode} file and try uploading again!<br/>
          </div>
        }
      </div>
    );
  }
}
