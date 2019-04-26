import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './styles';

const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default class LookupFileUpload extends React.Component {
  static propTypes = {
    handleFileSelect: PropTypes.func.isRequired,
  }             
  
  onSelect = (e) => {
    this.props.handleFileSelect(e);
  }
  
  render() {
   return (
      <div style={{ marginTop: this.props.marginTop ? this.props.marginTop : '',
                    marginBottom: this.props.marginBottom ? this.props.marginBottom : ''}}  >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: 60}}>
          <div disabled={this.props.fileReady || this.props.abandon}>
            <label className={this.props.fileReady ? Styles.importedButtonStyle : Styles.importButtonStyle} 
                    htmlFor={'lookup-'+this.props.index}>
              {this.props.fileReady ? 'FILE LOADED' : 'UPLOAD'}
            </label>
            <input
              name={'lookup-'+this.props.index}
              id={'lookup-'+this.props.index}
              type="file"
              disabled={this.props.fileReady || this.props.abandon || this.props.reuseSourceFile}
              accept={excelFileType}
              style={{ visibility: 'hidden' }}
              ref={(input) => { this.fileInput = input; }}
              data-index={this.props.index}
              onChange={this.onSelect}
            />
            {this.props.fileReady &&
              <div>Lookup Source:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>{this.props.file}</span></div>
            }
            {!this.props.fileReady && !this.props.fileUploadInProgress &&
              <div style={{marginTop: 16}}>Lookup Source:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}></span></div>
            }
            {this.props.fileUploadInProgress &&
              <div>Lookup Source:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>Upload in progress...</span></div>
            }
          </div>
        </div>
        {this.props.fileError &&
          <div style={{ height: 60, fontSize: '10px', fontWeight: 'bold', color: 'red'}}>Upload failed: {this.props.fileError} </div>
        }
      </div>
    );
  }
}