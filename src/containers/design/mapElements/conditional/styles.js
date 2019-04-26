import { css } from 'glamor';
import { root } from '../../../../assets/variable';

export const headerColumnContainer = css({
  justifyContent: 'left',
  display: 'flex', 
  fontSize: '13px', 
  alignItems: 'center', 
  fontWeight: 'bold'  
});

export const headerColumnContainer1 = css({
  justifyContent: 'left',
  display: 'flex', 
  fontSize: '13px', 
  alignItems: 'center', 
  fontWeight: 'bold',
  minWidth: 150
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

export const conditionContainer = css({
  display: 'flex', 
  flexDirection: 'row',
  alignItems: 'start',
  borderBottom: '1px solid #ddd',
  borderRadius: '3px',
  marginBottom: 10,
  padding: '25px 15px',
  background: root.conditionContainerBackground,
  border: '1px solid #e4e4e4',
  cursor: 'pointer'
});

export const resultConditionContainer = css({
  display: 'flex', 
  flexDirection: 'row',
  borderBottom: '1px solid #ddd',
  borderRadius: '3px',
  marginBottom: 10,
  padding: '25px 15px',
  background: root.conditionContainerBackground,
  border: '1px solid #e4e4e4',
  cursor: 'pointer',
  justifyContent: 'space-between',
  alignItems: 'center'
});

export const rowContainer = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  borderRadius: '3px',
  marginBottom: 10,
  padding: '25px 15px',
  background: root.conditionContainerBackground,
  border: '1px solid #e4e4e4',
  flexDirection: 'row',
  cursor: 'pointer'
});

export const headingContainer = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  height: '30px',
  borderRadius: '3px',
  marginBottom: 10,
  padding: '25px 15px',
  background: root.conditionContainerBackground,
  border: '1px solid #e4e4e4',
  flexDirection: 'row',
  cursor: 'pointer'
});
