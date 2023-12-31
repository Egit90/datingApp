import { Component, OnInit, inject } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../_models/member';
import { CommonModule } from '@angular/common';
import { MemberCardComponent } from '../member-card/member-card.component';
import { Observable } from 'rxjs';
import { Pagination } from '../../_models/pagination';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, MemberCardComponent],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  // members$: Observable<Member[]> | undefined;
  members: Member[] = [];
  private memberService = inject(MembersService);
  pagination: Pagination | undefined;
  pageNumber = 1;
  pageSize = 5;

  constructor() {}

  ngOnInit(): void {
    // this.members$ = this.memberService.getMembers();
    this.loadMembers();
  }

  loadMembers() {
    this.memberService.getMembers(this.pageNumber, this.pageSize).subscribe({
      next: (Response) => {
        if (Response.result && Response.pagination) {
          this.members = Response.result;
          this.pagination = Response.pagination;
        }
      },
    });
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  pageChange(pageNumber: number) {
    if (pageNumber === this.pageNumber) return;
    this.pageNumber = pageNumber;
    this.loadMembers();
  }
}
