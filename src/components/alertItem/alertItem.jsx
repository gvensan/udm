import React from 'react';
import _ from 'lodash';
import { css } from 'glamor';
import PropTypes from 'prop-types';
import { notificationTypes } from '../../constants';
import * as Styles from './styles';

const doneIcon = require('../../assets/svg/ic_done.svg');
const errorIcon = require('../../assets/svg/ic_error.svg');
const warningIcon = require('../../assets/svg/ic_warning.svg');

export default class AlertItem extends React.Component {
  static propTypes = {
    alertObject: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
      expiresIn: PropTypes.number,
      type: PropTypes.string
    }).isRequired,
    icon: PropTypes.string.isRequired,
    band: PropTypes.shape({}).isRequired,
    removeAlert: PropTypes.func.isRequired
  }

  state = {
    timerID: ''
  }

  componentWillMount() {
    const timerID = setTimeout(this.destroyNotification, _.get(this.props, 'alertObject.expiresIn', 5000));
    this.setState({ timerID });
  }

  componentWillUnmount() {
    clearTimeout(this.state.timerID);
  }

  getIcon = () => {
    const { type } = this.props.alertObject;
    let icon;
    switch (type) {
      case notificationTypes.success:
        icon = doneIcon;
        break;
      case notificationTypes.error:
        icon = errorIcon;
        break;
      case notificationTypes.warning:
        icon = warningIcon;
        break;
      default:
        icon = doneIcon;
    }
    return icon;
  }

  getStyle = () => {
    const { type } = this.props.alertObject;
    let style;
    switch (type) {
      case notificationTypes.success:
        style = Styles.bandSuccess;
        break;
      case notificationTypes.error:
        style = Styles.bandError;
        break;
      case notificationTypes.warning:
        style = Styles.bandWarning;
        break;
      default:
        style = Styles.bandNormal;
    }
    return style;
  }

  destroyNotification = () => {
    this.props.removeAlert(_.get(this.props.alertObject, 'id', ''));
  }

  render() {
    const { alertObject } = this.props;
    const { title, message } = alertObject;
    const icon = this.getIcon();
    const style = this.getStyle();
    return (
      <div className={css(Styles.base, style, !title && Styles.band)}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          {
            icon
              ? <div {...Styles.iconContainer}>
                <img src={icon} alt={'icon'} className={css(Styles.icon)} />
              </div>
              : null
          }
          <div {...Styles.bodyContainer}>
            {title && <div {...Styles.titleStyle}>{title}</div>}
            <div className={css(title ? Styles.bodyStyle : Styles.bandMessage)}>{message}</div>
          </div>
        </div>
      </div>
    );
  }
}
