import { Component, Input, inject } from '@angular/core';
import { Message } from '../../_models/messages';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';
import { IntlModule } from 'angular-ecmascript-intl';

@Component({
  selector: 'app-bubble-inner',
  standalone: true,
  imports: [CommonModule, IntlModule],
  templateUrl: './bubble-inner.component.html',
})
export class BubbleInnerComponent {
  @Input() msg: Message | undefined;
  public accountService = inject(AccountService);
}
