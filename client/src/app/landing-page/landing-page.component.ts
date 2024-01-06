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
  private toaster = inject(ToastrService);

  model: LoginModel = {} as LoginModel;
  registerBool: boolean = false;
  registerForm: FormGroup = new FormGroup({});
  registerErrorMessage = '';
  validationErrors: string[] | undefined;

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
    debugger;
    this.AccountService.login(this.model).subscribe({
      next: (_) => this.router.navigateByUrl('/members'),
    });
  }

  register() {
    const dob = this.getDateOnly(this.registerForm.controls['dateOfBirth']?.value);

    const values = { ...this.registerForm.value, dateOfBirth: dob };

    this.AccountService.register(values).subscribe({
      next: (res) => {
        this.router.navigateByUrl('/members');
      },
      error: (err) => {
        this.validationErrors = err;
      },
    });
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

  private getDateOnly(dob: string | undefined) {
    if (!dob) return;
    let thedob = new Date(dob);

    return new Date(thedob.setMinutes(thedob.getMinutes() - thedob.getTimezoneOffset())).toISOString().slice(0, 10);
  }
}
