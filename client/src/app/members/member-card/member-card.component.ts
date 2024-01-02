import { Component, Input, inject } from '@angular/core';
import { Member } from '../../_models/member';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MembersService } from '../../_services/members.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-member-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './member-card.component.html',
})
export class MemberCardComponent {
  @Input() member: Member | undefined;
  memberService = inject(MembersService);
  toaster = inject(ToastrService);

  constructor() {}

  addLike(member: Member) {
    debugger;
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toaster.success('you have liked ' + member.knownAs),
    });
  }
}
