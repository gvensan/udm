import validator from 'validator';

// 1 lowercase alphabet, 1 uppercase alphabet, 1 numeric, 1 special character, min 6 characters
const validPasswordRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})');

export const isEmail = (str) => {
  if (str) return validator.isEmail(str);
  return true;
};
export const isEmpty = (str) => {
  if (str) return validator.isEmpty(str);
  return true;
};
export const isMobilePhone = (str) => {
  if (str) return validator.isMobilePhone(str, 'en-IN');
  return true;
};
export const isLength = (str, min, max) => {
  if (str) return validator.isLength(str, { min, max });
  return true;
};
export const toPrecision = (value, precision = 2) => (
  parseFloat(value).toFixed(precision)
);

export const localNumberString = (value) => (
  parseFloat(toPrecision(value || 0)).toLocaleString('en-IN')
);

export const validPassword = password => validPasswordRegex.test(password);

export const getLocationText = (locations) => {
  if (locations.length === 0) {
    return '';
  }

  if (locations[0].type === 'COMPANY') {
    return 'Across Company';
  }

  return `${locations.length} ${locations[0].type}${locations.length > 1 ? 's' : ''}`;
};
