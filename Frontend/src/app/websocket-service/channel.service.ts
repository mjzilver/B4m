import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Channel } from '../../types/channel';
import { User } from '../../types/user';
import { SocketChannel, SocketResponse } from '../../types/socketMessage';

@Injectable({
	providedIn: 'root',
})
export class ChannelService {
	private channelSubject = new Subject<Channel[]>();
	channels$ = this.channelSubject.asObservable();

	private channels: Channel[] = [];

	// Parse and emit channels
	parseChannels(data: SocketChannel[]): Channel[] {
		this.channels = data.map(item => new Channel(item.id, item.name, item.color, item.created, item.owner_id, item.password));
		this.channelSubject.next(this.channels);
		return this.channels;
	}

	// update or add a channel
	updateChannel(data: SocketChannel): void {
		const channel = this.channels.find(c => c.id === data.id);
		if (channel) {
			channel.name = data.name;
			channel.color = data.color;
			channel.created = data.created;
			channel.password = data.password;
			channel.ownerId = data.owner_id;
		} else {
			this.channels.push(new Channel(data.id, data.name, data.color, data.created, data.owner_id, data.password));
		}
	}

	// Update the users in 1 channel
	updateChannelUsers(data: SocketResponse): void {
		const channel = this.channels.find(c => c.id === data.channel?.id);
		if (channel) {
			channel.users = data.channel!.users!.map(item => new User(item.id, item.name, item.joined, item.color));
		}
	}

	deleteChannel(data: SocketChannel) {
		this.channels = this.channels.filter(c => c.id !== data.id);
		this.channelSubject.next(this.channels);
	}

	getChannels(): Channel[] {
		return this.channels;
	}
}
