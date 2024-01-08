import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Message } from '../../_models/messages';
import { MessageService } from '../../_services/message.service';
import { ActivatedRoute } from '@angular/router';
import { Pagination } from '../../_models/pagination';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { IntlModule } from 'angular-ecmascript-intl';
import { BubbleInnerComponent } from '../bubble-inner/bubble-inner.component';
import { take } from 'rxjs';
import { User } from '../../_models/user';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [CommonModule, FormsModule, IntlModule, BubbleInnerComponent],
  templateUrl: './bubble.component.html',
})
export class BubbleComponent implements OnInit, AfterViewChecked, OnDestroy {
  public messages: Message[] | undefined;
  private router: ActivatedRoute = inject(ActivatedRoute);

  private toaster = inject(ToastrService);
  public messageService = inject(MessageService);
  private accountService = inject(AccountService);
  public newMessageContent: string = '';

  pagination: Pagination | undefined;
  pageNumber = 1;
  pageSize = 5;
  targetUser = '';
  user?: User;

  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('editForm') editForm: NgForm | undefined;

  ngOnInit(): void {
    const username = this.router.snapshot.paramMap.get('username');
    if (!username) {
      this.toaster.error('There is no Username!');
      return;
    }
    this.targetUser = username;

    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) this.user = user;
      },
    });

    this.loadMessageThread();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadMessageThread() {
    if (!this.user) return;
    this.messageService.createHubConnection(this.user, this.targetUser);
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  pageChange(pageNumber: number) {
    if (pageNumber === this.pageNumber) return;
    this.pageNumber = pageNumber;
  }

  sendMesg() {
    this.messageService.sendMessage(this.targetUser, this.newMessageContent).then(() => {
      this.editForm?.reset();
    });
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}
