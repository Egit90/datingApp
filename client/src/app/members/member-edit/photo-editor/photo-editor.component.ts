import { Component, Input, OnInit, inject } from '@angular/core';
import { Member } from '../../../_models/member';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../../_services/file-upload.service';
import { Observable, take } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { MembersService } from '../../../_services/members.service';
import { User } from '../../../_models/user';
import { AccountService } from '../../../_services/account.service';
import { Photo } from '../../../_models/photo';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-editor.component.html',
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined;
  user: User | undefined;
  images: string[] = [];
  private uploadService = inject(FileUploadService);
  private accountService = inject(AccountService);
  private memberService = inject(MembersService);
  currentFile?: File;
  message = '';
  fileInfos?: Observable<any>;

  constructor() {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (usr) => {
        if (usr) this.user = usr;
      },
    });
  }

  ngOnInit(): void {
    if (!this.member) return;
    for (let i of this.member.photos) {
      this.images.push(i.url);
    }
  }

  selectFile(event: any): void {
    this.currentFile = event.target.files.item(0);
  }

  upload(): void {
    debugger;
    if (this.currentFile) {
      this.uploadService.upload(this.currentFile).subscribe({
        next: (event) => {
          if (event instanceof HttpResponse && event.status === 201) {
            this.message = 'Success!';
            const imageUrl = event.body.url;
            this.member?.photos.push(event.body);
          }
        },
        error: (err: any) => {
          console.log(err);

          if (err.error && err.error.message) {
            this.message = err.error.message;
          } else {
            this.message = 'Could not upload the file!';
          }
        },
        complete: () => {
          this.currentFile = undefined;
        },
      });
    }
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo.id).subscribe({
      next: () => {
        if (this.user && this.member) {
          this.user.photoUrl = photo.url;
          this.accountService.setCurrentUser(this.user);
          this.member.photoUrl = photo.url;
          this.member.photos.forEach((p) => {
            if (p.isMain) p.isMain = false;
            if (p.id === photo.id) p.isMain = true;
          });
        }
      },
    });
  }

  deletePhoto(photo: Photo) {
    this.memberService.deletePhoto(photo.id).subscribe({
      next: () => {
        if (this.member?.photos) this.member.photos = this.member?.photos.filter((x) => x.id !== photo.id);
      },
    });
  }
}
