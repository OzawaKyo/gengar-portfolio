import { Injectable, computed, signal } from '@angular/core';

export type Lang = 'en' | 'fr';

interface Translations {
  title: string;
  subtitle: string;
  nav: Record<string, string>;
}

const TRANSLATIONS: Record<Lang, Translations> = {
  en: {
    title: "hi! i'm simo",
    subtitle: 'developer, designer and music producer',
    nav: {
      about:   'about',
      links:   'links',
      work:    'work',
      faq:     'faq',
      contact: 'contact',
    },
  },
  fr: {
    title: "hi! je suis simo",
    subtitle: 'développeur, designer et producteur de musique',
    nav: {
      about:   'à propos',
      links:   'liens',
      work:    'travaux',
      faq:     'faq',
      contact: 'contact',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly current = signal<Lang>('fr');
  readonly t = computed(() => TRANSLATIONS[this.current()]);

  toggle(): void {
    this.current.update(lang => lang === 'en' ? 'fr' : 'en');
  }
}
