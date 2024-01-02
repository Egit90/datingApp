import { Component, OnInit, inject } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { Member } from '../../_models/member';
import { CommonModule } from '@angular/common';
import { MemberCardComponent } from '../member-card/member-card.component';
import { Pagination } from '../../_models/pagination';
import { UserParams } from '../../_models/userParams';
import { AccountService } from '../../_services/account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [FormsModule, CommonModule, MemberCardComponent],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  private memberService = inject(MembersService);
  private accountService = inject(AccountService);
  public pagination: Pagination | undefined;
  public userParams: UserParams | undefined;
  public members: Member[] = [];
  public genderList = [
    { value: 'male', display: 'Male' },
    { value: 'female', display: 'Female' },
  ];

  public genderFilter: string = '';

  constructor() {
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(orderBy?: string) {
    if (this.userParams) {
      if (orderBy) this.userParams.orderBy = orderBy;
      this.memberService.setUserParams(this.userParams);
      this.memberService.getMembers(this.userParams).subscribe({
        next: (Response) => {
          if (Response.result && Response.pagination) {
            this.members = Response.result;
            this.pagination = Response.pagination;
          }
        },
      });
    }
  }

  resetFilters() {
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }

  pageChange(pageNumber: number) {
    if (!this.userParams || pageNumber === this.userParams.pageNumber) return;
    this.userParams.pageNumber = pageNumber;
    this.memberService.setUserParams(this.userParams);
    this.loadMembers();
  }
}
