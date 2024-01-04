import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-bubble',
  standalone: true,
  imports: [],
  templateUrl: './bubble.component.html',
})
export class BubbleComponent {
  @Input() position: 'start' | 'end' = 'start';
  @Input() sender: string | undefined;
  @Input() content: string | undefined;
  @Input() sentTime: string | undefined;
  @Input() status: string | undefined;
  @Input() picUrl: string | undefined;
}
