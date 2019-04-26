import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './styles';

const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const del = require('../../assets/svg/ic_delete.svg');
const excel = require('../../assets/svg/ic_excel.png');

export default class JobFileUpload extends React.Component {
  static propTypes = {
    info: PropTypes.string.isRequired,
    htmlFor: PropTypes.string.isRequired,
    handleFileSelect: PropTypes.func.isRequired,
  }             
  
  onSelect = (e) => {
    if (this.props.mode === 'lookup')
      this.props.handleFileSelect(this.props.index, this.props.name, e);
    else
      this.props.handleFileSelect(e);
  }

  downloadLookupSample = (e) => {
    e.preventDefault();
    window.location = '/api/jobs/downloadlookuptemplate?token='+sessionStorage.getItem('user');  
  }
  
  render() {
    const { handleFileReset } = this.props;
    return (
      <div>
        <div disabled={this.props.disabled ? true : false} 
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60, 
                      marginTop: this.props.marginTop ? this.props.marginTop : ''}}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'left'}}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              Upload {this.props.mode === 'custom' ? ' supporting ' : this.props.mode} excel{this.props.name ? ': ' + this.props.name : ''}
              {this.props.mode === 'custom' ? ' for custom processing' : ''}
              {this.props.mode === 'custom' ? ' ['+(this.props.index+1)+']' : ''}
              {handleFileReset &&
              <img src={del} data-index={this.props.index} data-name={this.props.name}
                    style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'del'} 
                onClick={handleFileReset} />}                          
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#2e3b428c' }}>{this.props.info}</div>
          </div>
          
          <div disabled={this.props.fileReady || this.props.abandon || this.props.disabled}
               style={{width: '20%'}} >
            <label className={this.props.fileReady ? 
                                this.props.disabled === true ? Styles.disabledImportedButtonStyle : Styles.importedButtonStyle :
                                this.props.disabled === true ? Styles.disabledImportButtonStyle : Styles.importButtonStyle}
                    htmlFor={this.props.htmlFor}>
              {this.props.fileReady ? 'FILE LOADED' : 'UPLOAD'}
            </label>
            <input
              name={this.props.htmlFor}
              id={this.props.htmlFor}
              type="file"
              disabled={this.props.fileReady || this.props.abandon || this.props.disabled}
              accept={excelFileType}
              style={{ visibility: 'hidden'  }}
              ref={(input) => { this.fileInput = input; }}
              onChange={this.onSelect.bind(this)}
            />
            {this.props.fileReady &&
              <div style={{marginTop: 10}}>{this.props.file}</div>
            }
            {this.props.fileUploadInProgress &&
              <div style={{marginTop: 10}}>Upload in progress...</div>
            }
          </div>
        </div>
        {this.props.htmlFor === "lookupfile" &&
          <div style={{ display: 'flex', alignItems: 'flex-start', height: 60, fontSize: '10px', fontWeight: 'bold'}}>
            Download named lookup template 
            <img src={excel} style={{ width: '15px', paddingLeft: 15, cursor: 'pointer' }} alt={'download sample'} 
              onClick={e => this.downloadLookupSample(e)} />
          </div>
        }
        {this.props.fileError && 
          <div style={{ height: 60, fontSize: '10px', fontWeight: 'bold', color: 'red'}}>File upload failed: {this.props.fileError} </div>
        }
      </div>
    );
  }
}
