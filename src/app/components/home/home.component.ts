import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LanguageService } from '../../services/language.service';

interface NavItem {
  key: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'about',   icon: '/about.webp'   },
  { key: 'links',   icon: '/links.webp'   },
  { key: 'work',    icon: '/work.webp'    },
  { key: 'faq',     icon: '/faq.webp'     },
  { key: 'contact', icon: '/contact.webp' },
];

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly langService = inject(LanguageService);
  protected readonly t = this.langService.t;

  protected readonly navItems = computed(() =>
    NAV_ITEMS.map(item => ({
      ...item,
      label: this.t().nav[item.key],
    }))
  );
}
