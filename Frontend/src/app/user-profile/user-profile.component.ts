import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../types/user';
import { WebsocketService } from '../websocket-service/websocket.service';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
	@Input() user!: User | null;

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
		private WebSocketService: WebsocketService
	) { }

	ngOnInit(): void { }

	onSubmit() {
		if(this.user) {
			this.WebSocketService.updateUser(this.user);
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
