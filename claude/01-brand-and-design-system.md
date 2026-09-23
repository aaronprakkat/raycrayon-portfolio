---
description: Visual direction, colors, typography, layout rules and the core interactions for the Raycrayon portfolio.
---

# Brand and design system

## Feel

Clean, calm, lots of white space. Ryan's artwork is loud and saturated, so the interface stays quiet — color comes in only through interaction and the art itself, never as decoration in the UI.

This was a deliberate reversal from an earlier "dark void" blueprint direction (all-black base). We kept its structural rules (grid, type scale, composition principles) but moved the base to light, because a black UI competed with the work instead of framing it.

## Colors

- Base background: `#FAF8F2` (off-white)
- Text: `#111111`; muted text `#6B6B6B`; hairlines `rgba(17,17,17,.12)`
- **Dark section (Pangeo only):** background `#0B0B0E`, text `#F4F0DF` — the page dims like a projection room when this section scrolls into view, and returns to light when it leaves.
- Accent "crayon box", used **only** for hover/focus/active states, never as static decoration:
  - Pink `#FF3DAC`
  - Cobalt `#3154FF`
  - Lime `#B8FF38`
  - Orange `#FF5C2B`
  - Cyan `#26E1DD`
- Never combine all accents in one component. No gradients, no glassmorphism in the UI chrome (fine within the artwork itself, obviously) — **except** the grainy gradient hover treatment and the hero comic-panel texture, both below, which are the two deliberate exceptions.
- Each project gets one accent color, generally sampled from its own artwork.

## Typography

- Display: **Bebas Neue** (Google Fonts) — uppercase, tight line-height, for big headings and project titles.
- Body/UI: **Inter**, weights 400/500/600.
- Small labels: Inter 11–12px, uppercase, letter-spacing .1em.

## Layout

- Generous margins, `clamp(20px, ..., 80px)`.
- Max content width ~1400px.
- Square corners by default; pill shapes reserved for buttons.
- Mobile-first; must work at 360px wide with no horizontal scroll.
- 12-column grid on desktop (24px gutters, 32–64px outer margins); 4-column on mobile (12px gutters, 16px margins).

## Interactions

1. **Hero:** a single vertical column of comic-book panels fills the hero, behind and around the RAYCRAYON wordmark — a comic-page layout, not a photo or video background. Panel sizes vary within the column the way a real comic page reads (not a uniform grid) — a mix of larger and smaller panels for rhythm, largest panel at the bottom. See "Hero comic-panel texture" below for exactly what each panel is built from. Each letter of RAYCRAYON still turns a different accent color on hover, independently of the panel treatment underneath.

   The existing 3D model sits centered over the bottom (largest) panel at rest. On hover (desktop) or tap (touch), the model rises up through that panel and settles layered in front of the wordmark text; that panel gets a one-off speed-line/impact-burst flourish behind the model at the moment it pops through — this is the only place speed lines appear, used once as a flourish tied to the interaction, not decorating the rest of the column. The model reverses back down on mouse-out, or a second tap on touch. This stays hover/click-triggered, not scroll-linked, per the standing no-parallax rule below.

   This section no longer depends on any external hero video or image files — the whole column is built from CSS/SVG. Keyboard users need an equivalent way to trigger the same rise interaction as hover (e.g. the model or a wrapping element is focusable and responds to Enter/Space).

2. **Buttons and nav links:** fill with a different accent each time they're hovered (cycling through the palette).
3. **Project cards:** on hover, the poster swaps to a short muted loop and the title label fills with that project's accent, using the grainy gradient treatment below (not a flat fill). On touch devices there's no hover — tap opens the panel directly.
4. **Felines strip:** a horizontal row of the Felines pieces. Hovering/focusing one floods the whole section background with that piece's accent, using the grainy gradient treatment. Moving away returns to the base color. This is the signature interaction.
5. **Detail panel expand (Felines, and project cards generally):** clicking a piece morphs its card smoothly into a full detail panel using the browser's View Transitions API (`document.startViewTransition`) — the image scales/moves into place rather than a hard cut or generic modal fade. The background color-shifts to the piece's accent at the same time the morph happens, so color and motion land together. Falls back to an instant swap in browsers without View Transitions support. Closes on Esc, a close button, or click outside; focus returns to the originating card.

Everything else on the page stays still. No scroll hijacking, no parallax, no loading screen, no custom cursor. The hero's model pop-up is a hover/click interaction, not a scroll one, specifically to keep this rule intact.

## Hero comic-panel texture

The one other deliberate exception to "no gradients/glassmorphism," scoped to the hero only. Each panel in the hero column is a built texture, not an image:

- **Base treatment — halftone dot shading (Ben-Day dots):** a repeating dot pattern (CSS `radial-gradient` tiled as a background, or an SVG `<pattern>`), tinted with one accent from the crayon-box palette per panel, cycling through the palette panel to panel — the same "one accent per element" logic used for Felines and project cards. Dot density/scale varies slightly panel to panel so it doesn't read as one repeated tile.
- **Panel borders + gutters:** bold `#111111`-toned panel outlines (3–5px), with real off-white (`#FAF8F2`) gutters between panels — an actual comic-page grid, not just background color changes.
- **Ink crosshatch/linework:** at least one panel in the column uses crosshatch or directional hatching (repeating linear gradients or an SVG pattern) instead of, or layered with, the halftone dots, so the column isn't one texture repeated top to bottom.
- **Speed lines / impact burst:** used exactly once, in the bottom panel, as the flourish behind the 3D model at the moment it rises through — not used elsewhere in the column. Built as SVG (radiating lines from a center point, or a simple starburst shape).

Build everything here in CSS/SVG only — no raster textures, no external asset, no library. `prefers-reduced-motion`: the halftone/crosshatch textures stay static (they're not animated to begin with); disable the speed-line/impact-burst animation and the model's rise transition — the model can simply appear/disappear in place, or use an instant swap instead of an animated rise.

## Grainy gradient hover treatment

Replaces flat single-color hover fills everywhere else on the page (Felines strip, project card labels, any other hover-color surface — not the hero, which uses the comic-panel texture above instead). Two layers:

1. A soft gradient (radial or angled — not flat) built from the project's accent color.
2. A subtle grain/noise texture on top (SVG `feTurbulence` filter or a small tiling noise image at low opacity), blended in (e.g. `mix-blend-mode: overlay` or `soft-light`).

Keep it subtle — it should read as a premium paper-grain feel, not visual noise competing with the artwork.

`prefers-reduced-motion`: disable any grain animation — a static grain layer is fine, don't remove the texture entirely.

## Felines detail panel: design-breakdown vision board

The Felines detail panel is a mood-board style layout, not a single centered image with text below. It sits on that piece's grainy accent-colored background.

**Earlier version of this spec used a variable, ad-hoc element list (caption card, credit tag, process breakdown) that only existed for some pieces — this caused visibly uneven boards and depended on content that didn't always exist. Replaced with a fixed six-field structure that applies uniformly to every Feline, whether or not Ryan wrote about it:**

1. **Main render** — the full poster image, large, tilted a few degrees, soft drop shadow, like a pinned photo. Always present.
2. **Palette** — 4–5 swatches sampled directly from that piece's own artwork, hex codes in small type beneath each. Always present, always real (sampled from the actual image file, never guessed).
3. **Style** — one short line describing what's visually distinct about this piece within the series. See `03-project-tracker.md` for the actual written copy per piece.
4. **Font** — a small note stating the typography treatment. This one is a deliberate constant across every board, not a per-piece variable: bold condensed all-caps display type, stamped top and bottom of the frame, exactly as in Ryan's own Instagram posts.
5. **Elements used** — a short tag/list of the literal shapes and objects visible in the render (e.g. "cobalt triangular claw tips, concentric iris dial, gold star cat head"). Written by looking at the actual artwork — never invented.
6. **Explanation** — Ryan's real caption text where he wrote one (quoted or lightly cleaned up), or a plain visual observation where he didn't. Never a guess at his intent when he hasn't stated one. Credits (e.g. Feline #5's @mehu1x) fold into this field rather than being a separate slot.

All six fields exist for every Feline card — this is what makes the boards feel uniform. Content length varies (some Explanation fields are one real sentence, others are a short visual description), but the *shape* of every board is the same. Do not add a field that only some pieces have (like a "process breakdown image") back into this list — if a piece has bonus real material like that, treat it as a visual variation within the "main render" or "elements used" area, not a structural element other boards are missing.

If a piece's real content isn't known yet (currently true for Feline #6 — the finished artwork itself hasn't been seen, only a process breakdown image), leave Style/Elements/Explanation blank or show only what's confirmed rather than inventing plausible-sounding copy. See the tracker doc's open questions.

Presentation: main render largest and centered-ish; palette, style, font and elements as smaller supporting cards/tags scattered around it at slight rotations; explanation as a torn-sticky-note-style card. Consistent treatment across all seven so the "system" reads as one thing even as each board's color and content differ.

**Responsive behavior:** the scattered/rotated collage is a desktop treatment. On mobile it collapses into a clean stacked single column (main render → palette → style → font → elements → explanation), no overlap or rotation — legibility over cleverness at that size.

**Accessibility:** DOM order must follow this same logical reading order regardless of visual position/rotation, so keyboard and screen-reader navigation isn't scrambled by the collage layout.

## Media behavior

- Videos: `muted`, `playsinline`, `loop`, `preload="none"`, always with a poster image. Only play when in view or hovered — never autoplay with sound.
- `prefers-reduced-motion`: disable loops and color transitions; show static posters only.

## Accessibility baseline

- Visible keyboard focus on every clickable element.
- Alt text on all images.
- Text contrast ≥ 4.5:1.
- Popup video/detail panel: closes on Esc, close button, or click outside; focus returns to the triggering card on close.

## Reference points from research

- [Awwwards: hover-triggered color-change portfolio (Platoon Studio)](https://www.awwwards.com/inspiration/hover-change-color-project-portfolio) — closest reference for the Felines strip interaction.
- 2026 portfolio trend research favored: minimal/whitespace-led layouts, restrained color accents, interactive grids with hover reveals, and grain/texture as a tactile-digital trend — and steered away from "flashy" all-over animation. (Colorlib, Envato — see decisions log for full source list.)
