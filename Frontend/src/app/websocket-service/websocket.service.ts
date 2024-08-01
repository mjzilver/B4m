import { Injectable } from '@angular/core';
import { ConnectionService } from './connection.service';
import { MessageService } from './message.service';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';
import { ErrorService } from './error.service';
import { SocketResponse } from '../../types/socketMessage'
import { Message } from '../../types/message';
import { Channel, NewChannel } from '../../types/channel';
import { User, UserLogin } from '../../types/user';

@Injectable({
	providedIn: 'root',
})
export class WebsocketService {
	constructor(
        private wsConnectionService: ConnectionService,
        private messageService: MessageService,
        private channelService: ChannelService,
        private userService: UserService,
        private errorService: ErrorService
	) {
		this.wsConnectionService.connect('ws://localhost:3000');
		this.wsConnectionService.onMessage((event: MessageEvent) => this.handleMessage(event));
	}

	private handleMessage(event: MessageEvent): void {
		const parsed: SocketResponse = JSON.parse(event.data);

		//console.log(`Received message: ${JSON.stringify(parsed)}`);

		if (parsed.error) {
			console.error(parsed.error);
			this.errorService.setError(parsed.error);
			return;
		}

		this.errorService.setError(null);

		switch (parsed.command) {
		case 'broadcast':
			this.messageService.parseMessage(parsed.message!, this.channelService.getChannels());
			break;
		case 'messages':
			this.messageService.parseMessages(parsed.messages!, this.channelService.getChannels());
			break;
		case 'channels':
			this.channelService.parseChannels(parsed.channels!);
			break;
		case 'channelCreated':
		case 'channelUpdated':
			this.channelService.updateChannel(parsed.channel!);
			break;
		case 'channelDeleted':
			this.channelService.deleteChannel(parsed.channel!);
			break;
		case 'userJoinedChannel':
		case 'userLeftChannel':
			this.channelService.updateChannelUsers(parsed);
			break;
		case 'users':
			this.userService.parseUsers(parsed.users!);
			break;
		case 'userChanged':
		case 'login':
		case 'register':
			this.userService.handleLogin(parsed.user!);
			break;
		case 'logout':
			// this is a confirmation that the user has been logged out
			break;
		case 'error':
			console.error(parsed.error);
			this.errorService.setError(parsed.error!);
			break;
		default:
			console.warn(`Unknown command: ${parsed.command}`);
		}
	}

	// MESSAGE COMMANDS //
	sendMessage(message: Message): void {
		this.wsConnectionService.sendMessage({ command: 'broadcast', message });
	}

	getMessages(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'getMessages', channel });
	}

	// CHANNEL COMMANDS //

	getChannels(): void {
		this.wsConnectionService.sendMessage({ command: 'getChannels' });
	}

	joinChannel(channel: Channel, user: User): void {
		this.wsConnectionService.sendMessage({ command: 'joinChannel', channel, user });
	}

	leaveChannel(channel: Channel, user: User): void {
		this.wsConnectionService.sendMessage({ command: 'leaveChannel', channel, user });
	}

	createChannel(channel: Channel | NewChannel): void {
		this.wsConnectionService.sendMessage({ command: 'createChannel', channel });
	}

	updateChannel(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'updateChannel', channel });
	}

	deleteChannel(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'deleteChannel', channel });
	}

	// USER COMMANDS //
	getUsers(): void {
		this.wsConnectionService.sendMessage({ command: 'getUsers' });
	}

	updateUser(user: User): void {
		this.wsConnectionService.sendMessage({ command: 'updateUser', user });
	}

	attemptLogin(user: UserLogin): void {
		this.wsConnectionService.sendMessage({ command: 'loginUser', user });
	}

	registerUser(user: UserLogin): void {
		this.wsConnectionService.sendMessage({ command: 'registerUser', user });
	}

	logout(user: User, channel: Channel | null): void {
		this.wsConnectionService.sendMessage({ command: 'logoutUser', user, channel });
	}
}
