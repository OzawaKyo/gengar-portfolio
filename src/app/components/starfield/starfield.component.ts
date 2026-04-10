import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

// #E2D7F4 décomposé en RGB pour les rgba() des étoiles filantes
const STAR_RGB = '226, 215, 244';
const STAR_COUNT = 280;
const SHOOTER_COUNT = 3;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface Star {
  /** Position normalisée 0–1 : s'adapte au resize sans recalcul */
  nx: number;
  ny: number;
  /** Rayon en pixels logiques (0.5 – 2) */
  radius: number;
  isCross: boolean;
  baseAlpha: number;
  twinkles: boolean;
  /** Fréquence de scintillement en rad/ms */
  twinkleFreq: number;
  /** Déphasage initial pour que chaque étoile soit désynchronisée */
  twinklePhi: number;
}

interface Shooter {
  x: number;
  y: number;
  /** Vélocité en px logiques/ms */
  vx: number;
  vy: number;
  tailLen: number;
  alpha: number;
  active: boolean;
  /** Délai avant prochaine apparition en ms */
  cooldown: number;
}

@Component({
  selector: 'app-starfield',
  template: `<canvas #canvas></canvas>`,
  styleUrl: './starfield.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class StarfieldComponent {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  private stars: Star[] = [];
  private shooters: Shooter[] = [];

  /** Dimensions logiques (CSS px) — les étoiles s'y réfèrent */
  private w = 0;
  private h = 0;

  private lastTime = 0;
  private rafId = 0;
  private observer?: ResizeObserver;

  constructor() {
    // afterNextRender ne s'exécute que dans le navigateur → compatible SSR
    afterNextRender(() => this.boot());
  }

  private boot(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d')!;

    this.resize(canvas, ctx);
    this.buildStars();
    this.buildShooters();

    // Observer le resize du canvas (=viewport) sans rebuild des étoiles
    // car leurs positions sont normalisées
    this.observer = new ResizeObserver(() => this.resize(canvas, ctx));
    this.observer.observe(canvas);

    this.loop(ctx, performance.now());

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.rafId);
      this.observer?.disconnect();
    });
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  private resize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const dpr = devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;

    this.w = width;
    this.h = height;

    // Taille physique du canvas pour les écrans HiDPI
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // setTransform (et non scale) pour éviter l'empilement des transforms au resize
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private buildStars(): void {
    this.stars = Array.from({ length: STAR_COUNT }, () => {
      // Distribution biaisée vers les petites étoiles (réalisme)
      const t = Math.random() ** 2;
      const radius = 0.5 + t * 1.5;
      const isCross = radius > 1.2 && Math.random() < 0.18;

      return {
        nx: Math.random(),
        ny: Math.random(),
        radius,
        isCross,
        baseAlpha: rand(0.35, 0.85),
        twinkles: Math.random() < 0.35,
        twinkleFreq: rand(0.0005, 0.0018),
        twinklePhi: rand(0, Math.PI * 2),
      };
    });
  }

  private buildShooters(): void {
    this.shooters = Array.from({ length: SHOOTER_COUNT }, (_, i) => {
      const s = this.resetShooter({} as Shooter);
      // Échelonner les premières apparitions pour éviter qu'elles surviennent toutes en même temps
      s.cooldown = rand(1500, 5000) + i * rand(3000, 5500);
      return s;
    });
  }

  private resetShooter(s: Shooter): Shooter {
    const speed = rand(0.4, 0.65); // px logiques / ms
    const angle = rand(28, 48) * (Math.PI / 180);
    s.active = false;
    s.cooldown = rand(6000, 16000);
    s.vx = speed * Math.cos(angle);
    s.vy = speed * Math.sin(angle);
    s.tailLen = rand(80, 140);
    s.alpha = 0;
    return s;
  }

  // ---------------------------------------------------------------------------
  // Boucle de rendu
  // ---------------------------------------------------------------------------

  private loop(ctx: CanvasRenderingContext2D, t: number): void {
    // Limiter dt à 50ms pour absorber les pauses (changement d'onglet, etc.)
    const dt = Math.min(t - this.lastTime, 50);
    this.lastTime = t;

    ctx.clearRect(0, 0, this.w, this.h);

    this.drawStars(ctx, t);
    this.tickShooters(ctx, dt);

    this.rafId = requestAnimationFrame((next) => this.loop(ctx, next));
  }

  // ---------------------------------------------------------------------------
  // Dessin des étoiles
  // ---------------------------------------------------------------------------

  private drawStars(ctx: CanvasRenderingContext2D, t: number): void {
    ctx.fillStyle = `rgb(${STAR_RGB})`;
    ctx.strokeStyle = `rgb(${STAR_RGB})`;

    for (const star of this.stars) {
      const x = star.nx * this.w;
      const y = star.ny * this.h;

      let alpha = star.baseAlpha;
      if (star.twinkles) {
        const pulse = 0.3 * Math.sin(t * star.twinkleFreq + star.twinklePhi);
        alpha = Math.max(0.05, Math.min(1, alpha + pulse));
      }

      ctx.globalAlpha = alpha;

      if (star.isCross) {
        this.drawCross(ctx, x, y, star.radius * 2.8);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  private drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, half: number): void {
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.lineTo(x + half, y);
    ctx.moveTo(x, y - half);
    ctx.lineTo(x, y + half);
    ctx.stroke();
  }

  // ---------------------------------------------------------------------------
  // Étoiles filantes
  // ---------------------------------------------------------------------------

  private tickShooters(ctx: CanvasRenderingContext2D, dt: number): void {
    for (const s of this.shooters) {
      if (!s.active) {
        s.cooldown -= dt;
        if (s.cooldown <= 0) {
          s.active = true;
          // Spawn aléatoire dans le quart supérieur de l'écran
          s.x = rand(0.02, 0.75) * this.w;
          s.y = rand(0.02, 0.25) * this.h;
          s.alpha = 0;
        }
        continue;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      // Fondu à l'entrée
      s.alpha = Math.min(0.85, s.alpha + dt * 0.004);

      if (s.x > this.w + s.tailLen || s.y > this.h + s.tailLen) {
        this.resetShooter(s);
        continue;
      }

      this.drawShooter(ctx, s);
    }
  }

  private drawShooter(ctx: CanvasRenderingContext2D, s: Shooter): void {
    // Direction normalisée pour le point de départ de la traîne
    const speed = Math.hypot(s.vx, s.vy);
    const nx = s.vx / speed;
    const ny = s.vy / speed;
    const tx = s.x - nx * s.tailLen;
    const ty = s.y - ny * s.tailLen;

    // Gradient : transparent à la queue, opaque à la tête
    const gradient = ctx.createLinearGradient(tx, ty, s.x, s.y);
    gradient.addColorStop(0, `rgba(${STAR_RGB}, 0)`);
    gradient.addColorStop(1, `rgba(${STAR_RGB}, ${s.alpha})`);

    ctx.save();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.restore();
  }
}
