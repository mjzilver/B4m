import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { Message } from '../../types/message';
import { Channel } from '../../types/channel';
import { User } from '../../types/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() channel!: Channel;
  @Input() user!: User;

  messages: Message[] = [];
  newMessage: string = '';
  private messagesSubscription!: Subscription;

  constructor(
    private websocketService: WebsocketService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.messages = []; 

    // Subscribe to WebSocket messages
    this.messagesSubscription = this.websocketService.messages$.subscribe((message) => {
      if (message.channel?.id === this.channel.id) {
        this.messages.push(message);
        this.cd.detectChanges(); 
      }
    });
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }

  ngOnChanges(): void {
    if (this.channel) {
      this.messages = [];
      this.cd.detectChanges(); 
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim()) {
      let message = new Message(this.user, this.newMessage, Date.now(), this.channel);

      this.websocketService.sendMessage(message);
      this.newMessage = '';
      this.cd.detectChanges(); 
    }
  }
}
