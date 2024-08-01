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
		this.channels = data.map(item => new Channel(item.id, item.name, item.color, item.created, item.password));
		this.channelSubject.next(this.channels);
		return this.channels;
	}

	// Update the users in 1 channel
	updateChannelUsers(data: SocketResponse): void {
		const channel = this.channels.find(c => c.id === data.channel?.id);
		if (channel) {
			channel.users = data.channel!.users!.map(item => new User(item.id, item.name, item.joined, item.color));
		}
	}

	getChannels(): Channel[] {
		return this.channels;
	}
}
