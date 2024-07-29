import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'; 

import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { WebsocketService } from './websocket.service';
import { UserListComponent } from './user-list/user-list.component';

const routes: Routes = [
  { path: '', component: AppComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes) 
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
