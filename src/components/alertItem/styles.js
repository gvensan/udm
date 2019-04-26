import { css } from 'glamor';

export const base = css({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '700px',
  padding: '0 10px',
  minHeight: '40px',
  maxHeight: '80px',
  overflow: 'auto',
  backgroundColor: '#f3f3f3',
  margin: '10px',
  justifyContent: 'space-between',
  borderRadius: '3px',
  boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.11)',
  color: '#2e3b42'
});

export const titleStyle = css({
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  textAlign: 'left'
});

export const bodyStyle = css({
  fontFamily: 'Lato',
  fontSize: '13px',
  lineHeight: '1',
  letterSpacing: '0.3px',
  textAlign: 'left'
});

export const band = css({
  flexDirection: 'row',
  height: '40px',
  justifyContent: 'unset'
});

export const bandSuccess = css({
  backgroundColor: '#e6faf2',
  color: '#3fcc97',
  border: 'solid 1px #3fcc97'
});

export const bandError = css({
  backgroundColor: '#FEE4E7',
  color: '#F54B5E',
  border: '1px solid #F54B5E'
});

export const bandWarning = css({
  backgroundColor: '#FEF7DD',
  color: '#D6A910',
  border: '1px solid #D6A910'
});

export const bandNormal = css({
  backgroundColor: '#f3f3f3'
});

export const iconContainer = css({
  display: 'flex',
  flex: 0.1,
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: '10px'
});

export const bodyContainer = css({
  display: 'flex',
  flex: 0.9,
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '10px, 10px, 10px, 0',
  marginLeft: '0px'
});

export const icon = css({
  height: '20px'
});

export const bandMessage = css({
  fontFamily: 'Lato',
  fontSize: '13px',
  letterSpacing: '0.3px',
  textAlign: 'left'
});
