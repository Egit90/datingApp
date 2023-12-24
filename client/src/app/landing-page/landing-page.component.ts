import { Component } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { LoginModel } from '../_models/loginModel';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent {
  model: LoginModel = {} as LoginModel;
  registerBool: boolean = false;
  registerError: string = '';
  constructor(public AccountService: AccountService, private router: Router) {}

  login() {
    this.AccountService.login(this.model).subscribe({
      next: (_) => this.router.navigateByUrl('/members'),
      error: (err) => console.log(err),
    });
  }

  register() {
    this.AccountService.register(this.model).subscribe({
      next: (res) => console.log(res),
      error: (err: HttpErrorResponse) => {
        this.registerError = err.error;
        console.log(err);
      },
    });
  }

  clearErrorMsg() {
    this.registerError = '';
  }

  toggoleRegister() {
    this.registerBool = !this.registerBool;
  }
}
