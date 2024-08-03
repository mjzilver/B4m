/* eslint-disable @typescript-eslint/no-unused-vars */

import { Subject } from "rxjs";
import { Channel } from "../types/channel";


export class MockChannelService {
    private channelSubject = new Subject<Channel[]>();
	channels$ = this.channelSubject.asObservable();

	private currentChannel: Channel | null = null;
	currentChannel$ = new Subject<Channel | null>();
}