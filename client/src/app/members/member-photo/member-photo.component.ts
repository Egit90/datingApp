import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-member-photo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-photo.component.html',
})
export class MemberPhotoComponent implements OnInit {
  @Input() srcList: string[] | undefined;
  currentImg: string = '';
  ngOnInit(): void {
    if (this.srcList) this.currentImg = this.srcList[0];
  }
  setCurrectImg(newImg: string) {
    this.currentImg = newImg;
  }
}
