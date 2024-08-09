import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { ChatComponent } from './chat.component';
import { WebsocketService } from '../websocket-service/websocket.service';
import { MessageService } from '../websocket-service/message.service';
import { ChannelService } from '../websocket-service/channel.service';
import { Message } from '../../types/message';
import { Channel } from '../../types/channel';
import { User } from '../../types/user';

import { MockWebsocketService } from '../../mocks/MockWebSocketService';
import { MockMessageService } from '../../mocks/MockMessageService';
import { MockChannelService } from '../../mocks/MockChannelService';

describe('ChatComponent', () => {
	let component: ChatComponent;
	let fixture: ComponentFixture<ChatComponent>;
	let websocketService: MockWebsocketService;
	let messageService: MockMessageService;
	let mockChannel: Channel;
	let mockUser: User;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ChatComponent ],
			imports: [ FormsModule ],
			providers: [
				{ provide: WebsocketService, useClass: MockWebsocketService },
				{ provide: MessageService, useClass: MockMessageService },
				{ provide: ChannelService, useClass: MockChannelService },
				ChangeDetectorRef
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ChatComponent);
		component = fixture.componentInstance;

		websocketService = TestBed.inject(WebsocketService) as unknown as MockWebsocketService;
		messageService = TestBed.inject(MessageService) as unknown as MockMessageService;

		mockChannel = new Channel(1, 'Test Channel', 'red', Date.now());
		mockUser = new User(1, 'Test User', Date.now(), 'blue');

		component.channel = mockChannel;
		component.user = mockUser;
    
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should subscribe to messages and display them', () => {
		const mockMessage = new Message(mockUser, 'Hello', Date.now(), mockChannel);
		messageService.emitMessage(mockMessage);

		fixture.detectChanges();

		const messageElements = fixture.debugElement.queryAll(By.css('.chat-room-message'));
		expect(messageElements.length).toBe(1);
		expect(messageElements[0].nativeElement.textContent).toContain('Hello');
	});

	it('should send a message and clear input field', () => {
		const sendMessageSpy = spyOn(websocketService, 'sendMessage').and.callThrough();
		component.newMessage = 'Test Message';
		component.sendMessage();

		expect(sendMessageSpy).toHaveBeenCalled();
		expect(component.newMessage).toBe('');
	});

	it('should not send an empty message', () => {
		const sendMessageSpy = spyOn(websocketService, 'sendMessage').and.callThrough();
		component.newMessage = '';
		component.sendMessage();

		expect(sendMessageSpy).not.toHaveBeenCalled();
	});

	it('should scroll to bottom on new message', () => {
		component['messageContainer'] = {
			nativeElement: {
				scrollHeight: 0
			}
		} as ElementRef;

		const mockMessage = new Message(mockUser, 'Hello', Date.now(), mockChannel);
		messageService.emitMessage(mockMessage);

		// expect scroll to be higher than 1 (scrolled more than 0)
		expect(component['messageContainer'].nativeElement.scrollHeight).toBeGreaterThan(1);
	});

	it('should handle ngOnChanges', () => {
		const changeDetectorSpy = spyOn(component['cd'], 'detectChanges').and.callThrough();
		component.ngOnChanges();

		expect(component.messages).toEqual([]);
		expect(changeDetectorSpy).toHaveBeenCalled();
	});

	it('should unsubscribe on destroy', () => {
		const unsubscribeSpy = spyOn(component['messagesSubscription'], 'unsubscribe').and.callThrough();
		component.ngOnDestroy();

		expect(unsubscribeSpy).toHaveBeenCalled();
	});
});
