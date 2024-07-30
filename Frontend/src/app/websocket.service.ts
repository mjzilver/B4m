import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../types/message';
import { User, UserLogin } from '../types/user';
import { Channel } from '../types/channel';
import {
	SocketChannel,
	SocketMessage,
	SocketResponse,
	SocketUser,
} from '../types/socketMessage';

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

	messages$ = this.messageSubject.asObservable();
	channels$ = this.channelSubject.asObservable();
	users$ = this.userSubject.asObservable();
	connectionStatus$ = this.connectionStatusSubject.asObservable();
	currentUser$ = this.currentUserSubject.asObservable();
	currentError$ = this.errorSubject.asObservable();

	channels: Channel[] = [];
	users: User[] = [];

	constructor() {
		this.connect();
	}

	private connect() {
		this.ws = new WebSocket('ws://localhost:3000');

		this.ws.onmessage = async (event: MessageEvent) => {
			const parsed: SocketResponse = JSON.parse(event.data);

			console.log(`Received message: ${JSON.stringify(parsed)}`);

			if (parsed.error) {
				console.error(parsed.error);
				this.errorSubject.next(parsed.error);
				return;
			} else {
				this.errorSubject.next(null);
			}

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
				this.channels.find((c) => c.id === parsed.channel!.id)?.users.push(parsed.user!);
				this.channelSubject.next(this.channels);
				break;
			case 'userLeftChannel':
				this.userLeftChannel(parsed);
				break;
			case 'users':
				this.users = this.parseUsers(parsed.users!);
				this.userSubject.next(this.users);
				break;
			case 'login':
				this.loginResponse(parsed.user);
				break;
			case 'register':
				this.loginResponse(parsed.user, true);
				break;
			default:
				console.warn(`Unknown command: ${parsed.command}`);
			}
		};

		this.ws.onopen = () => {
			console.log('WebSocket connection established');
			this.connectionStatusSubject.next(true);
		};

		this.ws.onclose = () => {
			console.log('WebSocket connection closed');
			this.connectionStatusSubject.next(false);
			// Attempt to reconnect after a delay
			setTimeout(() => this.connect(), 1000);
		};

		this.ws.onerror = (error) => {
			console.error('WebSocket error', error);
		};
	}

	parseMessages(data: SocketMessage[]) {
		data.forEach((item: SocketMessage) => {
			const user = this.users.find((u) => u.id === item.user_id);
			const channel = this.channels.find((c) => c.id === item.channel_id);

			if (user && channel) {
				const message = new Message(user, item.text, item.time, channel);
				this.messageSubject.next(message);
			} else {
				console.warn('User or Channel not found for message', item);
			}
		});
	}

	private parseMessage(data: SocketMessage): Message {
		const user = this.users.find((u) => u.id === data.user!.id);
		const channel = this.channels.find((c) => c.id === data.channel!.id);

		if (!user || !channel) {
			throw new Error('User or Channel not found for message');
		}
		return new Message(user, data.text, data.time, channel);
	}

	private parseChannels(data: SocketChannel[]): Channel[] {
		return data.map(
			(item) =>
				new Channel(item.id, item.name, item.color, item.created, item.password)
		);
	}

	private userLeftChannel(data: SocketResponse) {
		const channel = this.channels.find((c) => c.id === data.channel!.id);
		const user = channel?.users.find((u) => u.id === data.user!.id);

		if (channel && user) {
			const index = channel.users.indexOf(user);
			channel.users.splice(index, 1);
		}
	}

	private parseUsers(data: SocketUser[]): User[] {
		return data.map(
			(item) => new User(item.id, item.name, item.joined, item.color)
		);
	}

	sendMessage(message: Message) {
		const messageObject = {
			command: 'broadcast',
			message: message,
		};

		this.sendObject(messageObject);
	}

	public getChannels() {
		const messageObject = {
			command: 'getChannels',
		};

		this.sendObject(messageObject);
	}

	public getUsers() {
		const messageObject = {
			command: 'getUsers',
		};

		this.sendObject(messageObject);
	}

	joinChannel(channel: Channel, user: User) {
		const messageObject = {
			command: 'joinChannel',
			channel: channel,
			user: user,
		};

		this.sendObject(messageObject);
	}

	leaveChannel(channel: Channel, user: User) {
		const messageObject = {
			command: 'leaveChannel',
			channel: channel,
			user: user,
		};

		this.sendObject(messageObject);
	}

	getMessages(channel: Channel) {
		const messageObject = {
			command: 'getMessages',
			channel: channel,
		};

		this.sendObject(messageObject);
	}

	attemptLogin(user: UserLogin) {
		const messageObject = {
			command: 'loginUser',
			user: user,
		};

		this.sendObject(messageObject);
	}

	loginResponse(user: SocketUser | undefined, newUser = false) {
		if (newUser) {
			console.log('Registration successful');
			const registeredUser = new User(user!.id, user!.name, user!.joined, user!.color);

			this.currentUserSubject.next(registeredUser);
		} else if (user) {
			console.log('Login successful');
			const loggedInUser = new User(user.id, user.name, user.joined, user.color);

			this.currentUserSubject.next(loggedInUser);
		}
	}

	registerUser(user: UserLogin) {
		const messageObject = {
			command: 'registerUser',
			user: user,
		};

		this.sendObject(messageObject);
	}

	sendObject(obj: unknown) {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(obj));
		} else {
			console.log('WebSocket not open');
		}
	}
}
