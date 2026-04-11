import { afterNextRender, ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-window-card',
  templateUrl: './window-card.component.html',
  styleUrl: './window-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-floating]': 'floating() || null',
    '[style.position]':     'floating() ? "fixed" : null',
    '[style.left.px]':      'floating() ? x() : null',
    '[style.top.px]':       'floating() ? y() : null',
    '[style.z-index]':      'floating() ? 20 : null',
  },
})
export class WindowCardComponent {
  readonly title    = input<string>('home');
  readonly closable = input<boolean>(false);
  readonly floating = input<boolean>(false);
  readonly closed   = output<void>();

  protected readonly x = signal(0);
  protected readonly y = signal(0);

  private dragOffsetX = 0;
  private dragOffsetY = 0;

  constructor() {
    afterNextRender(() => {
      if (!this.floating()) return;
      this.x.set(Math.max(20, (window.innerWidth  - 700) / 2));
      this.y.set(Math.max(20, (window.innerHeight - 450) / 2));
    });
  }

  protected onHeaderMousedown(e: MouseEvent): void {
    if (!this.floating()) return;
    e.preventDefault();

    this.dragOffsetX = e.clientX - this.x();
    this.dragOffsetY = e.clientY - this.y();

    const onMove = (ev: MouseEvent) => {
      this.x.set(ev.clientX - this.dragOffsetX);
      this.y.set(ev.clientY - this.dragOffsetY);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
