import React, { Component } from 'react';
import './App.css';

import Login from './components/Login.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      loggedIn: false
    };
    this.login = this.login.bind(this);
  }
  
  login(token) {
    this.setState({
      token: token,
      loggedIn: true
    })
  }
  
  render() {
    const isLoggedIn = this.state.loggedIn;
    let screen;
    
    if (isLoggedIn) {
      screen = <div>To be continued</div>;
    } else {
      screen = <Login onLogin={this.login} />;
    }

    return (
      <div>
        {screen}
      </div>
    );
  }
}

export default App;
