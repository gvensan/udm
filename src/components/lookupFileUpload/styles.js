import { css } from 'glamor';
import { root } from '../../assets/variable.js';

export const importButtonStyle = css({
  width: '110px',
  height: '35px',
  borderRadius: '3px',
  border: 'solid 1px ' + root.regularButtonBorder,
  fontSize: '13px',
  fontWeight: '900',
  lineHeight: '1.46',
  letterSpacing: '2.2px',
  textAlign: 'center',
  color: root.regularButtonColor,
  padding: '10px',
  cursor: 'pointer'
});

export const importedButtonStyle = css({
  width: '110px',
  height: '35px',
  borderRadius: '3px',
  border: 'solid 1px ' + root.actedButtonBorder,
  fontSize: '13px',
  fontWeight: '900',
  lineHeight: '1.46',
  letterSpacing: '2.2px',
  textAlign: 'center',
  color: root.actedButtonColor,
  padding: '10px',
  cursor: 'pointer'
});
