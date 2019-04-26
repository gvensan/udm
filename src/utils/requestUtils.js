const axios = require('axios');

exports.objectToQueryString = (obj) => {
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

exports.makeRequest = (method, route, body, config) => {
  const user = sessionStorage.getItem('user');
  const headers = config ? config.headers : {};
  if (user) {
    headers['x-info-token'] = user;
  }
  
  var req = undefined;
  if (method === 'get' || method === 'delete') {
    req = axios[method](`${route}`, {
      headers: headers,
    });
  } else {
    req = axios[method](`${route  }`, body, {
      headers: headers,
    });
  }
  return req
    .then((result) => result)
    .catch((err) => {
      throw err;
    });
}
