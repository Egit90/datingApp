import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../_models/user';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  user: User | undefined;

  constructor(public accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        if (!user) {
          this.user = undefined;
          return;
        }
        this.user = user;
      },
    });
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
