import _ from 'lodash';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client/lib';
// import { createUploadLink } from 'apollo-upload-client/lib/main';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';

const auth = setContext((request, context) => {
  const headers = {};
  const token = sessionStorage.getItem('token');
  if (token && (request.operationName !== 'Login' || request.operationName !== 'SignUp')) {
    headers.authorization = `Bearer ${token}`;
  }
  const infoToken = sessionStorage.getItem('infoToken');
  if (infoToken) {
    headers['x-info-token'] = sessionStorage.getItem('infoToken');
  }
  return {
    ...context,
    headers: {
      ...context.headers,
      ...headers,
    },
  };
});

const upload = createUploadLink({ uri: '/api' });

const error = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (_.includes(message, 'jwt expired') || _.includes(message, 'You need to pass an authorization token') || _.includes(message, 'jwt malformed')) {
        sessionStorage.setItem('token', '');
        window.location = '/login';
      }
    });
  }
});

const client = new ApolloClient({
  connectToDevTools: true,
  link: ApolloLink.from([
    auth,
    error,
    upload,
  ]),
  cache: new InMemoryCache(),
});

export default client;
