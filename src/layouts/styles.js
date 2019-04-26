import { css } from 'glamor';
import { root } from '../assets/variable';

export const rootContainer = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  background: root.rootContainerBackground
});

export const sidebarContainer = css({
  width: '95px',
  borderRight: '1px solid ' + root.sidebarBorderColor,
  background: root.sidebarContainerBackground,
  display: 'flex'
});

export const contentContainer = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
});

export const topBarContainer = css({
  height: '50px',
  display: 'flex',
  borderBottom: '1px solid ' + root.topbarBorderColor,
  background: root.topbarContainerBackground, 
  top: 0, 
  left: 0, 
  position: 'sticky',
  zIndex: 2
});
