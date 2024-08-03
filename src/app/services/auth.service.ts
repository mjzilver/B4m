import { Injectable } from "@angular/core";
import { WebsocketService } from "../websocket-service/websocket.service";
import { UserService } from "../websocket-service/user.service";
import { User, UserLogin } from "../../types/user";
import { Channel } from "../../types/channel";

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	constructor(
      private websocketService: WebsocketService,
      private userService: UserService
	) {}
  
	login(user: UserLogin): void {
		if (user.existingUser) {
			this.websocketService.attemptLogin(user);
		} else {
			this.websocketService.registerUser(user);
		}
        
		this.userService.currentUser$.subscribe((user: User | null) => {
			this.currentUser = user;
		});
	}
  
	logout(selectedChannel: Channel | null): void {
		if (!this.currentUser) 
			return;

		this.websocketService.logout(this.currentUser, selectedChannel);

		if (selectedChannel)
		    this.websocketService.leaveChannel(selectedChannel, this.currentUser);
		
		this.userService.handleLogout();

		this.currentUser = null;
		selectedChannel = null;
	}

	currentUser: User | null = null;

	getCurrentUser(): User | null {
		return this.currentUser;
	}
}
  