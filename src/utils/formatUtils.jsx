import moment from 'moment';

export function formatAmount(value) {
  return ((!isNaN(parseFloat(value)) && isFinite(value)) ?
    new Intl.NumberFormat('en-IN').format(Math.floor(value)) : value);
}

export function getDecimalPart(value) {
  return ((!isNaN(parseFloat(value)) && isFinite(value)) &&
    (new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2 }).format(value - Math.floor(value))).slice(-3));
}

export function getFormattedDateString(dateString, format) {
  const dueDate = moment(dateString);
  return dueDate.format(format);
}


const toProperCase = (str) => str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());


export const expiresIn = endDate => {
  const res = moment(new Date(endDate)).fromNow();
  if (res.startsWith('in')) {
    return toProperCase(res.slice(2));
  }
  return toProperCase(res);
};


export const duration = (startDate, endDate) => {
  const start = moment(new Date(startDate));
  const end = endDate ? moment(new Date(endDate)) : null;
  if (!end) {
    return '';
  }
  const diff = moment.duration(end.diff(start))._data;
  if (diff.years) {
    return diff.months ? `${diff.years} Years ${diff.months} Months` : `${diff.years} Years`;
  }
  if (diff.months) {
    return diff.days ? `${diff.months} Months ${diff.days} Days` : `${diff.years} Months`;
  }
  if (diff.days) {
    return diff.hours ? `${diff.days} Days ${diff.hours} Hours` : `${diff.days} Days`;
  }
  if (diff.hours) {
    return diff.minutes ? `${diff.hours} Hours ${diff.minutes} Minutes` : `${diff.hours} Hours`;
  }
  if (diff.minutes) {
    return diff.seconds ? `${diff.minutes} Minutes ${diff.seconds} Seconds` : `${diff.minutes} Minutes`;
  }
  return '';
};
