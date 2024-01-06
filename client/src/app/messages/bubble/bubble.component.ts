import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, Input, OnInit, ViewChild, inject } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Message } from '../../_models/messages';
import { MessageService } from '../../_services/message.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../../_models/pagination';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IntlModule } from 'angular-ecmascript-intl';
import { BubbleInnerComponent } from '../bubble-inner/bubble-inner.component';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule, IntlModule, BubbleInnerComponent],
  templateUrl: './bubble.component.html',
})
export class BubbleComponent implements OnInit, AfterViewChecked {
  private messageService = inject(MessageService);
  public messages: Message[] | undefined;
  private router: ActivatedRoute = inject(ActivatedRoute);
  private toaster = inject(ToastrService);
  pagination: Pagination | undefined;
  pageNumber = 1;
  pageSize = 5;
  newMessageContent: string = '';
  targetUser = '';
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  ngOnInit(): void {
    const username = this.router.snapshot.paramMap.get('username');
    if (!username) {
      this.toaster.error('There is no Username!');
      return;
    }
    this.targetUser = username;
    this.loadMessageThread();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadMessageThread() {
    this.messageService.getMessageThread(this.pageNumber, this.pageSize, this.targetUser).subscribe({
      next: (resp) => {
        this.messages = resp.result;
        console.log(this.messages);
        this.pagination = resp.pagination;
      },
    });
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  pageChange(pageNumber: number) {
    if (pageNumber === this.pageNumber) return;
    this.pageNumber = pageNumber;
    this.loadMessageThread();
  }

  sendMesg() {
    debugger;
    this.messageService.sendMessage(this.targetUser, this.newMessageContent).subscribe({
      next: (_) => {
        this.toaster.success('message was sent');
        this.loadMessageThread();
      },
      error: (err) => {
        console.log(err);
        this.toaster.error(err.massage);
      },
    });
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }
}
