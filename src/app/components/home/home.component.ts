import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

interface NavItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly navItems: NavItem[] = [
    { key: 'about',   label: 'about',   icon: '/about.webp'   },
    { key: 'links',   label: 'links',   icon: '/links.webp'   },
    { key: 'work',    label: 'work',    icon: '/work.webp'    },
    { key: 'faq',     label: 'faq',     icon: '/faq.webp'     },
    { key: 'contact', label: 'contact', icon: '/contact.webp' },
  ];
}
