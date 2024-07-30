import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Message } from '../types/message';
import { User, UserLogin } from '../types/user';
import { Channel } from '../types/channel';
import { SocketChannel, SocketMessage, SocketResponse, SocketUser } from '../types/socketMessage';

@Injectable({
	providedIn: 'root',
})
export class WebsocketService {
	private ws!: WebSocket;
	private messageSubject = new Subject<Message>();
	private channelSubject = new Subject<Channel[]>();
	private userSubject = new Subject<User[]>();
	private connectionStatusSubject = new Subject<boolean>();
	private currentUserSubject = new Subject<User | null>();
	private errorSubject = new Subject<string | null>();

	messages$: Observable<Message> = this.messageSubject.asObservable();
	channels$: Observable<Channel[]> = this.channelSubject.asObservable();
	users$: Observable<User[]> = this.userSubject.asObservable();
	connectionStatus$: Observable<boolean> = this.connectionStatusSubject.asObservable();
	currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
	currentError$: Observable<string | null> = this.errorSubject.asObservable();

	private channels: Channel[] = [];
	private users: User[] = [];

	constructor() {
		this.connect();
	}

	private connect(): void {
		this.ws = new WebSocket('ws://localhost:3000');

		this.ws.onmessage = (event: MessageEvent) => this.handleMessage(event);
		this.ws.onopen = () => this.handleOpen();
		this.ws.onclose = () => this.handleClose();
		this.ws.onerror = (error) => this.handleError(error);
	}

	private handleMessage(event: MessageEvent): void {
		const parsed: SocketResponse = JSON.parse(event.data);

		console.log(`Received message: ${JSON.stringify(parsed)}`);

		if (parsed.error) {
			console.error(parsed.error);
			this.errorSubject.next(parsed.error);
			return;
		}

		this.errorSubject.next(null);

		switch (parsed.command) {
		case 'broadcast':
			this.messageSubject.next(this.parseMessage(parsed.message!));
			break;
		case 'messages':
			this.parseMessages(parsed.messages!);
			break;
		case 'channels':
			this.channels = this.parseChannels(parsed.channels!);
			this.channelSubject.next(this.channels);
			break;
		case 'userJoinedChannel':
		case 'userLeftChannel':
			this.updateChannelUsers(parsed);
			break;
		case 'users':
			this.users = this.parseUsers(parsed.users!);
			this.userSubject.next(this.users);
			break;
		case 'login':
		case 'register':
			this.handleLogin(parsed.user!);
			break;
		default:
			console.warn(`Unknown command: ${parsed.command}`);
		}
	}

	private handleOpen(): void {
		this.connectionStatusSubject.next(true);
	}

	private handleClose(): void {
		this.connectionStatusSubject.next(false);

		// Attempt to reconnect after a delay
		setTimeout(() => this.connect(), 1000);
	}

	private handleError(error: Event): void {
		console.error('WebSocket error', error);
	}

	private parseMessages(data: SocketMessage[]): void {
		data.forEach((item: SocketMessage) => {
			const channel = this.channels.find(c => c.id === item.channel_id);
			const user = this.users.find(u => u.id === item.user_id);

			if (user && channel) {
				const message = new Message(user, item.text, item.time, channel);
				this.messageSubject.next(message);
			} else {
				console.warn('User or Channel not found for message', item);
			}
		});
	}

	private parseMessage(data: SocketMessage): Message {
		const user = this.users.find(u => u.id === data.user!.id);
		const channel = this.channels.find(c => c.id === data.channel!.id);

		if (!user || !channel) {
			throw new Error('User or Channel not found for message');
		}
		return new Message(user, data.text, data.time, channel);
	}

	private parseChannels(data: SocketChannel[]): Channel[] {
		return data.map(item => new Channel(item.id, item.name, item.color, item.created, item.password));
	}

	private updateChannelUsers(data: SocketResponse): void {
		const channel = this.channels.find(c => c.id === data.channel!.id);
		if (channel) {
			channel.users = this.parseUsers(data.channel!.users!);
		}
	}

	private parseUsers(data: SocketUser[]): User[] {
		return data.map(item => new User(item.id, item.name, item.joined, item.color));
	}

	private handleLogin(user: SocketUser): void {
		const currentUser = new User(user.id, user.name, user.joined, user.color);
		this.currentUserSubject.next(currentUser);
	}

	sendMessage(message: Message): void {
		this.sendObject({ command: 'broadcast', message });
	}

	getChannels(): void {
		this.sendObject({ command: 'getChannels' });
	}

	getUsers(): void {
		this.sendObject({ command: 'getUsers' });
	}

	joinChannel(channel: Channel, user: User): void {
		this.sendObject({ command: 'joinChannel', channel, user });
	}

	leaveChannel(channel: Channel, user: User): void {
		this.sendObject({ command: 'leaveChannel', channel, user });
	}

	getMessages(channel: Channel): void {
		this.sendObject({ command: 'getMessages', channel });
	}

	attemptLogin(user: UserLogin): void {
		this.sendObject({ command: 'loginUser', user });
	}

	registerUser(user: UserLogin): void {
		this.sendObject({ command: 'registerUser', user });
	}

	logout(user: User, channel: Channel | null): void {
		this.sendObject({ command: 'logout', user, channel });
	}

	private sendObject(obj: unknown): void {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(obj));
		} else {
			console.warn('WebSocket not open');
		}
	}
}
