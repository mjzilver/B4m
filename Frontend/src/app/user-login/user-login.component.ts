import { Component, EventEmitter, Output } from '@angular/core';
import {  UserLogin } from '../../types/user';

@Component({
	selector: 'app-user-login',
	templateUrl: './user-login.component.html',
	styleUrl: './user-login.component.css',
})
export class UserLoginComponent {
  @Output() login: EventEmitter<UserLogin> = new EventEmitter<UserLogin>();
  newUser: UserLogin = new UserLogin('', '');
  
  onLogin(): void {
  	this.login.emit(this.newUser);
  }

  onRegister() {
  	this.newUser.existingUser = false;

  	this.login.emit(this.newUser);
  }
}
