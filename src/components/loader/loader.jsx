import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';
import * as styles from './styles';

export default class LoaderPage extends Component {
  static propTypes = {
    show: PropTypes.bool
  };
  static defaultProps = {
    show: false
  };

  render() {
    return (
      this.props.show && <div {...styles.outerContainer}>
        <div {...styles.innerContainer} id="loaderDiv">
          <center>
            <strong {...styles.messageText}>
              Please wait...
            </strong>
            <br />
            <BeatLoader margin="10px 2px 2px 2px" />
          </center>
        </div>
      </div>
    );
  }
}
