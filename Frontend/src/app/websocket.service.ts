import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from '../types/message';
import { User } from '../types/user';
import { Channel } from '../types/channel';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private ws!: WebSocket;
  private messageSubject = new Subject<Message>();
  private channelSubject = new Subject<Channel[]>();
  private userSubject = new Subject<User[]>();
  private connectionStatusSubject = new Subject<boolean>();

  messages$ = this.messageSubject.asObservable();
  channels$ = this.channelSubject.asObservable();
  users$ = this.userSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  channels: Channel[] = [];
  users: User[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onmessage = async (event: MessageEvent) => {
      let parsed = JSON.parse(event.data); // Remove await

      console.log(`Received message: ${JSON.stringify(parsed)}`);

      switch (parsed.command) {
        case 'broadcast':
          this.messageSubject.next(this.parseMessage(parsed.message));
          break;
        case 'messages':
          this.parseMessages(parsed.messages);
          break;
        case 'channels':
          this.channels = this.parseChannels(parsed.channels);
          this.channelSubject.next(this.channels);
          break;
        case 'users':
          this.users = this.parseUsers(parsed.users);
          this.userSubject.next(this.users);
          break;
        default:
          console.warn(`Unknown command: ${parsed.command}`);
      }
    };

    this.ws.onopen = () => {
      console.log('WebSocket connection established');
      this.connectionStatusSubject.next(true);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.connectionStatusSubject.next(false);
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(), 1000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error', error);
    };
  }

  parseMessages(data: any[]) {
    data.forEach((item: any) => {
      const user = this.users.find((u) => u.id === item.user_id);
      const channel = this.channels.find((c) => c.id === item.channel_id);

      if (user && channel) {
        const message = new Message(user, item.message, item.time, channel);
        this.messageSubject.next(message);
      } else {
        console.warn('User or Channel not found for message', item);
      }
    });
  }

  private parseMessage(data: any): Message {
    return new Message(
      new User(
        data.user.id,
        data.user.name,
        data.user.password,
        data.user.createdAt,
        data.user.color
      ),
      data.text,
      data.times,
      new Channel(
        data.channel.id,
        data.channel.name,
        data.channel.color,
        data.channel.createdAt,
        data.channel.password
      )
    );
  }

  private parseChannels(data: any[]): Channel[] {
    return data.map(
      (item) =>
        new Channel(
          item.id,
          item.name,
          item.color,
          item.createdAt,
          item.password
        )
    );
  }

  private parseUsers(data: any[]): User[] {
    return data.map(
      (item) =>
        new User(item.id, item.name, item.password, item.joined, item.color)
    );
  }

  sendMessage(message: Message) {
    let messageObject = {
      command: 'broadcast',
      message: message,
    };
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    }
  }

  public getChannels() {
    let messageObject = {
      command: 'getChannels',
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    } else {
      console.log('WebSocket not open');
    }
  }

  public getUsers() {
    let messageObject = {
      command: 'getUsers',
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    } else {
      console.log('WebSocket not open');
    }
  }

  joinChannel(channel: Channel) {
    let messageObject = {
      command: 'joinChannel',
      channel: channel,
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    } else {
      console.log('WebSocket not open');
    }
  }

  getMessages(channel: Channel) {
    let messageObject = {
      command: 'getMessages',
      channel: channel,
    };

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageObject));
    } else {
      console.log('WebSocket not open');
    }
  }
}
