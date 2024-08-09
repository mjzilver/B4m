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
import { environment } from '../../environments/environment';

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
		this.wsConnectionService.connect(environment.websocketUrl);
		this.wsConnectionService.onMessage((event: MessageEvent) => this.handleMessage(event));
	}

	private handleMessage(event: MessageEvent): void {
		const parsed: SocketResponse = JSON.parse(event.data);

		console.log(`Received message: ${JSON.stringify(parsed)}`);

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
		case 'userUpdated':
		case 'loginUser':
		case 'registerUser':
			this.userService.handleLogin(parsed.user!);
			break;
		case 'logoutUser':
			this.channelService.removeUserFromChannels(parsed.user!.id ?? -1);
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
		this.wsConnectionService.sendMessage({ command: 'broadcastMessage', message });
	}

	getMessages(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'getMessages', channel });
	}

	// CHANNEL COMMANDS //

	getChannels(): void {
		this.wsConnectionService.sendMessage({ command: 'getChannels' });
	}

	joinChannel(channel: Channel, user: User): void {
		this.wsConnectionService.sendMessage({ command: 'joinChannel', "channel": channel.getSerialized(), user });
	}

	leaveChannel(channel: Channel, user: User): void {
		this.wsConnectionService.sendMessage({ command: 'leaveChannel', "channel": channel.getSerialized(), user });
	}

	createChannel(channel: Channel | NewChannel): void {
		this.wsConnectionService.sendMessage({ command: 'createChannel', channel });
	}

	updateChannel(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'updateChannel', channel: channel.toDTO() });
	}

	deleteChannel(channel: Channel): void {
		this.wsConnectionService.sendMessage({ command: 'deleteChannel', channel: channel.toDTO() });
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
