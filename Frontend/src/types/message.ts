import { Channel } from './channel';
import { User } from './user';

export class Message {
  user: User;
  text: string;
  time: number;
  channel?: Channel;

  constructor(
    user: User,
    text: string,
    time: number = Date.now(),
    channel?: Channel
  ) {
    this.user = user;
    this.text = text;
    this.time = time;
    this.channel = channel;
  }
}
