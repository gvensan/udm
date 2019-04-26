import Immutable from 'seamless-immutable';
import _ from 'lodash';
import shortid from 'shortid';
// import { notificationTypes } from '../../constants';
import * as Actions from './actions';

// const exampleNotif = {
//   title: 'Main Title here',
//   message: 'This is a notification',
//   type: notificationTypes.error, notificationTypes is from import { notificationTypes } from 'constants';
//   id: shortid.generate(),
//   expiresIn: 5000
// }


const defaultState = Immutable({
  alertItems: []
});

const alert = (state = defaultState, action) => {
  let nextState;
  switch (action.type) {
    case Actions.ALERT_ADD_ITEM: {
      const newAlertObject = _.get(action, 'payload', {});
      _.set(newAlertObject, 'id', shortid.generate());
      const newAlertItems = [newAlertObject].concat(state.alertItems);
      nextState = state.setIn(['alertItems'], newAlertItems);
      return nextState;
    }
    case Actions.ALERT_REMOVE_ITEM: {
      const newAlertItems = state.alertItems.filter(alertItem => _.get(alertItem, 'id', '') !== _.get(action, 'payload', ''));
      nextState = state.setIn(['alertItems'], newAlertItems);
      return nextState;
    }
    default:
      return state;
  }
};

export default alert;
