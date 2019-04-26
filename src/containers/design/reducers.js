import Immutable from 'seamless-immutable';
import * as Actions from './actions';

const defaultState = Immutable({
  uploadFileName: null,
  uploadFileTrigger: false
});

const progressContainer = (state = defaultState, action) => {
  switch (action.type) {
    case Actions.UPDATE_UPLOAD_FILE_NAME:
      return Immutable.set(state, 'uploadFileName', action.payload);

    case Actions.UPDATE_UPLOAD_FILE_TRIGGER:
      return Immutable.set(state, 'uploadFileTrigger', action.payload);

    default:
      return state;
  }
};

export default progressContainer;
