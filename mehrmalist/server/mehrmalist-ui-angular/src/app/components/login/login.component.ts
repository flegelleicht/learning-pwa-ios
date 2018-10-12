import { Component, OnInit, ViewChild, ElementRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { Login } from './login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
@Injectable()
export class LoginComponent implements OnInit {
  @ViewChild('loginUser') loginUserRef: ElementRef;
  @ViewChild('loginPass') loginPassRef: ElementRef;

  constructor(
    private http: HttpClient) { 
  }

  ngOnInit() {
  }

  login(event) {
    event.preventDefault();
    console.info(`Logging in with ${this.loginUserRef.nativeElement.value}:${this.loginPassRef.nativeElement.value}`);
    this.http.post<Login>('https://localhost:3003/api/v1/login', 
      {user: this.loginUserRef.nativeElement.value,
      pass: this.loginPassRef.nativeElement.value}).pipe(
      tap(res => console.log(`Got response: ${res}`)),
      catchError((res, e) => of(res))
    ).subscribe((res) => console.log(res.token));
  }
}
