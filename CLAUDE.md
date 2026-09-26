# Raycrayon portfolio

Single-page portfolio for Ryan Abraham Thomas ("Raycrayon"), a 3D and visual designer based in Bangalore. Maintained by Aaron. Deployed on Vercel from this repo.

## Stack and conventions

- Plain HTML, CSS and JavaScript. No framework, no build step, no npm.
- No external JS libraries, with one approved exception: `ogl` for the hero wordmark's WebGL ripple, pinned as an ES module at `https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm` (~39 KB compressed). It's only fetched, via dynamic `import()` from `js/hero-ripple.js`, on desktop (700px+) with WebGL and no reduced-motion preference. Otherwise Google Fonts is the only external request. (`<model-viewer>`, the previous exception, was removed on 2026-09-24.)
- Files:
  - `index.html` page structure
  - `css/style.css` all styles, colors as CSS custom properties on `:root`
  - `js/projects.js` project data (the work grid renders from this list)
  - `js/main.js` rendering and interactions
  - `js/hero-ripple.js` the wordmark's WebGL ripple (ES module, loaded on demand)
  - `media/loops/` short hover loops, plus the `sira-cow.mp4` ambient loop (MP4)
  - `media/posters/` poster frames for loops (JPG)
  - `media/stills/` still images (WebP; the About headshot is `about-headshot.jpg`)
  - `source/` raw files from Drive. Git-ignored. Never reference from the site.
- Media file names: `project-piece`, lowercase, hyphenated (e.g. `pangeo-lust.mp4`).
- When media is missing, render a solid block in the project's accent color with its title. No broken images, no visible "placeholder" text.

## Design

**Feel:** clean, calm and lots of white space. The artwork is loud and colorful, so the interface stays quiet. Color comes in only through interaction and the art itself.

**Colors**
- Base background: `#FAF8F2` (off-white)
- Text: `#111111`, muted text `#6B6B6B`, hairlines `rgba(17,17,17,.12)`
- Dark section (Pangeo only): background `#0B0B0E`, text `#F4F0DF`
- Accent "crayon box", used only for hover, focus and active states:
  pink `#FF3DAC`, cobalt `#3154FF`, lime `#B8FF38`, orange `#FF5C2B`, cyan `#26E1DD`
- Never put all accents in one component. No gradients or glassmorphism in the UI, except the grainy gradient hover treatment (accent gradient + grain, soft-light), which only appears on interaction.

**Type**
- Display: Bebas Neue (Google Fonts), uppercase, tight line-height. Used for big headings and project titles.
- Body and UI: Inter 400/500/600.
- Small labels: Inter 11 to 12px, uppercase, letter-spacing .1em.

**Layout**
- Generous margins (clamp 20px to 80px). Max content width about 1400px.
- Square corners by default. Pill shapes only for buttons.
- Mobile first. Works at 360px wide with no horizontal scroll.

## Interactions (the only four)

1. **Hero name:** RAYCRAYON's letters are a window onto a duotoned still of Ryan's work.
   - Hover-enter, focus or press moves on to the next piece (see Page sections).
   - On desktop with WebGL, the letters are a WebGL canvas: the image ripples under a moving cursor, and each swap melts outward from where it was triggered (from the centre on keyboard focus).
   - The render loop only runs while the cursor moves or a swap is in progress, and never while the wordmark is off-screen.
2. **Buttons, nav links, tagline and tags:** fill with a different accent each time they are hovered or focused (cycle through the palette, one shared handler via `.js-fill` / `.js-accent`). The hero buttons use the grainy gradient version of the fill.
   - **About name accent:** the "Ryan Abraham Thomas" heading (`.about__name.js-accent`, `tabindex="0"`, visible focus like the hero tagline) gets a thin 4px tick in the next accent, drawing in beneath it on hover/focus. At rest: plain ink heading, no underline. Reduced motion: same colour, appears instantly.
3. **Project cards:** on hover the poster swaps to its muted loop and the title label fills with that project's accent. On touch devices, no hover: tap opens the player.
   - **Multi-clip cards** (a `clips` list in `js/projects.js`): the card shows one active clip, clip 1 by default. Previous/Next arrow buttons and a "2 / 4" counter sit in a slim bar over the bottom of the media: revealed on hover/focus on desktop, always visible on touch.
   - Arrows swap the active clip's poster and loop with a crossfade (instant under reduced motion), wrap at both ends, and never open anything. A polite live region announces "Clip 2 of 4: <label>".
   - Clicking the card body opens the player on the active clip. Because buttons can't nest, the arrows are siblings of the card button inside a `.clip-card` wrapper. Cards with one clip get no arrows.
4. **Felines strip:** a row of the Felines pieces. Hovering or focusing one changes the whole section background to that piece's color. Moving away returns to the base color.
   - **Detail panel (`#board`):** clicking a Feline opens a full-screen "pinned mood board" on that piece's grainy accent background (accent gradient + `--grain`, soft-light at .5, like the grainy pills). The card's image morphs into the main render via View Transitions. Six fields, same for every Feline (see `claude/01-brand-and-design-system.md`): main render, palette, style, font, elements used, explanation (torn sticky note). DOM order follows that reading order whatever the visual position.
   - **Collage (900px+):** the render sits large in the centre (80svh tall, 500px max) with the title and cards clustered tight around it, overlapping its edges, spread down its full height so no corner is left empty. Every piece, including the render and the title (itself a small paper card), has its own tilt between about -3° and +4°, never the same as its neighbour.
   - **Pins:** every piece carries one motif, a small ink pin (dark dot with a drop shadow) at a top corner, alternating sides.
   - **Palette:** swatches are paint chips: white chip, own drop shadow, alternating slight tilt. One row from 1200px; they wrap below that.
   - **Entry:** the render arrives with the morph, then the title and cards fade/scale in 60ms apart (one-time, on open; uses the `scale` property so tilts are kept). Reduced motion: no stagger, everything already in place.
   - **Render hover:** the same hover as the strip card: with a mouse, the render swaps to the piece's muted loop (`media/loops/felines-0N.mp4`) and pauses on leave. Not on touch or under reduced motion.
   - **Phones (under 900px):** a flat single-column stack in reading order, with pins and chips but no card tilts or overlap.
   - **Cycling:** move through the seven Felines without closing, wrapping at both ends. Controls: round Prev/Next buttons (`.board__arrow`, "Previous Feline" / "Next Feline", styled like Close) at the sides on desktop and the bottom corners on phones; ←/→ keys while the panel is open; a two-finger horizontal trackpad swipe as a bonus (wheel `deltaX` summed to a threshold, one step per gesture until the wheel goes quiet). A "2 / 7" counter sits top-left opposite Close; a polite live region announces "Feline #2, Jaguar. 2 of 7". Focus stays on the arrow, and closing morphs back to (and focuses) the piece now showing.
   - **Cycling motion:** two beats, animating only `translate`/`rotate`/`opacity` (Web Animations API, no library). Exit: every piece except the main render flies outward along the line from the viewport centre, drifting against the direction of travel; the title card spins further than the rest. The main render instead does a card-flip on its vertical axis (`rotate: y`, perspective on `.board__sheet`), on its own track timed to the same beats: it turns edge-on over the exit beat, its image swaps while edge-on (never showing a mirrored back face), then it turns back in from the other edge in the same direction as the card entry plays (Next and Prev flip opposite ways). Then the content swaps (the neighbours' renders are preloaded, so it never waits on the network), and the new pieces fly back in from the same directions with the entry's 60ms stagger, drifting in from the far side. Clicks during a transition are ignored. `#board` gets `.is-cycling` (`overflow: hidden`) for exactly the cycle, since the scatter sends cards well past the dialog's edge and would otherwise show scrollbars for that off-screen transit (the dialog already fills the viewport, so nothing is actually clipped that was ever visible). Reduced motion: an instant swap, everything already pinned. The strip itself is unchanged: clicking a piece still opens straight to it.

**Section behavior:** when the Pangeo section scrolls into view, the page background transitions to dark (lights dimming, like a projection room), and back to light when it leaves.

**Rules**
- Native cursor. No scroll hijacking, no parallax, no loading screen.
- Videos: `muted`, `playsinline`, `loop`, `preload="none"`, poster image always set. Only play when in view or hovered.
- `prefers-reduced-motion`: no loops, no color transitions, show posters only.
- Visible keyboard focus on everything clickable. Alt text on all images. Text contrast at least 4.5:1.

**Popup player:** clicking a project opens a full-screen overlay with the full film (YouTube/Vimeo iframe, or a local MP4 if no link yet), the title, year, role and a short line of context. Closes on Esc, the close button, or a click outside. Focus returns to the card.

## Page sections (in order)

1. **Nav:** RAYCRAYON wordmark left. Work, About, Contact right.
2. **Hero:** eyebrow line, then RAYCRAYON at full content width (~98%, sized with `100cqi / 3.55`), then the tagline and two buttons.
   - The wordmark sits on the plain background with no box or outline. Its letters are filled with a duotoned still (accent + `#FAF8F2`) cycling Pangeo, Mystery Shack, 70EMG, 0200, BLR 2025, Render House on hover/focus/press; it never reverts. Accents: pink, orange, cobalt, plus same-hue stand-ins for lime (`#69A300`, on 0200) and cyan (`#16A19E`, on BLR 2025). The true lime and cyan are too light to hold letterforms, so the stand-ins are darkened only to orange's contrast level (~2.9:1 against the page).
   - Two renderers, same look at rest:
     - **WebGL** (`js/hero-ripple.js`, desktop 700px+ with WebGL and no reduced motion): a canvas over the text's line box, clipped to the letters by the SVG `#wordmark-clip`. The clip redraws the word at the same font size and measured baseline. The shader applies the same duotone math as the CSS filter.
     - **CSS fallback** (no WebGL, or reduced motion): `background-clip: text` with an SVG `feColorMatrix` filter per accent. Swaps are instant.
   - Under 700px: solid ink type, with the current still shown as its own block; no canvas, and `ogl` is never loaded.
   - Tagline "Bringing ideas into three dimensions." is a second-tier headline: Inter 600, uppercase, letter-spacing .06em, balanced line breaks. Its size is `clamp(17px, var(--wordmark) * .085, 34px)`, so it stays a fixed fraction of the wordmark (`--wordmark` is defined on `.hero .wrap`). The gap above it is `clamp(36px, var(--wordmark) * .2, 80px)`. It's keyboard-focusable and fills with the cycling accent like the buttons.
   - Buttons "See the work" / "Get in touch": 14px/600 labels, grainy gradient accent fill on hover/focus. On phones they share a row or stack full width.
   - No 3D model in the hero.
3. **Selected work:** personal projects.
   - Intro: "Personal projects" heading beside a square dark (`#0B0B0E`) window playing `media/loops/sira-cow.mp4` (the full 10s turntable, muted, cover-fit, soft vignette). It is the page's one continuous motion at rest: an IntersectionObserver plays it when ~25% visible and pauses it when it leaves. Reduced motion: stays on its poster. Decorative, `aria-hidden`.
   - Felines (strip, see interactions)
   - Gumizoo, per Ryan's layout sketch: "Gumizoo" heading top-left with the tagline "Four forms of stupidity" beneath it; directly below that a 2×2 grid of square hairline frames, one per head (Ashik Rancher, Gia Tangerine, Nanju Jam, Rana Ghee); beside the heading and grid together, spanning both at their combined height, the event poster (`media/stills/gumizoo.webp`, 9:16), static; below the grid/poster block, one shared materials note ("PLA+ filament, wood filler, primer, acrylic paint."). One compact block — the heading is exactly as wide as the grid+poster below it, not stretched to span wider (a wider heading with empty space trailing off beside it is what read as a stray floating element in an earlier build; there's no separate description/intro line for the same reason — copy that isn't part of the heading stack or the tiles themselves doesn't get its own slot here). All inside the standard `.wrap`, left-aligned at the standard gutter like every other section's heading (not centred). Desktop (900px+): sized to fit one viewport with no scroll — work backward from the height left over once the section's own (deliberately tight: 24px) padding and the real rendered height of the heading+tagline and the materials note are subtracted (each accounted for with the exact `clamp()` expression that field's type uses, not a guess), and only then does the standard width cap (`--max`) get a say, as a ceiling so the block never runs wider than the site's usual container. Getting the grid/poster closer to that width cap (rather than noticeably short of it) matters — square tiles plus a 9:16 poster mathematically can't both fill the standard 1400px content width *and* fit a typical ~900px browser viewport at the same time (verified: filling the width outright costs 100–330px of scroll depending on screen height), so this trims every bit of fixed overhead it can (tight padding and gaps, a smaller Gumizoo-only tagline size) to get the grid as big as the no-scroll budget allows — around 60–87% of the standard width on the common desktop sizes tested, not 100%. Gaps (heading to grid, between tiles, and grid to poster/materials) are tightened to 16px on desktop (24px on phones, the standard brand gutter). Frames (tiles and poster alike): 2px ink border (`rgba(17,17,17,.78)`) and a soft drop shadow. Tile texture: at rest a light neutral grainy gradient (off-white, grain at 42% opacity, `soft-light` blend — not `multiply`, which only ever darkens and read too heavy/saturated at rest); on hover/focus that tile's accent gradient fades in under the same grain (opacity up to .5), so it's one texture going from quiet to bold. The section background never floods; only the hovered tile does. Phones: heading, tagline, grid, poster, materials note stacked.
     - **The heads are Blender renders, not live 3D** (no WebGL, no new library). Source: Ryan's STLs in `Desktop\Ryan` (53–169 MB each, never in the repo). Each STL's loose parts (face, hair, ears, eyes, teeth, tongue, keyring loop) are coloured from his own reference renders: an ID-map render is aligned to the reference and each part takes the median reference colour, then calibrated against a Cycles render until they match. Parts hidden from the front copy their visible twin. Lighting: soft key/fill/top area lights and a neutral grey studio world (it was the references' orange backdrop, which cast an orange reflection on every head), glossy coated plastic, transparent film. The near-white parts (teeth, eye whites) keep the sampled cream hue.
     - Assets per head: `media/stills/gumizoo-<slug>-3d.webp` (still, frame 0), `gumizoo-<slug>-turn.webp` (36 frames, 10° apart, as a 6×6 sprite; an exception to the 2000px stills rule) and `-turn-480.webp` (the same at 60% for phones). All four are normalised to the same front width and centre, and every frame is cropped to one shared tight box (symmetric about the turning axis), whose aspect is `--gumi-ar` on `:root`. So one CSS rule sizes every head identically: 95% of the tile's width, and the full width of the panel's model column. Rendered at 1536px a frame (≈2× the panel model's largest CSS size, for HiDPI) at 128 Cycles samples for the turntable / 256 for the still, exported near-lossless (webp quality 92–95, not the default compression, since this glossy-gradient material shows compression artefacts first). The Blender scene/scripts that produced these live outside the repo (Claude's scratch folder from the session that built this) — if they're needed again for a re-render, rebuild them to the same numbers above rather than assuming a copy still exists somewhere.
     - Tiles show the still. Hover/focus (mouse, keyboard): the head lifts out of its frame (rises, scales 1.2, tilts -4°, drop shadow), its nameplate slides up as a slim band across just the bottom of the frame (accent fill, 3px ink top border, Bebas, surname smaller) — legible, but level (no tilt) and shallow enough that the head stays fully visible above it, not covered (an earlier, larger, centred sticker version covered most of the face) — that tile floods with its accent (no fragments), and the GUMIZOO heading turns that character's accent (black at rest, and again when nothing is active). The hover also starts fetching that head's turntable. Touch: no hover; nameplate bands always shown (smaller); tap opens the panel.
     - The active/hover state is tracked explicitly in JS (one `.is-active` class, not `:hover`/`:focus-visible`), because closing the panel needs to reliably leave it off: `dialog.close()` restores focus to the tile synchronously (as part of the call, before its own `close` event even fires) and, since the dialog sat right over the tile, revealing it again fires a synthetic `pointerover` too if the pointer's still there — both would otherwise re-light the tile. Opening a panel explicitly clears the active tile up front (the moment it's clicked, not on some later pointerleave a click pre-empts); closing sets a guard flag before `close()`+`focus()` and only releases it once the closing view transition's own `.finished` promise resolves (a fixed delay isn't enough — the reveal, and so the synthetic pointerover, waits for the ~0.55s morph to finish).
     - Click: one full 360° turn of the head is the transition into the detail panel (it runs inside the View Transitions morph from tile to panel). In the panel the head is the dominant element (a 1.6fr : 1fr column split, 1280px max sheet, 64px/40px top/bottom padding); drag across the head (its width = one full turn) or use the arrow keys (it's a `role="slider"` with degrees as the value) to turn it. Closing turns it back to face front, then morphs back to the tile. Nanju's reserved video slot is the one thing that makes his panel's text column taller than the other three's — its size (`max-width`, self-shrinking below a 800px-tall viewport down to a 200px floor) is tuned so his panel fits the same as the others rather than needing its own scrollbar.
     - The turntable sprite is decoded ahead of time, not at the moment the panel opens: the first time a ~40-megapixel sheet is ever actually painted (as opposed to just fetched) costs a real, measured ~300-400ms — a visible stall right in the transition. `warmSprite()` (main.js) pays that cost as soon as the sprite finishes loading (on hover or keyboard focus, same trigger as `loadSprite`), using a real (`opacity: 0` skips the actual paint/decode work as a browser optimisation, so it can't be that) but genuinely imperceptible — `opacity: .003`, verified by pixel-diffing a hover-active screenshot against a no-hover baseline (max 1/255 per channel) — composited element sized close to the panel's actual on-screen size, so the decode has already happened by the time a real hover/focus-then-click reaches the panel. `.01` shipped once and was visible (a soft accent-coloured smear in the section's empty corner); clipping the element down to hide it, tried too, measurably weakens the warm-up itself rather than just hiding it.
     - Reduced motion: no lift, no spin, no morph, no bounce; the nameplate still shows; the panel still lets you turn the head.
     - Panel text: the same three pieces for every character (identity stamp, personality tag, bio note), plus the reserved slot (Nanju's Breaking Gumi video) and scattered fragments. Type is big and bold next to the model (stamp Bebas up to 96px, tag Inter 600, bio Inter 500 18–22px). Each character's set has its own voice, via `data-gumi` on the panel (Gumizoo only; Felines and other sections stay uniform on purpose):
       - Ashik (hard-headed): a blocky accent slab with a heavy ink outline and hard square shadows, fattened lettering, an ink-black tag, a square bio card; no tilt at all.
       - Gia (gluttonous): glossy candy: a rounded, shiny stamp and a sugar-tinted bio note whose bottom edge melts into drips.
       - Nanju (gambling-type stupid): reckless: cards thrown at loose, mismatched angles and offsets; a double-ruled stamp; the tag is a dashed raffle ticket.
       - Rana (boy-crazy): soft: rounded corners throughout, a blush-coloured soft shadow, and a light bouncy entrance (stamp, tag, bio 100ms apart) when her panel opens.
   - Pangeo (dark section, bento grid, projection mapping)
   - More personal work: 0200, BLR 2025, Render House (still), Mystery Shack (Gravity Falls tribute)
4. **Client work:** ASTERISK (4 clips: video + 3 concept stills), 70EMG (4 clips), Funk House Media (3 clips). All use the multi-clip card pattern; still clips have no hover loop and open as an image in the player.
5. **Experience:** from the CV below, as a vertical roadmap whose nodes light once, in crayon-box order, as entries scroll in.
6. **About and tools:** short bio, skills, software (tags use the accent cycling), and the headshot `media/stills/about-headshot.jpg` (alt "Portrait of Ryan Abraham Thomas") in a 4:5 hairline frame, `object-fit: cover`. The name heading reacts to hover/focus (see Interactions 2). On wide desktop (1240px+) it sits right of the heading and tags, running from the top of the name heading to the end of the bio/tags (cropped to fit, 56px gap); from 1100px it sits right of the tags at 4:5, above them on tablet, first on phones.
7. **Contact:** a tagline-style line "Follow along, or say hello.", then two matching rows split by hairlines, Instagram first (it matters more than email for this profile): `@raycrayon_` and the email, both in Bebas at the same size (sized so the email fits), each with a single-colour inline-SVG icon (Instagram glyph, envelope; text colour, never brand colours). The email row ends with a "Copy email" pill (hidden where the clipboard API is unavailable; announces via a polite live region). Under 700px the email breaks before `@gmail.com` so both rows can be larger. Then a "Based in Bangalore, India" label. No phone number.

## Content

**Name:** Ryan Abraham Thomas. Public name: Raycrayon.
**Role:** 3D | Visual Designer
**Email:** ryanabrahamthomas@gmail.com
**Instagram:** https://www.instagram.com/raycrayon_
**Domain:** Ryan's own domain (to be connected on Vercel)

**Bio (from CV):**
My passion for visual art comes from a constant curiosity to understand how things can be imagined, created, and brought to life. I enjoy exploring 3D modelling, digital illustration, motion graphics, and video as different ways of expressing an idea and telling a story. I'm driven by experimentation, attention to detail, and the desire to keep learning and pushing my creative boundaries.

**Experience**
- **3D Artist**, ASTERISK, Bangalore, 2026 to present. Design and development of 3D-printed accessories for footwear: modelling, refinement and visual development, exploring form, proportion, materials and print feasibility.
- **Projection Mapping Artist**, Season One Inc., Bangalore, 2024 to 2026. Visual development and setup of an immersive stage experience for Pangeo. 3D and digital visuals built for a large-scale immersive environment, considering composition, scale, movement and audience perspective.
- **Junior Visual Intern**, 70EMG, Mumbai, 2025. Visual and video content for events and social media: promotional graphics, digital assets and short-form content.
- **Junior Video Editor**, Funk House Media, Bangalore, 2024. Promotional videos for social media and ad campaigns: footage, graphics, music, transitions and motion.

**Education:** Bachelor of Design, Srishti Manipal Institute of Art, Design and Technology, Bangalore, 2022 to 2026.

**Skills:** 3D modelling, motion graphics, video editing, projection mapping, 3D printing, visual storytelling, illustration.
**Software:** Blender, Premiere Pro, After Effects, Photoshop, Illustrator, Bambu Studio.

## Projects

Accent colors for Felines were sampled by eye from Instagram. Adjust against the real files.

| Slug | Title | Type | Accent | Notes |
|---|---|---|---|---|
| felines-01 | Feline #1, House Cat | Personal | `#FF7A6B` | 10-day art challenge with @supersolarian |
| felines-02 | Feline #2, Jaguar | Personal | `#6EC8FF` | |
| felines-03 | Feline #3, Cheetah | Personal | `#C6F24E` | "Lemon flavour" |
| felines-04 | Feline #4, Lion | Personal | `#FF6A1A` | "Ketchup and mustard" |
| felines-05 | Feline #5, Lynx | Personal | `#FF4FB8` | Hot pink |
| felines-06 | Feline #6, Ocelot | Personal | `#16A6A0` | Has a render breakdown (viewport, Eevee, Cycles) |
| felines-07 | Feline #7, Panther | Personal | `#B38CFF` | Lavender |
| felines-08 to 10 | Feline #8 to #10 | Personal | TBD | Waiting on files |
| gumizoo | Gumizoo | Personal | per character | Character collection. Four heads (see Page sections) rendered from Ryan's STLs; accents in `js/projects.js` |
| pangeo | Pangeo | Client (Season One Inc.) | `#FF3DAC` | Projection mapping. Files: pangeo/PRIDE.mp4, pangeo/lust.mp4. Also Eros / Philia / Ludus (Valentine's visuals) and Aquarius |
| mystery-shack | Mystery Shack | Personal | `#FF5C2B` | Gravity Falls tribute. File: mystery_shack_final.mp4 |
| personal-0200 | 0200 | Personal | TBD | File: 0200.mp4 |
| personal-blr-2025 | BLR 2025 | Personal | TBD | File: final aniamtion blr 2025.mp4 |
| personal-render-house | Render House | Personal | TBD | File: RENDER HOUSE3.png |
| 70emg | 70EMG | Client | `#B8FF38` | Clips: 1 `70emg-animation` (animation_final.mp4), 2 `70emg-nikhil-kamath`, 3 `70emg-generation-speed`, 4 `70emg-elf` |
| asterisk | ASTERISK | Client | `#3154FF` | 3D-printed footwear accessories. Clips: 1 `asterisk-scene-3` (clip_scene3_white0001-0122.mp4), 2–4 concept stills `asterisk-concept-black`, `-cream`, `-white` (WebP) |
| funk-house | Funk House Media | Client | `#26E1DD` | Video editing. Clips: 1 `funk-house-sling`, 2 `funk-house-manetain`, 3 `funk-house-iza-dawgs` |

Client clip sources live in `Downloads\client works\` (asterisk, seventy, funkhouse medi) and are copied into `source/projects/clients/`. Each clip has `media/loops/<name>.mp4` and `media/posters/<name>.jpg`.

Full-film links (YouTube/Vimeo): add here as they're uploaded.

## Media rules

- Hover loops: 6 to 10 seconds, 720p, H.264, no audio, 3 MB or less, `-movflags +faststart`. Ambient loops (currently only `sira-cow.mp4`) keep their natural length and are sized to where they render; same codec rules.
- Posters: JPG, 1080px tall, from the same moment as the loop start.
- Stills: WebP, 2000px wide max.
- Full films are embedded from YouTube/Vimeo, never stored in the repo.
- No file in the repo over 10 MB.
