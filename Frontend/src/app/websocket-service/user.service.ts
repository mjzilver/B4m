import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from '../../types/user';
import { SocketUser } from '../../types/socketMessage';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private userSubject = new Subject<User[]>();
	private currentUserSubject = new Subject<User | null>();

	users$ = this.userSubject.asObservable();
	currentUser$ = this.currentUserSubject.asObservable();

	private users: User[] = [];

	parseUsers(data: SocketUser[]): User[] {
		this.users = data.map(item => new User(item.id, item.name, item.joined, item.color));
		this.userSubject.next(this.users);
		return this.users;
	}

	handleLogin(user: SocketUser): void {
		const currentUser = new User(user.id, user.name, user.joined, user.color);
		this.currentUserSubject.next(currentUser);
	}

	handleLogout(): void {
		this.currentUserSubject.next(null);
	}
}
