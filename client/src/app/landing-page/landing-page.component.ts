import { Component, OnInit, inject } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { LoginModel } from '../_models/loginModel';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { DatePickerComponent } from '../_forms/date-picker/date-picker.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, TextInputComponent, DatePickerComponent],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  public AccountService: AccountService = inject(AccountService);
  private router: Router = inject(Router);
  private fb = inject(FormBuilder);

  model: LoginModel = {} as LoginModel;
  registerBool: boolean = false;
  registerForm: FormGroup = new FormGroup({});
  registerErrorMessage = '';

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male'],
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', [Validators.required, this.dateOfBirthValidator()]],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]],
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity(),
    });
  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { notMatching: true };
    };
  }

  login() {
    this.AccountService.login(this.model).subscribe({
      next: (_) => this.router.navigateByUrl('/members'),
    });
  }

  register() {
    console.log(this.registerForm);
    // this.AccountService.register(this.model).subscribe({
    //   next: (res) => console.log(res),
    //   error: (err: string[]) =>
    //     err.forEach((element) => {
    //       this.toaster.error(element);
    //     }),
    // });
  }

  isInvalid(controlName: string): boolean | undefined {
    const control = this.registerForm.get(controlName);
    if (!control) return;
    return control.invalid && (control.dirty || control.touched);
  }

  toggoleRegister() {
    this.registerBool = !this.registerBool;
  }

  dateOfBirthValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value) {
        const selectedDate = new Date(control.value);
        const today = new Date();
        const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

        return selectedDate <= eighteenYearsAgo ? null : { notOldEnough: true };
      }
      return null;
    };
  }
}
