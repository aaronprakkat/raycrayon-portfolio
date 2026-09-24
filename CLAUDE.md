# Raycrayon portfolio

Single-page portfolio for Ryan Abraham Thomas ("Raycrayon"), a 3D and visual designer based in Bangalore. Maintained by Aaron. Deployed on Vercel from this repo.

## Stack and conventions

- Plain HTML, CSS and JavaScript. No framework, no build step, no npm.
- No external JS libraries, no exceptions. Google Fonts is the only external request. (`<model-viewer>` was used for a 3D model until 2026-09-24 and has been removed along with its `.glb`.)
- Files:
  - `index.html` page structure
  - `css/style.css` all styles, colors as CSS custom properties on `:root`
  - `js/projects.js` project data (the work grid renders from this list)
  - `js/main.js` rendering and interactions
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

1. **Hero name:** RAYCRAYON's letters are a window onto a duotoned still of Ryan's work; hover, focus or press moves on to the next piece (see Page sections).
2. **Buttons, nav links, tagline and tags:** fill with a different accent each time they are hovered or focused (cycle through the palette, one shared handler via `.js-fill` / `.js-accent`). The hero buttons use the grainy gradient version of the fill.
3. **Project cards:** on hover the poster swaps to its muted loop and the title label fills with that project's accent. On touch devices, no hover: tap opens the player.
4. **Felines strip:** a row of the Felines pieces. Hovering or focusing one changes the whole section background to that piece's color. Moving away returns to the base color.

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
   - The wordmark sits on the plain background with no box or outline. Its letters are filled with a duotoned still (SVG `feColorMatrix`, accent + `#FAF8F2`) cycling Pangeo, Mystery Shack, 70EMG, 0200, BLR 2025, Render House on hover/focus/press; it never reverts. Accents: pink, orange, cobalt only (lime and cyan are too light to hold letterforms). Under 700px: solid ink type, with the current still shown as its own block.
   - Tagline "3D worlds with a pulse." is a second-tier headline (Inter 600, up to 48px), keyboard-focusable, and fills with the cycling accent like the buttons.
   - Buttons "See the work" / "Get in touch": 14px/600 labels, grainy gradient accent fill on hover/focus. On phones they share a row or stack full width.
   - No 3D model in the hero.
3. **Selected work:** personal projects.
   - Intro: "Personal projects" heading beside a square dark (`#0B0B0E`) window playing `media/loops/sira-cow.mp4` (the full 10s turntable, muted, cover-fit, soft vignette). It is the page's one continuous motion at rest: an IntersectionObserver plays it when ~25% visible and pauses it when it leaves. Reduced motion: stays on its poster. Decorative, `aria-hidden`.
   - Felines (strip, see interactions)
   - Gumizoo (character roster + detail panels)
   - Pangeo (dark section, bento grid, projection mapping)
   - More personal work: 0200, BLR 2025, Render House (still), Mystery Shack (Gravity Falls tribute)
4. **Client work:** ASTERISK, 70EMG, Funk House Media.
5. **Experience:** from the CV below, as a vertical roadmap whose nodes light once, in crayon-box order, as entries scroll in.
6. **About and tools:** short bio, skills, software (tags use the accent cycling), and the headshot `media/stills/about-headshot.jpg` (alt "Portrait of Ryan Abraham Thomas") in a 4:5 hairline frame, `object-fit: cover`. It sits right of the tags on desktop, above them on tablet, first on phones.
7. **Contact:** large email link and Instagram. No phone number.

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
| gumizoo | Gumizoo | Personal | TBD | Character collection, waiting on files |
| pangeo | Pangeo | Client (Season One Inc.) | `#FF3DAC` | Projection mapping. Files: pangeo/PRIDE.mp4, pangeo/lust.mp4. Also Eros / Philia / Ludus (Valentine's visuals) and Aquarius |
| mystery-shack | Mystery Shack | Personal | `#FF5C2B` | Gravity Falls tribute. File: mystery_shack_final.mp4 |
| personal-0200 | 0200 | Personal | TBD | File: 0200.mp4 |
| personal-blr-2025 | BLR 2025 | Personal | TBD | File: final aniamtion blr 2025.mp4 |
| personal-render-house | Render House | Personal | TBD | File: RENDER HOUSE3.png |
| 70emg | 70EMG | Client | `#B8FF38` | File: animation_final.mp4 |
| asterisk | ASTERISK | Client | `#3154FF` | 3D-printed footwear accessories. Waiting on files |
| funk-house | Funk House Media | Client | `#26E1DD` | Video editing. Waiting on files |

Full-film links (YouTube/Vimeo): add here as they're uploaded.

## Media rules

- Hover loops: 6 to 10 seconds, 720p, H.264, no audio, 3 MB or less, `-movflags +faststart`. Ambient loops (currently only `sira-cow.mp4`) keep their natural length and are sized to where they render; same codec rules.
- Posters: JPG, 1080px tall, from the same moment as the loop start.
- Stills: WebP, 2000px wide max.
- Full films are embedded from YouTube/Vimeo, never stored in the repo.
- No file in the repo over 10 MB.
