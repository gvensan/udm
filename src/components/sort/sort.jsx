import React from 'react';
import PropTypes from 'prop-types';
import * as Styles from './styles';
import { sortDirections } from '../../utils/sort';

const sortIcon = require('../../assets/svg/ic_sort.svg');
const sortUpIcon = require('../../assets/svg/sort_up.svg');
const sortDownIcon = require('../../assets/svg/sort_down.svg');

export default class Sort extends React.Component {
  static propTypes = {
    sortHandler: PropTypes.func.isRequired,
    keyPath: PropTypes.string.isRequired,
    selectedSortKey: PropTypes.string.isRequired
  }

  state = {
    currentSortDirection: sortDirections.NONE
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedSortKey !== this.props.keyPath) {
      this.setState({ currentSortDirection: sortDirections.NONE });
    }
  }

  onClickSort = () => {
    const { keyPath } = this.props;
    const { currentSortDirection } = this.state;
    const newDirection = this.getNextSortDirection(keyPath, keyPath, currentSortDirection);
    this.setState({ currentSortDirection: newDirection });
    this.props.sortHandler(this.props.keyPath, newDirection);
  }

  getIconForDirection = (direction) => {
    switch (direction) {
      case sortDirections.ASC:
        return sortUpIcon;
      case sortDirections.DSC:
        return sortDownIcon;
      case sortDirections.NONE:
        return sortIcon;
      default:
        return sortIcon;
    }
  }

  getNextSortDirection = (selectedSortKey, keyPath, currentSortDirection) => {
    if (selectedSortKey === keyPath) {
      switch (currentSortDirection) {
        case sortDirections.ASC:
          return sortDirections.DSC;
        case sortDirections.DSC:
          return sortDirections.ASC;
        case sortDirections.NONE:
          return sortDirections.ASC;
        default:
          return sortDirections.NONE;
      }
    } else {
      return sortDirections.NONE;
    }
  };

  render() {
    const { currentSortDirection } = this.state;
    const icon = this.getIconForDirection(currentSortDirection);
    return (
      <div role={'button'} tabIndex={0} onClick={this.onClickSort} {...Styles.rootContainer}>
        <img src={icon} alt={''} {...Styles.icon} />
      </div>
    );
  }
}
