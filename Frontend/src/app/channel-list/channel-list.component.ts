import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Channel } from '../../types/channel';

@Component({
	selector: 'app-channel-list',
	templateUrl: './channel-list.component.html',
	styleUrl: './channel-list.component.css'
})
export class ChannelListComponent {
	@Input() channels: Channel[] = [];
	@Input() selectedChannel: Channel | null = null;
	@Output() selectChannel: EventEmitter<Channel> = new EventEmitter<Channel>();

	onSelectChannel(channel: Channel): void {
		this.selectChannel.emit(channel);
	}
}
