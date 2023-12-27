import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../_models/member';
import { ActivatedRoute } from '@angular/router';
import { MembersService } from '../../_services/members.service';
import { CommonModule } from '@angular/common';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { MemberPhotoComponent } from '../member-photo/member-photo.component';
import { MemberMainCardComponent } from '../member-main-card/member-main-card.component';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, MemberPhotoComponent, MemberMainCardComponent],
  templateUrl: './member-detail.component.html',
})
export class MemberDetailComponent implements OnInit {
  member: Member | undefined;
  intorBool: boolean = true;
  intrestBool: boolean = false;
  photoBool: boolean = false;
  messagesBool: boolean = false;
  images: string[] = [];

  constructor(
    private memberService: MembersService,
    private router: ActivatedRoute
  ) {}

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
      this.images.push(
        'https://flowbite.s3.amazonaws.com/docs/gallery/featured/image.jpg'
      );
    }
  }

  toogleTab(tabNumber: number) {
    switch (tabNumber) {
      case 1:
        this.intorBool = true;
        this.intrestBool = false;
        this.photoBool = false;
        this.messagesBool = false;
        break;
      case 2:
        this.intrestBool = true;
        this.intorBool = false;
        this.photoBool = false;
        this.messagesBool = false;

        break;
      case 3:
        this.photoBool = true;
        this.intorBool = false;
        this.intrestBool = false;
        this.messagesBool = false;
        break;
      case 4:
        this.messagesBool = true;
        this.photoBool = false;
        this.intorBool = false;
        this.intrestBool = false;
        break;
    }
  }
}
