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
    return (
      <div>
        {this.state.loggedIn ? 
          <div>!</div> : <Login onLogin={this.login} /> }
      </div>
    );
  }
}

export default App;
