import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './styles';

const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default class MergeFileUpload extends React.Component {
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
                    htmlFor={'merge-'+this.props.index}>
              {this.props.fileReady ? 'FILE LOADED' : 'UPLOAD'}
            </label>
            <input
              name={'merge-'+this.props.index}
              id={'merge-'+this.props.index}
              type="file"
              disabled={this.props.fileReady}
              accept={excelFileType}
              style={{ visibility: 'hidden' }}
              ref={(input) => { this.fileInput = input; }}
              data-index={this.props.index}
              onChange={this.onSelect}
            />
            {this.props.fileReady &&
              <div>Merge File:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>{this.props.file}</span></div>
            }
            {!this.props.fileReady && !this.props.fileUploadInProgress &&
              <div style={{marginTop: 16}}>Merge File:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}></span></div>
            }
            {this.props.fileUploadInProgress &&
              <div>Merge File:<br/> <span style={{marginTop: 5, fontSize: 13, fontWeight: 'bold'}}>Upload in progress...</span></div>
            }
          </div>
        </div>
        {this.props.fileError &&
          <div style={{ height: 60, fontSize: '10px', fontWeight: 'bold', color: 'red'}}>{this.props.fileError} </div>
        }
      </div>
    );
  }
}