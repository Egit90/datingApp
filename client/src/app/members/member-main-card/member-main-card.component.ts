import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../_models/member';

@Component({
  selector: 'app-member-main-card',
  standalone: true,
  imports: [],
  templateUrl: './member-main-card.component.html',
})
export class MemberMainCardComponent implements OnInit {
  @Input() member: Member | undefined;
  lastAvtiveDate = '';
  MemberSinceDate = '';

  constructor() {}
  ngOnInit(): void {
    if (!this.member) return;

    this.lastAvtiveDate = new Date(this.member.lastActive)
      .toISOString()
      .slice(0, 10);

    this.MemberSinceDate = new Date(this.member.created)
      .toISOString()
      .slice(0, 10);
  }
}
