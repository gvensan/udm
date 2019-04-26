import { css } from 'glamor';
import { root } from '../../assets/variable';

export const outerContainer = css({
  width: '100%',
  height: '100%',
  left: '0',
  top: '0',
  position: 'fixed',
  zIndex: '999999',
  backgroundColor: root.loaderBackground
});

export const innerContainer = css({
  position: 'absolute',
  margin: 'auto',
  height: '50px',
  left: '0',
  top: '0',
  right: '0',
  bottom: '0'
});

export const messageText = css({
  fontSize: '1.3em',
  color: '#fff'
});
