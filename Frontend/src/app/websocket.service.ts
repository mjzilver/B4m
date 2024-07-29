import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../types/message';
import { User } from '../types/user';
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

	messages$ = this.messageSubject.asObservable();
	channels$ = this.channelSubject.asObservable();
	users$ = this.userSubject.asObservable();
	connectionStatus$ = this.connectionStatusSubject.asObservable();

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
			case 'users':
				this.users = this.parseUsers(parsed.users!);
				this.userSubject.next(this.users);
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
		const user = this.users.find((u) => u.id === data.user_id);
		const channel = this.channels.find((c) => c.id === data.channel_id);

		return new Message(user!, data.text, data.time, channel!);
	}

	private parseChannels(data: SocketChannel[]): Channel[] {
		return data.map(
			(item) =>
				new Channel(item.id, item.name, item.color, item.created, item.password)
		);
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
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(messageObject));
		}
	}

	public getChannels() {
		const messageObject = {
			command: 'getChannels',
		};

		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(messageObject));
		} else {
			console.log('WebSocket not open');
		}
	}

	public getUsers() {
		const messageObject = {
			command: 'getUsers',
		};

		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(messageObject));
		} else {
			console.log('WebSocket not open');
		}
	}

	joinChannel(channel: Channel) {
		const messageObject = {
			command: 'joinChannel',
			channel: channel,
		};

		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(messageObject));
		} else {
			console.log('WebSocket not open');
		}
	}

	getMessages(channel: Channel) {
		const messageObject = {
			command: 'getMessages',
			channel: channel,
		};

		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(messageObject));
		} else {
			console.log('WebSocket not open');
		}
	}
}
