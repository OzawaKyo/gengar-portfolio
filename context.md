# Gengar Portfolio — Context

Portfolio personnel de Simo. Thème : **nuit cosmique / Pokémon Gengar**. Stack : Angular 21, SSR activé, signals partout, OnPush sur tous les composants.

---

## Design tokens (`src/styles.scss`)

Variables SCSS exposées en CSS custom properties sur `:root` :

| Token | Valeur |
|---|---|
| `--color-bg-deep-sky` | `#110A1F` — haut du dégradé fond |
| `--color-bg-night` | `#261442` — bas du dégradé fond |
| `--color-bg-wave` | `#3A2163` — couleur de la vague |
| `--color-surface-glass` | `#1E152B` — fond des cartes |
| `--color-surface-header` | `#150E1F` — header des cartes |
| `--color-text-primary` | `#E2D7F4` — texte principal (lavande) |
| `--color-text-secondary` | `#9B8BB1` — texte secondaire |
| `--color-accent-star` | `#F4C560` — or / déco |
| `--color-accent-primary` | `#6B518F` — violet Gengar |
| `--color-accent-danger` | `#D45B65` — rouge / erreur |

Font : **Nohemi** (variable font TTF dans `public/nohemi.ttf`), déclarée via `@font-face` dans `styles.scss`.

`tsconfig.json` a `"defaultStandalone": true` dans `angularCompilerOptions` → les composants sont standalone par défaut, inutile d'écrire `standalone: true`.

---

## Architecture des composants

```
src/app/
├── app.ts                          ← root component
├── app.scss
├── components/
│   ├── starfield/                  ← canvas étoilé animé (fond)
│   ├── wave/                       ← vague SVG animée (bas de page)
│   ├── window-card/                ← carte style macOS (principale + flottantes)
│   ├── home/                       ← contenu de la carte principale
│   ├── lang-toggle/                ← bouton EN | FR (fixed top-left)
│   └── about/                      ← contenu de la card About (à coder)
└── services/
    ├── language.service.ts         ← gestion EN/FR
    └── windows.service.ts          ← gestion des cartes flottantes ouvertes
```

---

## Composants

### `app-starfield`
Canvas plein écran en fond (`position: fixed`, `z-index: 1`).
- 160 étoiles : rondes ou sparkle 4 branches (11% sparkle), scintillement sinusoïdal
- 3 étoiles filantes avec queue en dégradé et sparkle à la tête
- Réserve 48px en haut (`NAVBAR_HEIGHT`) pour ne pas dessiner dans la zone nav
- Utilise `effect((onCleanup) => {...})` (et non `afterNextRender`) pour survivre à l'hydratation SSR
- HiDPI via `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`

### `app-wave`
Vague SVG en bas de page (`position: fixed`, bottom: 0, `z-index: 2`).
- SVG 200% de large, 2 périodes → animation `translateX(-50%)` = boucle parfaite
- Deux couches (avant/arrière) avec décalage de délai
- Hauteur : 42vh

### `app-window-card`
Carte style macOS. Deux modes :

**Mode principal** (défaut) :
- Centré sur l'écran via `styles.scss` (`app-window-card:not([data-floating])`)
- Contenu injecté via `<ng-content />`
- Pas de bouton fermer, pas de drag

**Mode flottant** (`[floating]="true"`) :
- `host` applique `position: fixed`, `left/top` via signals `x()` / `y()`
- Attribut `[attr.data-floating]` permet au CSS global de ne pas le centrer
- Position initiale calculée dans `afterNextRender` (~centré écran)
- Drag depuis le header (mousedown → mousemove/mouseup sur `document`)

Inputs : `title: string` (default `'home'`), `closable: boolean`, `floating: boolean`  
Output : `closed` (EventEmitter\<void\>)

Quand `closable`, le premier dot devient un bouton rouge qui émet `closed`.

### `app-home`
Contenu de la carte principale :
- Section hero : titre (`t().title`) + sous-titre (`t().subtitle`) en Nohemi
- Nav : 5 boutons (`<button>`) avec icônes `.webp` depuis `public/`
- Au clic → appelle `windowsService.open(key)` pour ouvrir la carte flottante correspondante

Icônes : `/about.webp`, `/links.webp`, `/work.webp`, `/faq.webp`, `/contact.webp`

### `app-lang-toggle`
Bouton `EN | FR` fixed top-left (`z-index: 20`).  
Injecte `LanguageService` et appelle `lang.toggle()` au clic.  
L'option active est en `--color-text-primary`, l'inactive en `--color-text-secondary`.

### `app-about`
Composant vide — **à coder par Simo**.  
Projeté dans la card flottante "about" via `ng-content`.  
Fichiers : `about.component.ts`, `about.component.html`, `about.component.scss`

---

## Services

### `LanguageService`
```typescript
readonly current = signal<Lang>('en');   // 'en' | 'fr'
readonly t = computed(() => TRANSLATIONS[this.current()]);
toggle(): void
```

Traductions disponibles dans `t()` :
- `t().title` — "hi! i'm simo" / "hi! je suis simo"
- `t().subtitle` — "developer, designer and music producer" / "développeur, designer et producteur de musique"
- `t().nav['about' | 'links' | 'work' | 'faq' | 'contact']`

### `WindowsService`
```typescript
readonly openKeys = signal<string[]>([]).asReadonly();
open(key: string): void   // no-op si déjà ouvert
close(key: string): void
```

---

## Gengar (image interactive)
Image fixe bottom-right (`z-index: 3`).  
- Click → animation "trou noir" : spiral vers le centre (450ms) + swap image + ressort (550ms)  
- Toggle entre `/gengar-parap.png` (180×180) et `/gengar_head.png` (160×160, avec casque)
- Double-click ignoré pendant l'animation (`flipPhase` signal guard)
- CSS : `@keyframes gengar-hole-in` (scale+rotate vers 0) / `gengar-hole-out` (scale+rotate depuis 0 avec overshoot)

---

## Layout global (`styles.scss`)

```scss
app-window-card:not([data-floating]) {
  position: fixed; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}
app-window-card[data-floating] { display: block; }
```

Ordre z-index : starfield (1) → wave (2) → gengar (3) → window principale (10) → cartes flottantes (20) → lang-toggle (20)

---

## Règles de code (CLAUDE.md)

- Standalone par défaut (via `defaultStandalone: true` dans tsconfig) — ne pas écrire `standalone: true`
- `input()` / `output()` au lieu de `@Input` / `@Output`
- `inject()` au lieu du constructeur
- Bindings host dans l'objet `host:` du décorateur (pas `@HostBinding`/`@HostListener`)
- `@if` / `@for` / `@switch` natifs (pas `*ngIf` etc.)
- `[class]` au lieu de `ngClass`, `[style]` au lieu de `ngStyle`
- `NgOptimizedImage` pour les images statiques (pas les images dynamiques/interactives)
- `ChangeDetectionStrategy.OnPush` sur tous les composants
- Pas de `standalone: true` explicite dans les décorateurs
- Inputs boolean : toujours `[input]="true"` dans le template, jamais le shorthand attribut (strict templates)

---

## État actuel

Cards ouvertes quand on clique sur la nav : about (avec `<app-about />`), links, work, faq, contact (vides).  
Prochaine étape : coder le contenu des cards restantes (links, work, faq, contact).
