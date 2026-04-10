import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StarfieldComponent } from './components/starfield/starfield.component';
import { WaveComponent } from './components/wave/wave.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StarfieldComponent, WaveComponent],
  template: `
    <app-starfield />
    <app-wave />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
