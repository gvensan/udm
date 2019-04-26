import _ from 'lodash';

export const sortDirections = {
  ASC: 'UP',
  DSC: 'DOWN',
  NONE: 'NONE'
};

export const sortFieldTypes = {
  STRING: 'STRING',
  DATE: 'DATE',
  AMOUNT: 'AMOUNT',
  PMT_STATUS: 'PMT_STATUS',
  NONE: 'NONE'
};

export const sortOnDate = (list, path, reverse = false) => {
  const sortedList = _.cloneDeep(list);
  sortedList.sort((firstObj, secondObj) => {
    const first = new Date(_.get(firstObj, path, ''));
    const second = new Date(_.get(secondObj, path, ''));
    return reverse ? second - first : first - second;
  });
  return sortedList;
};

export const sortOnString = (list, path, reverse = false) => {
  const sortedList = _.cloneDeep(list);
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  sortedList.sort((firstObj, secondObj) => {
    const first = (_.get(firstObj, path, '') === null) ? ' ' : _.get(firstObj, path, '').toLowerCase();
    const second = (_.get(secondObj, path, '') === null) ? ' ' : _.get(secondObj, path, '').toLowerCase();
    return reverse ? collator.compare(second, first) : collator.compare(first, second);
  });
  return sortedList;
};

export const sortOnAmount = (list, path, reverse = false) => {
  const sortedList = _.cloneDeep(list);
  sortedList.sort((firstObj, secondObj) => {
    const first = parseFloat(_.get(firstObj, path, 0));
    const second = parseFloat(_.get(secondObj, path, 0));
    return reverse ? second - first : first - second;
  });
  return sortedList;
};

export const sortListOnField = (list, path, sortType, sortDirection = sortDirections.ASC) => {
  const reverse = sortDirection === sortDirections.DSC;
  switch (sortType) {
    case sortFieldTypes.STRING:
      return sortOnString(list, path, reverse);
    case sortFieldTypes.AMOUNT:
      return sortOnAmount(list, path, reverse);
    case sortFieldTypes.DATE:
      return sortOnDate(list, path, reverse);
    default:
      return list;
  }
};
