import { Component, Input, inject } from '@angular/core';
import { Member } from '../../_models/member';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MembersService } from '../../_services/members.service';
import { ToastrService } from 'ngx-toastr';
import { PresenceService } from '../../_services/presence.service';

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
  router = inject(Router);
  public presenseService = inject(PresenceService);

  constructor() {}

  addLike(member: Member) {
    this.memberService.addLike(member.username).subscribe({
      next: () => this.toaster.success('you have liked ' + member.knownAs),
    });
  }
  goToMessages() {
    this.router.navigateByUrl(`messages/${this.member?.knownAs.toLowerCase()}`);
  }
}
