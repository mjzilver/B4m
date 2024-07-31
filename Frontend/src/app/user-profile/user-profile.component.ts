import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../types/user';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  @Input() user!: User | null;
  
  showModal: boolean = false;

  allowedColors: string[] =  [
  	"red", 
  	"green", 
  	"blue", 
  	"yellow", 
  	"purple", 
  	"orange", 
  	"pink", 
  	"brown", 
  	"white"
  ];

  constructor() { }

  ngOnInit(): void { }

  onSubmit() {
  	throw new Error('Method not implemented.');
  }
  openModal() {
  	throw new Error('Method not implemented.');
  }
  closeModal() {
  	throw new Error('Method not implemented.');
  }

}
