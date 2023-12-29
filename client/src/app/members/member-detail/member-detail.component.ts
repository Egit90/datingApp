import { Component, Input, OnInit, inject } from '@angular/core';
import { Member } from '../../_models/member';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from '../../_services/members.service';
import { CommonModule } from '@angular/common';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { MemberPhotoComponent } from '../member-photo/member-photo.component';
import { MemberMainCardComponent } from '../member-main-card/member-main-card.component';
import { AboutComponent } from './about/about.component';
import { InterestsComponent } from './interests/interests.component';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, MemberPhotoComponent, MemberMainCardComponent, AboutComponent, InterestsComponent],
  templateUrl: './member-detail.component.html',
})
export class MemberDetailComponent implements OnInit {
  private memberService = inject(MembersService);
  private router: ActivatedRoute = inject(ActivatedRoute);
  member: Member | undefined;

  aboutBool: boolean = true;
  intrestBool: boolean = false;
  photoBool: boolean = false;
  messagesBool: boolean = false;
  images: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    const username = this.router.snapshot.paramMap.get('username');
    if (!username) return;
    this.memberService.getMember(username).subscribe({
      next: (member) => {
        this.member = member;
        this.getImages();
      },
    });
  }

  getImages() {
    if (!this.member) return;
    for (const photo of this.member?.photos) {
      this.images.push(photo.url);
    }
  }

  toggleTab(tabNumber: number) {
    const tabBools = [false, false, false, false];
    if (tabNumber >= 1 && tabNumber <= tabBools.length) {
      tabBools[tabNumber - 1] = true;
      [this.aboutBool, this.intrestBool, this.photoBool, this.messagesBool] = tabBools;
    }
  }
}
