import { css } from 'glamor';
import { root } from '../../assets/variable';

export const rootContainer = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
});

export const tableHeaderContainer = css({
  display: 'flex',
  flexDirection: 'row',
  fontSize: '11px',
  fontWeight: 'bold',
  padding: '20px 5px',
  borderTop: '1px solid #dddddd',
  borderBottom: '1px solid #dddddd',
  alignItems: 'center'
});

export const stickyHeader = css({
  position: 'sticky',
  top: '0px',
  zIndex: 99
});

export const stickyWidth = css({
  width: '150%'
});

export const columnHeaderContainer = css({
  display: 'flex'
});

export const rootRowContainer = css({
  flex: 1,
  overflowY: 'overlay',
  position: 'relative'
});

export const scaleout = css.keyframes('scaleout', {
  '0%': { transform: 'scale(0)' },
  '100%': { transform: 'scale(1.0)', opacity: 0 }
});

export const spinner = css({
  width: '60px',
  height: '60px',
  margin: '20px 0px',
  background: root.spinnerBackground,
  borderRadius: '100%',
  animation: `${scaleout} 1s infinite ease-in-out`
});

export const loaderContainer = css({
  position: 'absolute',
  left: '0px',
  top: '0px',
  width: '100%',
  height: '100%',
  background: root.loaderBackground,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
});

export const loaderTitle = css({
  color: '#2E3B42',
  lineHeight: '29px',
  fontSize: '24px',
  userSelect: 'none',
  fontWeight: 900
});

export const loaderMessage = css(loaderTitle, {
  fontSize: '14px',
  fontWeight: 500,
  userSelect: 'none'
});

export const noDataMessageStyle = css({
  height: '34px',
  fontSize: '14px',
  letterSpacing: '0.65px',
  textAlign: 'center',
  borderBottom: '1px solid #dddddd',
  marginTop: '13px',
  color: 'rgb(46, 59, 66)',
  fontWeight: 400
});
