import { css } from 'glamor';

const latoRegular = require('./assets/fonts/lato/Lato-Regular.ttf');
const latoHair = require('./assets/fonts/lato/Lato-Hairline.ttf');
const latoBold = require('./assets/fonts/lato/Lato-Bold.ttf');
const latoBlack = require('./assets/fonts/lato/Lato-Black.ttf');
const latoHairItalics = require('./assets/fonts/lato/Lato-HairlineItalic.ttf');
const latoLightItalics = require('./assets/fonts/lato/Lato-LightItalic.ttf');
const latoItalics = require('./assets/fonts/lato/Lato-Italic.ttf');
const latoBoldItalics = require('./assets/fonts/lato/Lato-BoldItalic.ttf');
const latoBlackItalics = require('./assets/fonts/lato/Lato-BlackItalic.ttf');

const fontFamily = css.fontFace({
  fontFamily: 'Lato',
  src: `url(${latoRegular})`
});

css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontWeight: 100,
  src: `url(${latoHair})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontWeight: 700,
  src: `url(${latoBold})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'normal',
  fontWeight: 800,
  src: `url(${latoBlack})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'italic',
  fontWeight: 100,
  src: `url(${latoHairItalics})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'italic',
  fontWeight: 200,
  src: `url(${latoLightItalics})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'italic',
  fontWeight: 400,
  src: `url(${latoItalics})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'italic',
  fontWeight: 700,
  src: `url(${latoBoldItalics})`
});
css.fontFace({
  fontFamily: 'Lato',
  fontStyle: 'italic',
  fontWeight: 800,
  src: `url(${latoBlackItalics})`
});

css.global('input:focus', { outline: 'none', border: '1px solid #26C3ED' });
css.global('html, body', { fontFamily, fontSize: '12px', margin: '0px', color: '#2E3B42' });

export const rootStyles = css({
  width: '100vw',
  height: '100%',
  minHeight: '100vh',
  display: 'flex',
  flex: 1,
  flexDirection: 'row'
});
