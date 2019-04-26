import { css } from 'glamor';
import { root } from '../../assets/variable.js';

export const rootContainer = css({
  height: '65px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderLeft: '5px solid ' + root.navItemContainerBackground,
  ':hover': {
    cursor: 'pointer'
  }
});

export const selected = css(rootContainer, {
  background: root.navItemSelectedBackground,
  borderLeft: '5px solid ' + root.navItemSelectedBorder,
});
