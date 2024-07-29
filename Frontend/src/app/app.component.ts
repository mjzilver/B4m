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

	currentUser: User | null = new User(1, "Admin", "Admin", Date.now(), "red");
	selectedChannel: Channel | null = null;

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
	}

	login(user: UserLogin): void {
		if(user.existingUser) {
			this.currentUser = this.users.find(u => u.name === user.name && u.password === user.password) ?? null;
		} else {
			// register as new user
		}
	}

	logout(): void {
		this.currentUser = null;
		this.selectedChannel = null; 
	}

	selectChannel(channel: Channel): void {
		this.selectedChannel = channel;
		this.websocketService.getMessages(channel);

		// add the user to the channel
		this.websocketService.joinChannel(channel);
	}
}
