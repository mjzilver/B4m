import { Component, Input, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket-service/websocket.service';
import { Channel, NewChannel } from '../../types/channel';

@Component({
	selector: 'app-channel-management',
	templateUrl: './channel-management.component.html',
	styleUrl: './channel-management.component.css'
})
export class ChannelManagementComponent implements OnInit {
	// inputs are only for editing existing channels
	@Input() channel!: Channel | NewChannel | null;
	@Input() isEditMode: boolean = false;

	oldColor: string = '';
	showModal: boolean = false;

	allowedColors: string[] =  [
		"red", 
		"green", 
		"blue", 
		"yellow", 
		"purple", 
		"orange", 
		"pink", 
		"brown", 
		"white",
		"grey"
	];

	constructor(
		private webSocketService: WebsocketService
	) { }

	ngOnInit(): void { 
		if (this.channel) {
			this.oldColor = this.channel.color;
			this.isEditMode = true;
		} else {
			this.channel = new NewChannel();
			this.isEditMode = false;
		}
	}

	onSubmit() {
		if (this.channel) {
			if (this.isEditMode) {
				// force type as its not a new channel if we are editing
				const existingChannel = this.channel as Channel;
				this.webSocketService.updateChannel(existingChannel);
			} else {
				this.webSocketService.createChannel(this.channel);
			}
		}
		this.closeModal();
	}

	onDeleteChannel() {
		if (this.channel) {
			if (this.isEditMode) {
				// force type as its not a new channel if we are editing
				const existingChannel = this.channel as Channel;
				this.webSocketService.deleteChannel(existingChannel);
			}
		}
		this.closeModal();
	}

	openModal() {
		this.showModal = true;
	}

	closeModal() {
		this.showModal = false;
	}
}