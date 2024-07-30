import { Channel } from './channel';
import { User } from './user';

export class Message {
	user: User;
	text: string;
	time: number;
	channel: Channel;

	constructor(
		user: User,
		text: string,
		time: number = Date.now(),
		channel: Channel
	) {
		this.user = user;
		this.text = text;
		this.time = time;
		this.channel = channel;
	}
}

export class MessageData {
	user_id: number;
	text: string;
	channel_id: number;
	time: number;

	constructor(
		user_id: number,
		text: string,
		channel_id: number,
		time: number = Date.now()
	) {
		this.user_id = user_id;
		this.text = text;
		this.channel_id = channel_id;
		this.time = time;
	}
}