import { Component, OnInit } from '@angular/core';
import { Channel } from '../types/channel';
import { User, UserLogin } from '../types/user';
import { WebsocketService } from './websocket.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
	title = 'frontend';
	channels: Channel[] = [];
	users: User[] = [];
	connectionReady = false;

	currentUser: User | null = null;
	selectedChannel: Channel | null = null;
	currentError: string | null = null;

	constructor(private websocketService: WebsocketService) {}

	ngOnInit(): void {
		this.websocketService.connectionStatus$.subscribe(status => {
			this.connectionReady = status;

			if (this.connectionReady) {
				this.websocketService.getChannels(); 
				this.websocketService.getUsers();
			}
		});

		this.websocketService.channels$.subscribe((channels: Channel[]) => {
			this.channels = channels; 
		});

		this.websocketService.users$.subscribe((users: User[]) => {
			this.users = users;
		});

		this.websocketService.currentError$.subscribe((error: string | null) => {
			this.currentError = error;
		});
	}

	login(user: UserLogin): void {
		console.log('Logging in', user);

		if(user.existingUser) {
			this.websocketService.attemptLogin(user);
		} else {
			this.websocketService.registerUser(user);
		}

		this.websocketService.currentUser$.subscribe((user: User | null) => {
			this.currentUser = user;
		});
	}

	logout(): void {
		this.currentUser = null;
		this.selectedChannel = null; 
	}

	selectChannel(channel: Channel): void {
		if (!this.currentUser) {
			console.error('No user selected');
			return;
		}

		channel.messages = [];
		// leave old one
		if (this.selectedChannel) {
			this.websocketService.leaveChannel(this.selectedChannel, this.currentUser!);
		}

		this.selectedChannel = channel;
		
		this.websocketService.getMessages(channel);

		// add the user to the channel
		this.websocketService.joinChannel(channel, this.currentUser!);
	}
}
