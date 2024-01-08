import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/user';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  @ViewChild('dialog') dialog: ElementRef<HTMLDialogElement> | undefined;
  @ViewChild('admin') admin: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('moderator') moderator: ElementRef<HTMLInputElement> | undefined;
  @ViewChild('member') member: ElementRef<HTMLInputElement> | undefined;

  private adminService = inject(AdminService);
  public users: User[] = [];
  public selectedUser: User | undefined;
  private toaster = inject(ToastrService);

  ngOnInit(): void {
    this.getUsersWithRoles();
  }
  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: (user) => {
        this.users = user;
        console.log(this.users);
      },
      error: (err) => console.log(err),
    });
  }

  showModal(user: User) {
    this.selectedUser = user;
    this.dialog?.nativeElement.showModal();
  }

  clearUser() {
    this.selectedUser = undefined;
  }

  submit() {
    if (!this.selectedUser?.username) return;
    let admin = this.admin?.nativeElement.checked;
    let moderator = this.moderator?.nativeElement.checked;
    let member = this.member?.nativeElement.checked;
    debugger;
    let roles: string[] = [];

    if (admin) roles.push('Admin');
    if (moderator) roles.push('Moderator');
    if (member) roles.push('Member');

    let strRole = roles.join(',');

    this.adminService.editUserRole(this.selectedUser.username, strRole).subscribe({
      next: (_) => {
        this.toaster.success('Updated user Successfully');
        this.getUsersWithRoles();
      },
      error: (err) => this.toaster.error(`couldn\'t update the user roles ... ${err}`),
    });
  }
}
