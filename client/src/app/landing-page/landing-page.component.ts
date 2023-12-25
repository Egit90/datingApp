import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { LoginModel } from '../_models/loginModel';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  model: LoginModel = {} as LoginModel;
  registerBool: boolean = false;
  constructor(
    public AccountService: AccountService,
    private router: Router,
    private toaster: ToastrService
  ) {}

  login() {
    this.AccountService.login(this.model).subscribe({
      next: (_) => this.router.navigateByUrl('/members'),
      error: (err) => this.toaster.error(err.error),
    });
  }

  register() {
    this.AccountService.register(this.model).subscribe({
      next: (res) => console.log(res),
      error: (err: HttpErrorResponse) => this.toaster.error(err.error),
    });
  }

  toggoleRegister() {
    this.registerBool = !this.registerBool;
  }
}
