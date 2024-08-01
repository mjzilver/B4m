import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChannelListComponent } from './channel-list.component';
import { Channel } from '../../types/channel';
import { ChannelManagementComponent } from '../channel-management/channel-management.component';

describe('ChannelListComponent', () => {
	let component: ChannelListComponent;
	let fixture: ComponentFixture<ChannelListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ ChannelListComponent, ChannelManagementComponent]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(ChannelListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should render all channels', () => {
		const channels: Channel[] = [
			new Channel(1, 'Channel 1', 'red', Date.now()),
			new Channel(2, 'Channel 2', 'blue', Date.now()),
		];
		component.channels = channels;
		fixture.detectChanges();

		const channelElements = fixture.debugElement.queryAll(By.css('.channels-card-item'));
		expect(channelElements.length).toBe(channels.length);
	});

	it('should highlight the selected channel', () => {
		const channels: Channel[] = [
			new Channel(1, 'Channel 1', 'red', Date.now()),
			new Channel(2, 'Channel 2', 'blue', Date.now()),
		];
		component.channels = channels;
		component.selectedChannel = channels[1];
		fixture.detectChanges();

		const selectedChannelElement = fixture.debugElement.query(By.css('.selected-channel'));
		expect(selectedChannelElement).not.toBeNull();
		expect(selectedChannelElement.nativeElement.textContent).toContain('Channel 2');
	});

	it('should emit selectChannel event when a channel is clicked', () => {
		const channels: Channel[] = [
			new Channel(1, 'Channel 1', 'red', Date.now()),
			new Channel(2, 'Channel 2', 'blue', Date.now()),
		];
		component.channels = channels;
		fixture.detectChanges();

		spyOn(component.selectChannel, 'emit');

		const button = fixture.debugElement.queryAll(By.css('.button-channel'))[1].nativeElement;
		button.click();
		fixture.detectChanges();

		expect(component.selectChannel.emit).toHaveBeenCalledWith(channels[1]);
	});

	it('should handle empty channel list', () => {
		component.channels = [];
		fixture.detectChanges();

		const channelElements = fixture.debugElement.queryAll(By.css('.channels-card-item'));
		expect(channelElements.length).toBe(0);
	});
});
