import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Channel } from '../../types/channel';
import { User } from '../../types/user';
import { UserService } from '../websocket-service/user.service';

@Component({
	selector: 'app-channel-list',
	templateUrl: './channel-list.component.html',
	styleUrl: './channel-list.component.css'
})
export class ChannelListComponent implements OnInit {
	@Input() channels: Channel[] = [];
	@Input() selectedChannel: Channel | null = null;
	@Output() selectChannel: EventEmitter<Channel> = new EventEmitter<Channel>();

	currentUser: User | null = null;

	constructor(
		private userService: UserService
	) { }

	ngOnInit(): void {
		this.userService.currentUser$.subscribe((user: User | null) => {
			this.currentUser = user;
		});

		this.userService.getCurrentUser();
	}

	onSelectChannel(channel: Channel): void {
		this.selectChannel.emit(channel);
	}
}
