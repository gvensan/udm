import React from 'react';
import _ from 'lodash';
import { TransitionMotion, spring, presets } from 'react-motion';
import PropTypes from 'prop-types';
import AlertItem from '../../components/alertItem';
import * as Styles from './styles';

export default class Alert extends React.Component {
  static propTypes = {
    alertItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    removeAlert: PropTypes.func.isRequired
  }

  getDefaultStyles = () => {
    const { alertItems } = this.props;
    const items = alertItems.map(alertItem => ({ key: _.get(alertItem, 'id', ''), data: alertItem, style: { height: 0, opacity: 1 } }));
    return items;
  }

  getStyles = () => {
    const { alertItems } = this.props;
    const items = alertItems.map(alertItem => ({ key: _.get(alertItem, 'id', ''), data: alertItem, style: { height: spring(60, presets.gentle), opacity: spring(1, presets.gentle) } }));
    return items;
  }

  willLeave = () => ({
    height: spring(0),
    opacity: spring(0)
  })

  willEnter = () => ({
    height: 0,
    opacity: 1
  })

  render() {
    const { removeAlert } = this.props;
    return (
      <div {...Styles.rootContainer}>
        <TransitionMotion
          styles={this.getStyles()}
          defaultStyles={this.getDefaultStyles()}
          willLeave={this.willLeave}
          willEnter={this.willEnter}
        >
          {
            styles =>
              (<div>
                {
                  styles.map(({ key, data, style }) => (
                    <div key={key} style={style}>
                      <AlertItem
                        key={`alert-item-${key}`}
                        alertObject={data}
                        removeAlert={removeAlert}
                      />
                    </div>
                  ))
                }
              </div>)
          }
        </TransitionMotion>
      </div>
    );
  }
}
