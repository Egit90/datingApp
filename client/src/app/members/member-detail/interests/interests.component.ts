import { Component, Input } from '@angular/core';
import { Member } from '../../../_models/member';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interests.component.html',
})
export class InterestsComponent {
  @Input() member: Member | undefined;
}
