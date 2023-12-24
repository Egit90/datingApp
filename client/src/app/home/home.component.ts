import { Component } from '@angular/core';
import { LandingPageComponent } from '../landing-page/landing-page.component';
import { FooterComponent } from '../footer/footer.component';
import { AccountService } from '../_services/account.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingPageComponent, FooterComponent, CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(public accountService: AccountService) {}
}
