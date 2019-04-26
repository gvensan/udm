import React, { Component } from 'react';
import { css } from 'glamor';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Checkbox from 'material-ui/Checkbox';
import Sort from '../../components/sort';
import { sortDirections } from '../../utils/sort';

import { root } from '../../assets/variable';
import * as Styles from './styles';

export default class FlexTable extends Component {
  static propTypes = {
    backgroundColor: PropTypes.string,
    selectAllHandler: PropTypes.func,
    showSelectAll: PropTypes.bool,
    selectAllRows: PropTypes.func,
    selectedAll: PropTypes.bool,
    disableSelectAll: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      width: PropTypes.number.isRequired,
      style: PropTypes.shape({}),
      sort: PropTypes.shape({
        handler: PropTypes.func.isRequired,
        keyPath: PropTypes.string.isRequired
      })
    })).isRequired,
    headerStyle: PropTypes.shape({}),
    stickyHeader: PropTypes.bool,
    rowComponent: PropTypes.func.isRequired,
    rowProps: PropTypes.shape({}),
    selectedSortKey: PropTypes.string,
    data: PropTypes.arrayOf(PropTypes.object),
    rowHeight: PropTypes.number,
    checkBoxAlign: PropTypes.string,
    loader: PropTypes.shape({
      loading: PropTypes.bool,
      title: PropTypes.string,
      message: PropTypes.string
    })
  }

  static defaultProps = {
    disableSelectAll: false,
    showSelectAll: true,
    selectedAll: false,
    selectAllHandler: e => e,
    headerStyle: {
      background: '#ffffff'
    },
    stickyHeader: false,
    rowHeight: 60,
    backgroundColor: 'rgba(255,255,255,0)',
    rowProps: {},
    data: [],
    selectedSortKey: sortDirections.NONE,
    checkBoxAlign: 'left',
    loader: {
      loading: false,
      title: 'Your data is loading',
      message: ''
    }
  }

  state = {
    checkboxWidth: 0
  }

  componentWillMount() {
    const { columns } = this.props;
    const cbWidth = 1 - parseFloat(_.reduce(columns, (acc, item) => (acc + _.get(item, 'width', 0.0)), 0.0));
    this.setState({ checkboxWidth: cbWidth });
  }

  selectAllItems = (e, checked) => {
    const { selectAllRows } = this.props;
    selectAllRows(checked);
  }

  render() {
    const { columns, backgroundColor, selectedAll, stickyHeader, disableSelectAll, showSelectAll, selectAllRows,
            headerStyle, rowComponent: RowComponent, rowProps, data, selectedSortKey, loader, checkBoxAlign, showHeader } = this.props;
    const { loading, title, message } = loader;
    return (
      <div {...css(Styles.rootContainer, stickyHeader ? Styles.stickyWidth : null, { backgroundColor })}>
        {(showHeader === undefined || showHeader) &&
        <div {...css(Styles.tableHeaderContainer, headerStyle, stickyHeader ? Styles.stickyHeader : null, { marginTop: 'unset'})}>
          {showSelectAll && selectAllRows !== undefined ? 
          <div style={{ display: 'flex', flex: this.state.checkboxWidth, justifyContent: checkBoxAlign }}>
            <Checkbox
              iconStyle={{fill: root.switchStyleFillColor}}
              disabled={disableSelectAll}
              onCheck={this.selectAllItems}
              checked={selectedAll}
            />
          </div> : null}
          {
            columns.map((item, index) => (
              <div
                key={`flextable-${index + 1}`}
                {...css(Styles.columnHeaderContainer, item.style, { flex: _.get(item, 'width', 1) })}
              >
                {_.get(item, 'name', '')}
                {
                  item.sort
                    ? <Sort selectedSortKey={selectedSortKey} keyPath={item.sort.keyPath} sortHandler={item.sort.handler} />
                    : null
                }
              </div>
            ))
          }
        </div>}
        <div className={css(Styles.rootRowContainer, loading ? { overflowY: 'hidden' } : { overflowY: 'overlay' })}>
          {data.map((item, index) => {
            return <RowComponent key={`table-${item._id || index}`} data={item} index={index} {...rowProps} />
          })}
          {loading
            ? <div {...Styles.loaderContainer}>
              <div {...Styles.loaderTitle}>{title}</div>
              {message ? <div {...Styles.loaderMessage}>{message}</div> : null}
              <div {...Styles.spinner} />
            </div>
            : data.length === 0 && <div {...Styles.noDataMessageStyle}> No data found</div>
          }
        </div>
      </div>
    );
  }
}
