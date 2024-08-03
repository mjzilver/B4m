import { Component, OnDestroy, OnInit } from '@angular/core';
import { Channel } from '../types/channel';
import { User } from '../types/user';
import { WebsocketService } from './websocket-service/websocket.service'
import { ErrorService } from './websocket-service/error.service';
import { ConnectionService } from './websocket-service/connection.service';
import { ChannelService } from './websocket-service/channel.service';
import { UserService } from './websocket-service/user.service';
import { AuthService } from './services/auth.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
	title = 'frontend';
	channels: Channel[] = [];
	connectionReady = false;

	currentUser: User | null = null;
	selectedChannel: Channel | null = null;
	currentError: string | null = null;

	constructor(
		private websocketService: WebsocketService,
		private errorService: ErrorService,
		private connectionService: ConnectionService,
		private channelService: ChannelService,
		private userService: UserService,
		private authService: AuthService
	) {}

	ngOnDestroy(): void {
		if (this.selectedChannel) {
			this.websocketService.leaveChannel(this.selectedChannel, this.currentUser!);
		}

		if (this.currentUser) {
			this.authService.logout(this.selectedChannel);
		}
	}

	ngOnInit(): void {
		this.connectionService.connectionStatus$.subscribe(status => {
			this.connectionReady = status;

			if (this.connectionReady) {
				this.websocketService.getChannels(); 
			} else {
				this.currentError = 'Connection to server lost, please refresh the page';
			}
		});

		this.channelService.channels$.subscribe((channels: Channel[]) => {
			this.channels = channels;

			
			if(this.selectedChannel && !this.channels.includes(this.selectedChannel)) {
				this.selectedChannel = null;
				this.errorService.setError('Channel no longer exists, please select a new channel');
			}
		});

		this.channelService.currentChannel$.subscribe((channel: Channel | null) => {
			this.selectedChannel = channel;
		});

		this.errorService.currentError$.subscribe((error: string | null) => {
			this.currentError = error;
		});
		
		this.userService.currentUser$.subscribe((user: User | null) => {
			this.currentUser = user;
		});
	}

	logout() {
		this.authService.logout(this.selectedChannel);
	}

	selectChannel(channel: Channel): void {
		if (!this.currentUser) {
			console.error('No user selected');
			return;
		}

		if (this.selectedChannel) {
			this.websocketService.leaveChannel(this.selectedChannel, this.currentUser!);
		} 

		this.websocketService.getMessages(channel.toDTO());
		this.websocketService.joinChannel(channel, this.currentUser!);
		this.channelService.setCurrentChannel(channel);
	}
}
