import { gql } from 'react-apollo';

export const login = gql`
  mutation Login($email: String!) {
    login(email: $email) {
      _id
      email
      name
    }
  }
`;

export const users = gql`
query Users {
  users {
    _id
    email
    name
  }
}
`;
