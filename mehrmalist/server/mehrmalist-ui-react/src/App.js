import React, { Component } from 'react';
import './App.css';

import Login  from './components/Login.js';
import Logout from './components/Logout.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      loggedIn: false
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  login(token) {
    this.setState({
      token: token,
      loggedIn: true
    })
  }
  
  logout() {
    this.setState({
      token: null,
      loggedIn: false
    });
  }
  
  render() {
    return (
      <div>
        { 
          !this.state.loggedIn ? 
          <Login onLogin={this.login} /> 
          :
          <Logout onLogout={this.logout}/>
        }
      </div>
    );
  }
}

export default App;
