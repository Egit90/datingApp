import { Component, OnInit, inject } from '@angular/core';
import { Member } from '../_models/member';
import { MembersService } from '../_services/members.service';
import { MemberCardComponent } from '../members/member-card/member-card.component';
import { CommonModule } from '@angular/common';
import { Pagination } from '../_models/pagination';

@Component({
  selector: 'app-lists',
  standalone: true,
  imports: [MemberCardComponent, CommonModule],
  templateUrl: './lists.component.html',
})
export class ListsComponent implements OnInit {
  members: Member[] | undefined;
  pagination: Pagination | undefined;
  predicate = 'liked';
  private memberService = inject(MembersService);
  pageNumber = 1;
  pageSize = 5;
  ngOnInit(): void {
    this.loadLikes();
  }

  loadLikes() {
    this.memberService.getLikes(this.predicate, this.pageNumber, this.pageSize).subscribe({
      next: (resp) => {
        this.members = resp.result;
        this.pagination = resp.pagination;
      },
    });
  }

  toggolePredicate() {
    this.predicate = this.predicate === 'liked' ? 'likedBy' : 'liked';
    this.loadLikes();
  }

  pageChange(pageNumber: number) {
    if (this.pageNumber === pageNumber) return;
    this.pageNumber = pageNumber;
    this.loadLikes();
  }
  range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }
}
