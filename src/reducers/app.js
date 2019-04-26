import Immutable from 'seamless-immutable';
import { combineReducers } from 'redux';
import alert from '../containers/alert/reducers';
import * as Actions from './actions';

const defaultCompanyState = Immutable({
  companyId: sessionStorage.getItem('companyId'),
  user: null,
  currentCompany: null
});

const company = (state = defaultCompanyState, action) => {
  switch (action.type) {
    case Actions.UPDATE_CURRENT_COMPANYID:
      return Immutable.set(state, 'companyId', action.payload);

    case Actions.UPDATE_CURRENT_COMPANY:
      return Immutable.set(state, 'currentCompany', action.payload);

    case Actions.UPDATE_CURRENT_USER: {
      const newState = state.merge({
        user: action.payload
      });
      return newState;
    }
    default:
      return state;
  }
};

export default combineReducers({
  company,
  alert
});
