import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LangToggleComponent } from './components/lang-toggle/lang-toggle.component';
import { StarfieldComponent } from './components/starfield/starfield.component';
import { WaveComponent } from './components/wave/wave.component';
import { WindowCardComponent } from './components/window-card/window-card.component';
import { LanguageService } from './services/language.service';
import { WindowsService } from './services/windows.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StarfieldComponent, WaveComponent, WindowCardComponent, HomeComponent, NgOptimizedImage, LangToggleComponent],
  template: `
    <app-starfield />
    <app-wave />
    <app-lang-toggle />

    <!-- Carte principale centrée -->
    <app-window-card>
      <app-home />
    </app-window-card>

    <!-- Cartes flottantes ouvertes depuis la nav -->
    @for (key of windows.openKeys(); track key) {
      <app-window-card
        [floating]="true"
        [closable]="true"
        [title]="lang.t().nav[key]"
        (closed)="windows.close(key)"
      />
    }

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
export class App {
  protected readonly windows = inject(WindowsService);
  protected readonly lang    = inject(LanguageService);
}
