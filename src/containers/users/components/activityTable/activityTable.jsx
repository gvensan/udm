import React from 'react';
import DataTables from 'material-ui-datatables';
import _ from 'lodash';
import { sortOnString, sortOnDate } from '../../../../utils/sort'

export default class ActivityTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      header: [],
      rows: [],
      data: []
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      page: 0,
      rows: props.rows,
      header: props.header,
      data: props.rows.splice(0, 10)
    });
  }

  handleFilterValueChange = (value) => {
    var rows = _.cloneDeep(this.props.rows);
    rows = rows.filter((row) => {
      return (row.activity.indexOf(value) >= 0 || row.user.indexOf(value) >= 0 || row.email.indexOf(value) >= 0);
    })

    this.setState({
      rows: rows,
      data: rows.splice(0, 10),    
      page: 0
    })    
  }
 
  handleSortOrderChange = (key, order) => {
    var rows = [];
    if (key === 'time')
      rows = sortOnDate(this.props.rows, key, order === 'asc' ? false : true);
    else
      rows = sortOnString(this.props.rows, key, order === 'asc' ? false : true);
  
    this.setState({
      rows: rows,
      data: rows.splice(0, 10),    
      page: 0
    })
  }

  handlePreviousPageClick = () => {
    var page = this.state.page === 0 ? 0 : this.state.page - 1;
    var data = this.state.rows.slice(page*10, page*10+10);
    this.setState({page: page, data: data});
  }

  handleNextPageClick = () => {
    var page = this.state.page * 10 > this.state.rows.length ? this.state.page : this.state.page + 1;
    var data = this.state.rows.slice(page*10, page*10+10);
    this.setState({page: page, data: data});
  }

  render() {
    return (
      <DataTables
        title={'Activity Log'}
        height={'auto'}
        selectable={false}
        showRowHover={false}
        columns={this.state.header}
        data={this.state.data}
        headerToolbarMode={'filter'}
        showHeaderToolbar={true}
        showHeaderToolbarFilterIcon={true}
        filterHintText={'Search'}
        filterText={''}
        showCheckboxes={false}
        onNextPageClick={this.handleNextPageClick.bind(this)}
        onPreviousPageClick={this.handlePreviousPageClick.bind(this)}
        onFilterValueChange={this.handleFilterValueChange}
        onSortOrderChange={this.handleSortOrderChange}
        page={this.state.page + 1}
        count={this.state.rows.length}
      />
    );
  }
}
