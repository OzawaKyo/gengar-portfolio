import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-window-card',
  templateUrl: './window-card.component.html',
  styleUrl: './window-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowCardComponent {}
