import moment from 'moment';
import timeAgo from 'damals';

export const getUTCDateTime = (utcDate, dateFormat) => {
  if (!utcDate) return '';
  return moment(utcDate).utc().format(dateFormat || 'YYYY-MM-DD hh:mm:ss.SSS');
};

export const getLocalDateTime = (utcDate, dateFormat) => {
  if (!utcDate) return '';
  return moment(moment.utc(utcDate).toDate()).format(dateFormat || 'YYYY-MM-DD hh:mm:ss.SSS');
};

export const getLocalDateObj = (utcDate) => {
  if (!utcDate) return '';
  return moment.utc(utcDate).toDate();
};

export const getElapsedTime = (utcDate) => {
  if (!utcDate) return '';
  return timeAgo(utcDate);
};

export const getTimeRemaining = (dueAt) => {
  if (dueAt === '') {
    return {
      rem: '',
      ms: ''
    };
  }

  const now = moment();
  const dueTime = moment(dueAt);
  const ms = dueTime.diff(now);
  const duration = moment.duration(Math.abs(ms));
  let timeRemaining = Math.floor(duration.asHours());
  if (timeRemaining > 48) {
    const fullDays = Math.floor(timeRemaining / 24);
    timeRemaining = `${fullDays} days, ${timeRemaining % 24}h`;
  } else {
    timeRemaining = `${timeRemaining}h`;
  }

  timeRemaining += moment.utc(Math.floor(Math.abs(ms))).format(' mm');
  timeRemaining += 'm';
  if (ms <= 0 && timeRemaining !== '0:00') {
    timeRemaining = `${timeRemaining} overdue`;
  }
  return {
    rem: timeRemaining,
    ms,
    readableFormat: duration.humanize()
  };
};

export function getFormattedDateString(dateString, format) {
  const dueDate = moment(dateString);
  return dueDate.format(format);
}

export function getDueDateInfo(dueDateString) {
  const due = { dueIn: 0, overDueBy: 0 };
  const SECONDS_IN_DAY = 86400;
  if (dueDateString) {
    const now = moment();
    const dueDate = moment(dueDateString);
    const diffSeconds = dueDate.diff(now, 'seconds');

    if (diffSeconds > 0) {
      if (diffSeconds <= SECONDS_IN_DAY) {
        due.dueIn = 1;
      } else {
        due.dueIn = Math.ceil(diffSeconds / SECONDS_IN_DAY);
      }
    } else if (diffSeconds < 0) {
      if (Math.abs(diffSeconds) <= SECONDS_IN_DAY) {
        due.overDueBy = 0;
      } else {
        due.overDueBy = Math.floor(Math.abs(diffSeconds) / SECONDS_IN_DAY);
      }
    }
  }
  return due;
}
