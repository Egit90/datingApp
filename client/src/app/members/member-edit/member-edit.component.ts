import { Component, HostListener, OnInit, ViewChild, inject } from '@angular/core';
import { Member } from '../../_models/member';
import { User } from '../../_models/user';
import { AccountService } from '../../_services/account.service';
import { MembersService } from '../../_services/members.service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MemberMainCardComponent } from '../member-main-card/member-main-card.component';
import { PhotoEditorComponent } from './photo-editor/photo-editor.component';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MemberMainCardComponent, PhotoEditorComponent],
  templateUrl: './member-edit.component.html',
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editFrom: NgForm | undefined;
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event: any) {
    if (this.editFrom?.dirty) {
      $event.returnValue = true;
    }
  }
  private memberService: MembersService = inject(MembersService);
  private accountService: AccountService = inject(AccountService);
  private toaster: ToastrService = inject(ToastrService);
  member: Member | undefined;
  user: User | null = null;
  editInfo = false;

  constructor() {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (usr) => (this.user = usr),
    });
  }

  ngOnInit(): void {
    this.loadMember();
  }

  loadMember() {
    if (!this.user) return;
    this.memberService.getMember(this.user.userName).subscribe({
      next: (member) => (this.member = member),
    });
  }

  toogleView() {
    this.editInfo = !this.editInfo;
  }

  updateMember() {
    this.memberService.updateMember(this.editFrom?.value).subscribe({
      next: (_) => {
        this.toaster.success('profile updated Successfully');
        this.editFrom?.reset(this.member);
      },
    });
  }
}
