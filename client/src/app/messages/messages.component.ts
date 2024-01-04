import { Component, OnInit, inject } from '@angular/core';
import { Message } from '../_models/messages';
import { Pagination } from '../_models/pagination';
import { MessageService } from '../_services/message.service';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from './bubble/bubble.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, BubbleComponent],
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit {
  messages: Message[] | undefined;
  pagination: Pagination | undefined;
  container = 'Outbox';
  pageNumber = 1;
  pageSize = 5;

  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe({
      next: (resp) => {
        console.log(resp);
        this.messages = resp.result;
        this.pagination = resp.pagination;
      },
    });
  }
}
