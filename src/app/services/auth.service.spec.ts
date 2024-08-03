/* eslint-disable @typescript-eslint/no-unused-vars */

import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { WebsocketService } from '../websocket-service/websocket.service';
import { UserService } from '../websocket-service/user.service';
import { User, UserLogin } from '../../types/user';
import { Channel } from '../../types/channel';
import { BehaviorSubject, of } from 'rxjs';

import { MockWebsocketService } from '../../mocks/MockWebSocketService';
import { MockUserService } from '../../mocks/MockUserService';

describe('AuthService', () => {
	let service: AuthService;
	let websocketService: MockWebsocketService;
	let userService: MockUserService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				AuthService,
				{ provide: WebsocketService, useClass: MockWebsocketService },
				{ provide: UserService, useClass: MockUserService }
			]
		});

		service = TestBed.inject(AuthService);
		websocketService = TestBed.inject(WebsocketService) as unknown as MockWebsocketService;
		userService = TestBed.inject(UserService) as unknown as MockUserService;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should attempt login for existing users', () => {
		const user: UserLogin = new UserLogin('testuser', 'password');
		const attemptLoginSpy = spyOn(websocketService, 'attemptLogin');

		service.login(user);

		expect(attemptLoginSpy).toHaveBeenCalledWith(user);
	});

	it('should register new users', () => {
		const user: UserLogin = new UserLogin('testuser', 'password', false);
		const registerUserSpy = spyOn(websocketService, 'registerUser');

		service.login(user);

		expect(registerUserSpy).toHaveBeenCalledWith(user);
	});

	it('should update currentUser after login', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		userService.currentUser$ = of(user);

		service.login(new UserLogin('testuser', 'password'));

		expect(service.getCurrentUser()).toEqual(user);
	});

	it('should logout the current user', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		const channel: Channel = new Channel(1, 'testchannel', 'blue', Date.now());
		service['currentUser'] = user;

		const logoutSpy = spyOn(websocketService, 'logout');

		service.logout(channel);

		expect(logoutSpy).toHaveBeenCalledWith(user, channel);
		expect(service.getCurrentUser()).toBeNull();
	});

	it('should not logout if no current user', () => {
		const logoutSpy = spyOn(websocketService, 'logout');

		service.logout(null);

		expect(logoutSpy).not.toHaveBeenCalled();
	});

	it('should leave the channel when logging out', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		const channel: Channel = new Channel(1, 'testchannel', 'blue', Date.now());
		service['currentUser'] = user;

		const leaveChannelSpy = spyOn(websocketService, 'leaveChannel');

		service.logout(channel);

		expect(leaveChannelSpy).toHaveBeenCalledWith(channel, user);
	});

	it('should not leave the channel if no selected channel', () => {
		const user: User = new User(1, 'testuser', Date.now(), 'blue');
		service['currentUser'] = user;

		const leaveChannelSpy = spyOn(websocketService, 'leaveChannel');

		service.logout(null);

		expect(leaveChannelSpy).not.toHaveBeenCalled();
	});
});
