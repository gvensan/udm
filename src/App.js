import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import routes from './routes';
import store from './store';
import * as styles from './styles';
import Alert from './containers/alert';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div {...styles.rootStyles}>
          <Alert />
          <Router>
            {routes}
          </Router>
        </div>
      </Provider>
    );
  }
}

export default App;
