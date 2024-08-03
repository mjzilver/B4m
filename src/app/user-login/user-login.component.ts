import { Component, EventEmitter, Output } from '@angular/core';
import {  UserLogin } from '../../types/user';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-user-login',
	templateUrl: './user-login.component.html',
	styleUrl: './user-login.component.css',
})
export class UserLoginComponent {
  @Output() login: EventEmitter<UserLogin> = new EventEmitter<UserLogin>();
  newUser: UserLogin = new UserLogin('', '');

  constructor(
    private authService: AuthService
  ) { }
  
  onLogin(): void {
  	this.newUser.existingUser = true;

  	this.authService.login(this.newUser);
  }

  onRegister() {
  	this.newUser.existingUser = false;

  	this.authService.login(this.newUser);
  }
}
