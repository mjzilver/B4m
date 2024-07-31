import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../types/user';

@Component({
	selector: 'app-user-logout',
	templateUrl: './user-logout.component.html',
	styleUrl: './user-logout.component.css'
})
export class UserLogoutComponent {
    @Input() currentUser!: User | null; 
    @Output() logout: EventEmitter<void> = new EventEmitter<void>();

    onLogout(): void {
    	this.logout.emit(); 
    }
}