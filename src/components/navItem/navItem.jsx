import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'glamor';
import Constants from '../../constants';
import * as styles from './styles';

export default class navItem extends React.Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    currentPath: PropTypes.string.isRequired,
    urlPath: PropTypes.string.isRequired,
    push: PropTypes.func.isRequired
  }

  state = {
    icon: null
  }

  componentWillMount() {
    const { path } = this.props;
    this.setState({ icon: Constants.imagePaths[path] });
  }

  render() {
    const { icon } = this.state;
    const { label, push, urlPath, noMargin } = this.props;
    const selected = this.props.urlPath.split('/')[1] === this.props.currentPath.split('/')[1];
                      //  || (this.props.currentPath !== 'jobs' && this.props.currentPath.startsWith(this.props.urlPath));
    return (
      <div onClick={() => push(urlPath)} className={css(selected ? styles.selected : styles.rootContainer)}>
        <img src={icon} alt={'home'} style={{ marginBottom: noMargin === false ? 'unset' : '10px' }} />
        <div style={{textAlign: 'center'}}>{label}</div>
      </div>
    );
  }
}
