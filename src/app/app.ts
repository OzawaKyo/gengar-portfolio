import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { HomeComponent } from './components/home/home.component';
import { LangToggleComponent } from './components/lang-toggle/lang-toggle.component';
import { StarfieldComponent } from './components/starfield/starfield.component';
import { WaveComponent } from './components/wave/wave.component';
import { WindowCardComponent } from './components/window-card/window-card.component';
import { LanguageService } from './services/language.service';
import { WindowsService } from './services/windows.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StarfieldComponent, WaveComponent, WindowCardComponent, HomeComponent, LangToggleComponent, AboutComponent],
  template: `
    <app-starfield />
    <app-wave />
    <app-lang-toggle />

    <!-- Carte principale centrée -->
    <app-window-card>
      <app-home />
    </app-window-card>

    <!-- Cartes flottantes -->
    @if (windows.openKeys().includes('about')) {
      <app-window-card [floating]="true" [closable]="true" [title]="lang.t().nav['about']" (closed)="windows.close('about')">
        <app-about />
      </app-window-card>
    }
    @if (windows.openKeys().includes('links')) {
      <app-window-card [floating]="true" [closable]="true" [title]="lang.t().nav['links']" (closed)="windows.close('links')" />
    }
    @if (windows.openKeys().includes('work')) {
      <app-window-card [floating]="true" [closable]="true" [title]="lang.t().nav['work']" (closed)="windows.close('work')" />
    }
    @if (windows.openKeys().includes('faq')) {
      <app-window-card [floating]="true" [closable]="true" [title]="lang.t().nav['faq']" (closed)="windows.close('faq')" />
    }
    @if (windows.openKeys().includes('contact')) {
      <app-window-card [floating]="true" [closable]="true" [title]="lang.t().nav['contact']" (closed)="windows.close('contact')" />
    }

    <img
      [class]="gengarClass()"
      [src]="withHeadphones() ? '/gengar_head.png' : '/gengar-parap.png'"
      alt=""
      width="180"
      height="180"
      (click)="toggleGengar()"
    />
    <router-outlet />
  `,
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly windows        = inject(WindowsService);
  protected readonly lang           = inject(LanguageService);
  protected readonly withHeadphones = signal(false);
  private  readonly flipPhase       = signal<'out' | 'in' | null>(null);

  protected readonly gengarClass = computed(() => {
    const parts = ['gengar'];
    if (this.withHeadphones()) parts.push('gengar--headphones');
    const phase = this.flipPhase();
    if (phase) parts.push(`gengar--flip-${phase}`);
    return parts.join(' ');
  });

  protected toggleGengar(): void {
    if (this.flipPhase() !== null) return;

    this.flipPhase.set('out');
    setTimeout(() => {
      this.withHeadphones.update(v => !v);
      this.flipPhase.set('in');
      setTimeout(() => this.flipPhase.set(null), 550);
    }, 450);
  }
}
