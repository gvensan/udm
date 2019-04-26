import { css } from 'glamor';
import { root } from '../../../../assets/variable';

export const moreContainer = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '30px',
  width: '30px',
  position: 'relative',
  border: '1px solid rgba(255,255,255,0)',
  borderRadius: '3px',
  outline: 'none',
  ':hover': {
    boxShadow: '0 2px 4px 0 rgba(0,0,0,0.09)',
    border: '1px solid #DDDDDD',
    cursor: 'pointer'
  }
});

export const selected = css({
  boxShadow: '0 2px 4px 0 rgba(0,0,0,0.09)',
  border: '1px solid #DDDDDD',
  ':focus': {
    outline: 'none'
  }
});

export const headerColumnContainer = css({
  justifyContent: 'left',
  display: 'flex', 
  fontSize: '13px', 
  alignItems: 'center', 
  fontWeight: 'bold'  
});

export const boxedText = css({
  border: '1px solid #30333647',
  backgroundColor: 'rgb(236, 236, 236)',
  overflow: 'scroll',
  padding: '1em',
  fontSize: 'smaller',
  fontWeight: '900',
});

export const importButtonStyle = css({
  width: 'auto',
  height: 'auto',
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
