import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-window-card',
  templateUrl: './window-card.component.html',
  styleUrl: './window-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WindowCardComponent {
  private readonly cardRef = viewChild.required<ElementRef<HTMLElement>>('card');

  protected readonly x = signal(0);
  protected readonly y = signal(0);

  constructor() {
    afterNextRender(() => this.center());
  }

  private center(): void {
    const el = this.cardRef().nativeElement;
    this.x.set(Math.round((window.innerWidth - el.offsetWidth) / 2));
    this.y.set(Math.round((window.innerHeight - el.offsetHeight) / 2));
  }
}
