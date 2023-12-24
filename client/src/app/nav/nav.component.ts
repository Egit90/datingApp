import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { User } from '../_models/user';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  modle: any = {};

  constructor(public accountService: AccountService) {}

  ngOnInit(): void {}

  logout() {
    this.accountService.logout();
  }
}
