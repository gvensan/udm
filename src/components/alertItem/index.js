import { compose, withProps } from 'recompose';
import { notificationTypes } from '../../constants';
import AlertItem from './alertItem';
import * as Styles from './styles';

const warningIcon = require('../../assets/svg/ic_warning.svg');
const tickIcon = require('../../assets/svg/ic_confirmedTick.svg');

const getAlertStyles = (alertType) => {
  switch (alertType) {
    case notificationTypes.normal: {
      return { icon: '', band: Styles.bandSuccess };
    }
    case notificationTypes.success: {
      return { icon: tickIcon, band: Styles.bandSuccess };
    }
    case notificationTypes.warning: {
      return { icon: warningIcon, band: Styles.bandWarning };
    }
    case notificationTypes.error: {
      return { icon: warningIcon, band: Styles.bandError };
    }
    default:
      return { icon: tickIcon, band: Styles.bandSuccess };
  }
};

export default compose(
  withProps(({ alertObject }) => {
    const { type } = alertObject;
    const { icon, band } = getAlertStyles(type);
    return {
      icon,
      band
    };
  })
)(AlertItem);
