import { Component, Input, OnInit } from '@angular/core';
import { Member } from '../../../_models/member';
import { CommonModule } from '@angular/common';
import { IntlModule } from 'angular-ecmascript-intl';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IntlModule],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  @Input() member: Member | undefined;

  ngOnInit(): void {}
}
