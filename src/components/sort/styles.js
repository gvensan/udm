import { css } from 'glamor';

export const rootContainer = css({
  ':hover': {
    cursor: 'pointer'
  },
  ':focus': {
    outline: 'none'
  }
});

export const icon = css({
  paddingLeft: '5px',
  paddingBottom: '2px'
});
