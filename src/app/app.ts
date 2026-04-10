import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StarfieldComponent } from './components/starfield/starfield.component';
import { WaveComponent } from './components/wave/wave.component';
import { WindowCardComponent } from './components/window-card/window-card.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StarfieldComponent, WaveComponent, WindowCardComponent, HomeComponent],
  template: `
    <app-starfield />
    <app-wave />
    <app-window-card>
      <app-home />
    </app-window-card>
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
