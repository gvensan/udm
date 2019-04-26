import { css } from 'glamor';
import { root } from '../../assets/variable.js';

export const headerColumnContainer = css({
  justifyContent: 'left',
  display: 'flex', 
  fontSize: '13px', 
  alignItems: 'center', 
  fontWeight: 'bold'  
});

export const totalOutstandingContainer = css({
  fontSize: '10px',
  justifyContent: 'flex-end',
});

export const customerNameColumn = css({
  paddingLeft: '24px',
  fontSize: '10px'
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

export const inkBarStyle = {
  background: root.tabBarBackgound,
  height: 4, 
  marginTop: -4
};

export const tabItemContainerStyle = {
  background: root.tabItemContainerBackground
};
