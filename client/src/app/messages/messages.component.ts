import { Component, OnInit, inject } from '@angular/core';
import { Message } from '../_models/messages';
import { Pagination } from '../_models/pagination';
import { MessageService } from '../_services/message.service';
import { CommonModule } from '@angular/common';
import { BubbleComponent } from './bubble/bubble.component';
import { MessagesUsers } from '../_models/MessagesUsers';
import { MemberCardComponent } from '../members/member-card/member-card.component';
import { Router } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { User } from '../_models/user';
import { take } from 'rxjs';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, BubbleComponent, MemberCardComponent],
  templateUrl: './messages.component.html',
})
export class MessagesComponent implements OnInit {
  messages: Message[] | undefined;
  pagination: Pagination | undefined;
  messagesUsers: MessagesUsers[] | undefined;
  container = 'Outbox';
  pageNumber = 1;
  pageSize = 5;

  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.getMessagesUsers();
  }

  getMessagesUsers() {
    this.messageService.getMessagesUsers(this.pageNumber, this.pageSize, this.container).subscribe({
      next: (res) => {
        this.messagesUsers = res.result;
        this.pagination = res.pagination;
      },
    });
  }

  goToMessage(targetUser: string) {
    this.router.navigateByUrl(`messages/${targetUser.toLowerCase()}`);
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  pageChange(pageNumber: number) {
    if (pageNumber === this.pageNumber) return;
    this.pageNumber = pageNumber;
    this.getMessagesUsers();
  }
}
