import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ChannelManagementComponent } from './channel-management.component';
import { WebsocketService } from '../websocket-service/websocket.service';
import { Channel, NewChannel } from '../../types/channel';

import { MockWebsocketService } from '../../mocks/MockWebSocketService';

describe('ChannelManagementComponent', () => {
	let component: ChannelManagementComponent;
	let fixture: ComponentFixture<ChannelManagementComponent>;
	let websocketService: WebsocketService;
	let createChannelSpy: jasmine.Spy;
	let updateChannelSpy: jasmine.Spy;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [FormsModule],
			declarations: [ChannelManagementComponent],
			providers: [
				{ provide: WebsocketService, useClass: MockWebsocketService }
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ChannelManagementComponent);
		component = fixture.componentInstance;
		websocketService = TestBed.inject(WebsocketService);
		createChannelSpy = spyOn(websocketService, 'createChannel');
		updateChannelSpy = spyOn(websocketService, 'updateChannel');
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should open the modal when openModal is called', () => {
		component.openModal();
		expect(component.showModal).toBeTrue();
	});

	it('should close the modal when closeModal is called', () => {
		component.showModal = true;
		component.closeModal();
		expect(component.showModal).toBeFalse();
	});

	it('should call createChannel and closeModal on form submit when in create mode', () => {
		const newChannel: NewChannel = { name: 'New Channel', color: 'red', password: '' };
		component.channel = newChannel;
		component.isEditMode = false;
		component.showModal = true;
		fixture.detectChanges();

		const form: DebugElement = fixture.debugElement.query(By.css('form'));
		form.triggerEventHandler('ngSubmit', null);

		expect(createChannelSpy).toHaveBeenCalledWith(newChannel);
		expect(component.showModal).toBeFalse();
	});

	it('should call updateChannel and closeModal on form submit when in edit mode', () => {
		const existingChannel = new Channel(1, 'Existing Channel', 'blue', Date.now());
		component.channel = existingChannel;
		component.isEditMode = true;
		component.showModal = true;
		fixture.detectChanges();

		const form: DebugElement = fixture.debugElement.query(By.css('form'));
		form.triggerEventHandler('ngSubmit', null);

		expect(updateChannelSpy).toHaveBeenCalledWith(existingChannel);
		expect(component.showModal).toBeFalse();
	});
});
