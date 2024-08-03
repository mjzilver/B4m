import { Channel } from './channel';
import { MessageUser, User } from './user';

export class Message {
	user: User|MessageUser;
	text: string;
	time: number;
	channel: Channel;

	constructor(
		user: User|MessageUser,
		text: string,
		time: number = Date.now(),
		channel: Channel
	) {
		this.user = user;
		this.text = text;
		this.time = time;
		this.channel = channel;
	}

	getSerialized() {
		return {
			user: this.user.getSerialized(),
			text: this.text,
			time: this.time
		};
	}
}