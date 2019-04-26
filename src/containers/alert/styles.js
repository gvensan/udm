import { css } from 'glamor';

export const rootContainer = css({
  position: 'fixed',
  display: 'flex',
  width: '100vw',
  height: '100vh',
  pointerEvents: 'none',
  zIndex: 9999999,
  flex: 1,
  justifyContent: 'center',
  top: '0px',
  left: '0px',
  marginTop: '20px'
});
