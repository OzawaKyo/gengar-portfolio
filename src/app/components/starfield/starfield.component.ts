import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  viewChild,
} from '@angular/core';

const STAR_RGB = '226, 215, 244';
const STAR_COUNT = 160;
const SHOOTER_COUNT = 3;
/** Zone réservée en haut pour la future navbar (px logiques) */
const NAVBAR_HEIGHT = 48;

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface Star {
  /** Position normalisée 0–1 : s'adapte au resize sans recalcul */
  nx: number;
  ny: number;
  /** Rayon en px logiques pour les points ronds */
  radius: number;
  isSparkle: boolean;
  /** Demi-hauteur de la branche verticale du sparkle, en px logiques */
  sparkleSize: number;
  baseAlpha: number;
  twinkles: boolean;
  /** Fréquence de scintillement en rad/ms */
  twinkleFreq: number;
  /** Déphasage initial pour désynchroniser chaque étoile */
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

  private stars: Star[] = [];
  private shooters: Shooter[] = [];
  private w = 0;
  private h = 0;

  constructor() {
    // effect() re-s'exécute si canvasRef change (re-rendu Angular post-hydratation).
    // onCleanup annule le RAF et le listener avant chaque ré-exécution.
    // Le guard `typeof window` empêche l'exécution côté serveur (SSR).
    effect((onCleanup) => {
      if (typeof window === 'undefined') return;

      const canvas = this.canvasRef().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.applySize(canvas, ctx);

      this.buildStars();
      this.buildShooters();

      let rafId = 0;
      let lastTime = 0;

      const tick = (t: number) => {
        rafId = requestAnimationFrame(tick);
        const dt = Math.min(t - lastTime, 50);
        lastTime = t;
        ctx.clearRect(0, 0, this.w, this.h);
        this.drawStars(ctx, t);
        this.tickShooters(ctx, dt);
      };

      rafId = requestAnimationFrame(tick);

      const onResize = () => {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.applySize(canvas, ctx);
      };

      window.addEventListener('resize', onResize);

      onCleanup(() => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  private applySize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    const dpr = devicePixelRatio || 1;
    canvas.width = Math.round(this.w * dpr);
    canvas.height = Math.round(this.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private buildStars(): void {
    this.stars = Array.from({ length: STAR_COUNT }, () => {
      const t = Math.random() ** 2;
      const radius = 1 + t * 2.5;
      const isSparkle = Math.random() < 0.11;

      return {
        nx: Math.random(),
        ny: Math.random(),
        radius,
        isSparkle,
        sparkleSize: isSparkle ? rand(4, 10) : 0,
        baseAlpha: rand(0.55, 1),
        twinkles: Math.random() < 0.35,
        twinkleFreq: rand(0.0005, 0.0018),
        twinklePhi: rand(0, Math.PI * 2),
      };
    });
  }

  private buildShooters(): void {
    this.shooters = Array.from({ length: SHOOTER_COUNT }, (_, i) => {
      const s = this.resetShooter({} as Shooter);
      s.cooldown = rand(1500, 5000) + i * rand(3000, 5500);
      return s;
    });
  }

  private resetShooter(s: Shooter): Shooter {
    const speed = rand(0.4, 0.65);
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
  // Dessin des étoiles
  // ---------------------------------------------------------------------------

  private drawStars(ctx: CanvasRenderingContext2D, t: number): void {
    ctx.fillStyle = `rgb(${STAR_RGB})`;

    for (const star of this.stars) {
      const x = star.nx * this.w;
      const y = NAVBAR_HEIGHT + star.ny * (this.h - NAVBAR_HEIGHT);

      let alpha = star.baseAlpha;
      if (star.twinkles) {
        const pulse = 0.3 * Math.sin(t * star.twinkleFreq + star.twinklePhi);
        alpha = Math.max(0.05, Math.min(1, alpha + pulse));
      }

      ctx.globalAlpha = alpha;

      if (star.isSparkle) {
        this.drawSparkle(ctx, x, y, star.sparkleSize);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Étoile à 4 branches remplies, style cartoon/illustration.
   *   ov = branche verticale — 70 % de size
   *   oh = branche horizontale — 55 % de size
   *   ir = croisement central — 20 % de size (aspect gras)
   */
  private drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    const ov = size * 0.70;
    const oh = size * 0.55;
    const ir = size * 0.20;

    ctx.beginPath();
    ctx.moveTo(x,      y - ov);
    ctx.lineTo(x + ir, y - ir);
    ctx.lineTo(x + oh, y      );
    ctx.lineTo(x + ir, y + ir);
    ctx.lineTo(x,      y + ov);
    ctx.lineTo(x - ir, y + ir);
    ctx.lineTo(x - oh, y      );
    ctx.lineTo(x - ir, y - ir);
    ctx.closePath();
    ctx.fill();
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
          s.x = rand(0.02, 0.75) * this.w;
          s.y = rand(0.02, 0.25) * this.h;
          s.alpha = 0;
        }
        continue;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.alpha = Math.min(0.85, s.alpha + dt * 0.004);

      if (s.x > this.w + s.tailLen || s.y > this.h + s.tailLen) {
        this.resetShooter(s);
        continue;
      }

      this.drawShooter(ctx, s);
    }
  }

  private drawShooter(ctx: CanvasRenderingContext2D, s: Shooter): void {
    const speed = Math.hypot(s.vx, s.vy);
    const nx = s.vx / speed;
    const ny = s.vy / speed;
    const tx = s.x - nx * s.tailLen;
    const ty = s.y - ny * s.tailLen;

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

    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = `rgb(${STAR_RGB})`;
    this.drawSparkle(ctx, s.x, s.y, 5);

    ctx.restore();
  }
}
