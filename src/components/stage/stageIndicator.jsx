import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Avatar from 'material-ui/Avatar';
import ReactTooltip from 'react-tooltip'
import { root } from '../../assets/variable';

export default class StageIndicator extends Component {
  static propTypes = {
    phase: PropTypes.number,
    title: PropTypes.string,
    condition: PropTypes.bool
  };

  onClick = (e) => {
    e.preventDefault();
    if (this.props.jumpto && this.props.condition)
      this.props.jumpto(this.props.phase-1);
    return;
  }
  render() {
    return (
      <div>
        {this.props.jumpto && 
          <ReactTooltip id={'phase-'+this.props.phase} place="right" type="dark" effect="float">
            <span>{this.props.title}</span>
          </ReactTooltip>}
        <div onClick={this.onClick} style={{cursor: this.props.jumpto ? 'pointer' : 'unset'}} 
          data-tip data-for={this.props.notooltip !== true ? 'phase-'+this.props.phase : undefined}>
          <Avatar style={{height: this.props.height ? this.props.height : 30, width: this.props.width ? this.props.width : 30, 
                    marginRight: 10, fontSize: 'inherit'}} color={root.stageBubbleColor} backgroundColor={root.stageBubbleBackground}>
            {this.props.phase}
          </Avatar>
          {this.props.title && !this.props.jumpto &&
            <span style={{paddingRight: 10}}>{this.props.title}</span>}
        </div>
      </div>
    )
  }
}
