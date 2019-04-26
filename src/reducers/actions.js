export const UPDATE_CURRENT_COMPANYID = 'APP:UPDATE:COMPANYID';
export const UPDATE_CURRENT_COMPANY = 'APP:UPDATE:COMPANY';
export const UPDATE_CURRENT_USER = 'UPDATE_CURRENT_USER';

export function updateCompanyId(companyId) {
  return { type: UPDATE_CURRENT_COMPANYID, payload: companyId };
}

export function updateCurrentCompany(company) {
  return { type: UPDATE_CURRENT_COMPANY, payload: company };
}

export function updateUser(userObj) {
  return { type: UPDATE_CURRENT_USER, payload: userObj };
}