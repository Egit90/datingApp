import { Component, OnInit, inject } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../_models/member';
import { CommonModule } from '@angular/common';
import { MemberCardComponent } from '../member-card/member-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, MemberCardComponent],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  members$: Observable<Member[]> | undefined;
  private memberService = inject(MembersService);

  constructor() {}

  ngOnInit(): void {
    this.members$ = this.memberService.getMembers();
  }
}
