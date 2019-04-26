const axios = require('axios');
const logger = require('winston');
const config = require('./config');

const objectToQueryString = (obj) => {
  if (!obj) {
    return '';
  }
  return Object.keys(obj).reduce(function (str, key, i) {
    let delimiter, val;
    delimiter = (i === 0) ? '?' : '&';
    key = encodeURIComponent(key);
    val = encodeURIComponent(obj[key]);
    return [str, delimiter, key, '=', val].join('');
  }, '');
};

const makeRequest = (token, method, route, body) => {
  const headers = {};
  const baseUrl = config.cfmAppBaseUrl;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (method === 'get' || method === 'delete') {
    req = axios[method](`${baseUrl}${route}`, {
      headers: headers,
    });
  } else {
    req = axios[method](`${baseUrl}${route}`, body, {
      headers: headers,
    });
  }
  return req
    .then((res) => res.data)
    .catch((err) => {
      throw err;
    });
}

exports.login = async () => {
  logger.info(`Making login query for authentication !`);
  const loginCredentials = {
    email: config.login.email,
    password: config.login.password
  };
  return await makeRequest(null, 'post', `/auth/login`, loginCredentials);
}