import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, input, NgZone, output, signal } from '@angular/core';

@Component({
  selector: 'app-window-card',
  templateUrl: './window-card.component.html',
  styleUrl: './window-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-floating]': 'floating() || null',
    '[style.position]':     'floating() ? "fixed" : null',
    '[style.left]':         'floating() ? "0" : null',
    '[style.top]':          'floating() ? "0" : null',
    '[style.transform]':    'floating() ? "translate(" + x() + "px, " + y() + "px)" : null',
    '[style.will-change]':  'floating() ? "transform" : null',
    '[style.z-index]':      'floating() ? 20 : null',
  },
})
export class WindowCardComponent {
  readonly title    = input<string>('home');
  readonly closable = input<boolean>(false);
  readonly floating = input<boolean>(false);
  readonly closed   = output<void>();
  /** Position initiale en fraction de la viewport (0–1). Défaut : centré. */
  readonly originX  = input<number>(0.5);
  readonly originY  = input<number>(0.5);

  protected readonly x = signal(0);
  protected readonly y = signal(0);

  private readonly el   = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private currentX    = 0;
  private currentY    = 0;

  constructor() {
    afterNextRender(() => {
      if (!this.floating()) return;
      const host = this.el.nativeElement;
      const w    = host.offsetWidth  || 700;
      const h    = host.offsetHeight || 450;
      const { x, y } = this.clamp(
        window.innerWidth  * this.originX() - w / 2,
        window.innerHeight * this.originY() - h / 2,
      );
      this.currentX = x;
      this.currentY = y;
      this.x.set(x);
      this.y.set(y);
    });
  }

  private clamp(x: number, y: number): { x: number; y: number } {
    const host   = this.el.nativeElement;
    const w      = host.offsetWidth;
    const h      = host.offsetHeight;
    const margin = 20;
    return {
      x: Math.min(Math.max(x, margin), window.innerWidth  - w - margin),
      y: Math.min(Math.max(y, margin), window.innerHeight - h - margin),
    };
  }

  protected onHeaderMousedown(e: MouseEvent): void {
    if (!this.floating()) return;
    e.preventDefault();

    this.dragOffsetX = e.clientX - this.currentX;
    this.dragOffsetY = e.clientY - this.currentY;

    const host = this.el.nativeElement;

    // Run outside Angular zone — zero change detection during drag
    this.zone.runOutsideAngular(() => {
      const onMove = (ev: MouseEvent) => {
        const { x, y } = this.clamp(ev.clientX - this.dragOffsetX, ev.clientY - this.dragOffsetY);
        this.currentX = x;
        this.currentY = y;
        host.style.transform = `translate(${x}px, ${y}px)`;
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
        // Sync signals once at the end so Angular knows the final position
        this.zone.run(() => {
          this.x.set(this.currentX);
          this.y.set(this.currentY);
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  protected onClose(): void {
    this.closed.emit();
  }
}
