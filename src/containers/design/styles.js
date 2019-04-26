import { css } from 'glamor';
import { root } from '../../assets/variable.js';

export const taskCardContainer = css({
  height: '70px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-evenly',
  borderRadius: '3px',
  margin: '5px 0px',
  border: '1px solid #DDDDDD',
  ':hover': {
    cursor: 'pointer'
  }
});

export const selectedTaskContainer = css(taskCardContainer, {
  border: '1px solid #26C3ED'
});

export const scaleout = css.keyframes('scaleout', {
  '0%': { transform: 'scale(0)' },
  '100%': { transform: 'scale(1.0)', opacity: 0 }
});

export const spinner = css({
  width: '30px',
  height: '30px',
  margin: '20px 0px',
  background: '#26C3ED',
  borderRadius: '100%',
  animation: `${scaleout} 1s infinite ease-in-out`
});

export const rootStyle = css({
  '& .well-div': {
    '& .well': {
      borderRadius: 'unset',
      borderColor: '#dddddd',
      boxShadow: 'none'
    }
  },
  '& .custom-file-input': {
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
    paddingTop: '9px',
    cursor: 'pointer'
  }
});
export const topDivStyle = css({
  display: 'flex',
  width: '600px',
  height: '45px',
  marginBottom: '19px',
  flexDirection: 'row',
  justifyContent: 'space-between',
  '& .header-div': {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    textAlign: 'left',
    color: '#2e3b42',
    paddingLeft: '24px'
  },
  '& .image-div': {
    float: 'right'
  }
});

export const descriptionStyle = css({
  width: '147px',
  height: '14px',
  fontFamily: 'Lato',
  fontSize: '11px',
  lineHeight: '3.27',
  letterSpacing: '0.4px',
  textAlign: 'left',
  color: '#b0b0b0'
});
export const descriptiontextStyle = css({
  width: '147px',
  height: '14px',
  fontFamily: 'Lato',
  fontSize: '11px',
  lineHeight: '3.27',
  letterSpacing: '0.4px',
  textAlign: 'left',
  color: root.regularButtonColor,
  ':hover': {
    textDecoration: 'none',
    cursor: 'pointer'
  }
});

export const iconStyle = css({
  paddingLeft: '30px',
  marginRight: '10px'
});

export const labelStyle = css({
  width: '150px',
  height: '21px',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '0.2',
  textAlign: 'left',
  color: '#000000',
  paddingLeft: '10px',
  paddingRight: '18px',
  paddingTop: '18px'
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
  backgroundColor: root.buttonBackground,
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

export const expandCollapseButtonStyle = css({
  borderRadius: '3px',
  border: 'solid 1px ' + root.actedButtonBorder,
  fontSize: '13px',
  fontWeight: '900',
  lineHeight: '1.46',
  letterSpacing: '2.2px',
  textAlign: 'center',
  color: root.regularButtonColor,
  padding: '5px',
  margin: '5px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
});

export const imageStyle = css({
  height: '40px',
  width: '92px'
});

export const rightStyle = css({
  paddingTop: '20px',
  '& .text-span': {
    fontWeight: 'bold',
    color: root.regularButtonColor,
    paddingRight: '5px',
    fontSize: '13px'
  }
});

export const verticalLineStyle = css({
  borderLeft: '2px solid #dddddd',
  height: '39px',
  marginLeft: '25px',
  marginRight: '11px',
  opacity: '0.2'
});
export const formStyle = css({
  width: '125px',
  paddingTop: '10px'
});

export const horizontalLineStyle = css({
  width: '361.5px',
  height: '1px',
  borderTop: 'solid 1px #DDDDDD',
  paddingBottom: '12px',
  marginLeft: '19px',
  marginBottom: '25px'
});

export const titleStyle = css({
  // width: '243px',
  height: '22px',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  textSlign: 'left',
  color: '#2e3b42'
});

export const subTitleStyle = css({
  // width: '243px',
  height: '22px',
  fontSize: '10px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  textSlign: 'left',
  color: '#2e3b428c'
});

export const boxStyle = css({
  outline: 'none',
  width: '657px',
  height: '80',
  border: '1px solid #dddddd',
  paddingTop: '10px',
  paddingLeft: '10px'
});
export const openBoxStyle = css({
  outline: 'none',
  width: '657px',
  height: '80',
  borderTop: '1px solid #dddddd',
  borderRight: '1px solid #dddddd',
  borderLeft: '1px solid #dddddd',
  borderBottom: 'none',
  paddingTop: '10px',
  paddingLeft: '10px'
});

export const wellStyle = css({
  backgroundColor: '#ffffff',
  width: '657px',
  borderTop: '0px',
  '& .well': {
    borderRadius: '0px',
    borderTop: 'none'
  }
});

export const flexStyle = css({
  display: 'flex',
  paddingBottom: '0',
  paddingTop: '0',
  marginTop: '20px'
});

export const ctaBtnWrapStyle = css({
  display: 'flex',
  justifyContent: 'space-around',
  paddingBottom: '0',
  paddingTop: '0',
  marginTop: '20px'
});

export const skipforlater = css({
  width: '150.3px',
  height: '19px',
  fontFamily: 'Lato',
  fontSize: '15px',
  fontWeight: 'bold',
  lineHeight: '3.36',
  letterSpacing: '2.4px',
  textAlign: 'center',
  color: root.regularButtonColor,
  paddingLeft: '90px',
  ':hover': {
    textDecoration: 'none',
    cursor: 'pointer'
  },
  ':focus': {
    outline: 'none'
  }
});

export const nextStyle = css({
  opacity: '0.2'
});
export const newStyle = css({
  opacity: '1'
});


export const titleBox = css({
  width: '600px',
  height: '45px',
  paddingTop: '15px',
  paddingBottom: '15px',
  marginLeft: '19px'

});
export const horizontalfirstLineStyle = css({
  borderBottom: 'solid 2px #dddddd',
  marginLeft: '19px',
  opacity: '0.3',
  width: '600px'
});

export const contentStyle = css({
  height: '45px',
  backgroundColor: '#ffffff',
  display: 'flex'
});

export const colorBox = css({
  fontFamily: 'Lato',
  fontSize: '14px',
  lineHeight: '1.71',
  letterSpacing: '0.4px',
  textAlign: 'left',
  color: '#f54b5e'
});
export const loadingbox = css({
  width: '410px',
  height: '75px',
  backgroundColor: '#ffffff',
  display: 'flex'

});

export const iconbox = css({
  width: '128px',
  height: '128px',
  marginTop: '18px',
  marginLeft: '40px'
});

export const loadingicon = css({
  width: '50px',
  height: '50px',
  marginTop: '5px',
  marginLeft: '135px'
});

export const warningicon = css({
  width: '50px',
  height: '50px',
  marginTop: '5px',
  marginLeft: '135px'
});
export const tickicon = css({
  width: '30px',
  height: '30px',
  marginTop: '5px',
  marginLeft: '135px'
});
export const textbox = css({
  display: 'block',
  marginLeft: '12px'
});

export const methodIcon = css({
  marginTop: '-19px',
  width: '75px',
  height: '67.3px',
  objectFit: 'contain'
});
export const wrongmessage = css({
  fontFamily: 'Lato',
  fontSize: '14px',
  lineHeight: '1.71',
  letterSpacing: '0.4px',
  textAlign: 'left',
  color: '#f54b5e',
  paddingTop: '5px'
});
export const wrongbox = css({
  width: '361px',
  height: '35px',
  backgroundColor: 'rgba(245, 75, 94, 0.15)'

});
export const fileNameStyle = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  width: '25em'
});

export const boxedText = css({
  border: '1px solid #30333647',
  backgroundColor: 'rgb(236, 236, 236)',
  overflow: 'scroll',
  padding: '1em',
  fontSize: 'smaller',
  fontWeight: '900',
});

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

export const conditionContainer = css({
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
  background: root.summaryHeaderBackground,
  border: '1px solid #e4e4e4',
  flexDirection: 'row',
  cursor: 'pointer'
});

export const headerContainer = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  height: '30px',
  borderRadius: '3px',
  margin: '5px',
  padding: '5px',
  background: root.summaryHeaderBackground,
  border: '1px solid #e4e4e4',
  flexDirection: 'row',
  fontSize: '14px', 
  fontWeight: 'bold', 
  justifyContent: 'space-between'
});

export const subHeaderContainer = css({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #ddd',
  height: '30px',
  borderRadius: '3px',
  margin: '5px',
  padding: '5px',
  background: root.summarySubHeaderBackground,
  border: '1px solid #e4e4e4',
  flexDirection: 'row',
  fontSize: '14px', 
  fontWeight: 'bold', 
  justifyContent: 'space-between'
});

export const headerRowContainer = css({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '5px',
  marginRight: '5px',
  padding: '5px',
  background: root.summaryRowBackground,
  flexDirection: 'row',
  fontSize: '14px', 
  fontWeight: 'bold', 
  justifyContent: 'space-between',
  borderBottom: '1px dashed #607d8b36'
});

export const headerLeftTitleRow = css({
  flex: 0.4,
  fontSize: '14px', 
  fontWeight: 800, 
  paddingLeft: 10,
  textDecoration: 'underline',
  alignItems: 'center'
});

export const headerLeftRow = {
  flex: 0.4,
  fontSize: '14px', 
  fontWeight: 800, 
  paddingLeft: 10,
  alignItems: 'center'
};

export const headerRightRow = {
  flex: 0.6, 
  fontSize: '14px', 
  fontWeight: 'bold', 
  letterSpacing: '0.5px', 
  color: '#231588',
  alignItems: 'center'
};

export const headerGridRowContainer = css({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '5px',
  marginRight: '5px',
  padding: '5px',
  flexDirection: 'row',
  fontSize: '14px', 
  fontWeight: 'bold', 
  justifyContent: 'space-between',
  borderBottom: '1px dashed #607d8b36',
	background: 'radial-gradient(circle, white 1px, ' + root.rowGridBackground + ' 3px)',
	backgroundSize: '10px 10px',
});

export const headerGridChildRowContainer = css({
  display: 'flex',
  alignItems: 'center',
  marginLeft: '5px',
  marginRight: '5px',
  padding: '5px',
  flexDirection: 'row',
  fontSize: '14px', 
  fontWeight: 'bold', 
  justifyContent: 'space-between',
  borderBottom: '1px dashed #607d8b36',
	background: 'radial-gradient(circle, white 1px, ' + root.rowBackground + ' 3px)',
	backgroundSize: '10px 10px',
});

export const inkBarStyle = {
  background: root.tabBarBackgound,
  height: 4, 
  marginTop: -4
};

export const tabItemContainerStyle = {
  background: root.tabItemContainerBackground
};
