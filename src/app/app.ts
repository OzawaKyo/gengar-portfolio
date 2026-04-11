import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LangToggleComponent } from './components/lang-toggle/lang-toggle.component';
import { StarfieldComponent } from './components/starfield/starfield.component';
import { WaveComponent } from './components/wave/wave.component';
import { WindowCardComponent } from './components/window-card/window-card.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StarfieldComponent, WaveComponent, WindowCardComponent, HomeComponent, NgOptimizedImage, LangToggleComponent],
  template: `
    <app-starfield />
    <app-wave />
    <app-lang-toggle />
    <app-window-card>
      <app-home />
    </app-window-card>
    <img
      class="gengar"
      ngSrc="/gengar-parap.png"
      alt=""
      width="180"
      height="180"
    />
    <router-outlet />
  `,
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
