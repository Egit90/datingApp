import { CommonModule } from '@angular/common';
import { Component, Input, Self } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label = '';

  constructor(@Self() public ngControl: NgControl) {
    this.ngControl.valueAccessor = this;
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}

  get control(): FormControl {
    return this.ngControl.control as FormControl;
  }
}
