export const ALERT_ADD_ITEM = 'ALERT:ADD:ITEM';
export const ALERT_REMOVE_ITEM = 'ALERT:REMOVE:ITEM';

export function postAlert({ title, message, type, expiresIn = 5000 }) {
  return { type: ALERT_ADD_ITEM, payload: { title, message, type, expiresIn } };
}

export function removeAlert(alertId) {
  return { type: ALERT_REMOVE_ITEM, payload: alertId };
}
