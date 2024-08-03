import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'; 

import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { WebsocketService } from './websocket-service/websocket.service';
import { UserListComponent } from './user-list/user-list.component';
import { UserLoginComponent } from './user-login/user-login.component';
import { UserLogoutComponent } from './user-logout/user-logout.component';
import { ChannelListComponent } from './channel-list/channel-list.component';
import { ErrorDisplayComponent } from './error-display/error-display.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ConnectionService } from './websocket-service/connection.service';
import { UserService } from './websocket-service/user.service';
import { ChannelService } from './websocket-service/channel.service';
import { MessageService } from './websocket-service/message.service';
import { AuthService } from './services/auth.service';
import { ChannelManagementComponent } from "./channel-management/channel-management.component";

const routes: Routes = [
	{ path: '', component: AppComponent },
];

@NgModule({
	declarations: [
		AppComponent,
		ChatComponent,
		UserListComponent,
		UserProfileComponent,
		UserLoginComponent,
		UserLogoutComponent,
		ChannelListComponent,
		ChannelManagementComponent,
		ErrorDisplayComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		RouterModule.forRoot(routes)
	],
	providers: [
		WebsocketService,
		UserService,
		ChannelService,
		MessageService,
		ConnectionService,
		AuthService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
