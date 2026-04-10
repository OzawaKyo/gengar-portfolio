import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wave',
  templateUrl: './wave.component.html',
  styleUrl: './wave.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaveComponent {}
