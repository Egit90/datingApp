import { Component, OnInit, inject } from '@angular/core';
import { HasRoleDirective } from '../../_directives/has-role.directive';
import { AccountService } from '../../_services/account.service';
import { User } from '../../_models/user';
import { CommonModule } from '@angular/common';
import { PhotoManagementComponent } from '../photo-management/photo-management.component';
import { UserManagementComponent } from '../user-management/user-management.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [HasRoleDirective, CommonModule, PhotoManagementComponent, UserManagementComponent],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  public users: boolean = false;
  private acountService = inject(AccountService);
  private user: User | undefined;
  constructor() {}

  ngOnInit(): void {
    this.acountService.currentUser$.subscribe({
      next: (user) => {
        if (!user) return;

        this.user = user;

        if (user.roles.includes('Admin')) {
          this.users = true;
          return;
        }
        this.users = false;
      },
    });
  }

  toggoleUsers() {
    if (!this.user?.roles.includes('Admin')) return;

    this.users = !this.users;
  }
}
