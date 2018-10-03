import React, { Component } from 'react';

class Login extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      user: '',
      pass: '',
    };
    
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handlePassChange = this.handlePassChange.bind(this);
    this.login = this.login.bind(this);
  }
  
  handleUserChange(event) { this.setState({user: event.target.value}); }
  handlePassChange(event) { this.setState({pass: event.target.value}); }
  
  login(event) {
    event.preventDefault();
    fetch('https://localhost:3003/api/v1/login', {
      method: 'POST',
      body: JSON.stringify({user: this.state.user, pass: this.state.pass})
    })
    .then(response => {
      if (response.ok) {
        response.json().then(json => {
          console.log(`Logged in with token '${json.token}'`);
        });
      }
    })
    .catch(error => console.error(error));
  }
  
  render() {
    return (
      <div id="login-form-container">
      <h1 id="login-form-title">Mehrmalist</h1>
      <form id="login-form" onSubmit={this.login}>
        <input type="text" id="login-user" placeholder="Nutzer" 
          value={this.state.user} 
          onChange={this.handleUserChange}/>
        <input type="password" id="login-pass" placeholder="Passwort" 
          value={this.state.pass} 
          onChange={this.handlePassChange}/>
        <input type="submit" value="Anmelden" />
      </form>
      </div>
    );
  };
}

export default Login;
