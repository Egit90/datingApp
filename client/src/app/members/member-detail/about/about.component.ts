import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../../_models/member';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  @Input() member: Member | undefined;
  lastAvtiveDate = '';
  MemberSinceDate = '';

  ngOnInit(): void {
    if (!this.member) return;
    this.lastAvtiveDate = new Date(this.member.lastActive).toISOString().slice(0, 10);
    this.MemberSinceDate = new Date(this.member.created).toISOString().slice(0, 10);
  }
}
