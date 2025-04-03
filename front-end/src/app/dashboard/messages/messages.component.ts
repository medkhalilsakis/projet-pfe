import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  imports:[
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class MessagesComponent {

}
