import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-lang-toggle',
  template: `
    <button class="lang-toggle" (click)="lang.toggle()" [attr.aria-label]="lang.current() === 'en' ? 'Switch to French' : 'Switch to English'">
      <span [class.lang-toggle__option--active]="lang.current() === 'en'">EN</span>
      <span class="lang-toggle__sep">|</span>
      <span [class.lang-toggle__option--active]="lang.current() === 'fr'">FR</span>
    </button>
  `,
  styleUrl: './lang-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangToggleComponent {
  protected readonly lang = inject(LanguageService);
}
