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

	private currentChannel: Channel | null = null;
	currentChannel$ = new Subject<Channel | null>();	

	private channels: Channel[] = [];

	// Parse and emit channels
	parseChannels(data: SocketChannel[]): Channel[] {
		this.channels = data.map(item => new Channel(item.id, item.name, item.color, item.created, item.ownerId, item.password));
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
			channel.ownerId = data.ownerId;
		} else {
			this.channels.push(new Channel(data.id, data.name, data.color, data.created, data.ownerId, data.password));
		}
	}

	// Update the users in 1 channel
	updateChannelUsers(data: SocketResponse): void {
		const channel = this.channels.find(c => c.id === data.channel?.id);
		if (channel && data.channel?.users) {
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

	setCurrentChannel(channel: Channel | null): void {
		this.currentChannel = channel;
		this.currentChannel$.next(channel);
	}

	removeUserFromChannels(userId: number): void {
		this.channels.forEach(channel => {
			channel.users = channel.users.filter(user => user.id !== userId);
		});
	}
}
