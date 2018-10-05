import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  state = {
    user: 'Hello',
    pass: 'World',
  };

  constructor() { 
  }

  ngOnInit() {
  }

  handleChangeUser(event) {
    console.info(`handleChangeUser: ${event.target.value}`);
    this.state.user = event.target.value;
  }

  handleChangePass(event) {
    this.state.pass = event.target.value;
  }

  login(event) {
    event.preventDefault();
    console.info(`Logging in with ${this.state.user}:${this.state.pass}`);
  }
}
