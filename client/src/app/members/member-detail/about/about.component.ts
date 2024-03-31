import { Component, Input, OnInit, inject } from '@angular/core';
import { Member } from '../../../_models/member';
import { CommonModule } from '@angular/common';
import { IntlModule } from 'angular-ecmascript-intl';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IntlModule],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  router = inject(Router);
  @Input() member: Member | undefined;
  goToMessages() {
    this.router.navigateByUrl(`messages/${this.member?.knownAs.toLowerCase()}`);
  }
  ngOnInit(): void {}
}
