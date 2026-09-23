---
description: Dated log of decisions made across chats and why, so later sessions don't re-litigate settled questions.
---

# Decisions log

Newest first. One entry per decision; keep entries short. Full reasoning/sources can live here if useful, but the *decision itself* should also be reflected in the relevant doc (01–04) — this log is a history, not the live source of truth.

### 2026-09-24 — Hero pivoted again: comic-book panel column, replacing the 3-video-panel stack
Same session as the video-panel hero below, superseded a few hours later. Instead of three stacked video panels, the hero is now a single vertical column of comic-book-style panels behind the RAYCRAYON wordmark, built entirely from CSS/SVG texture (no photography or video): halftone/Ben-Day dot shading tinted per-panel with the crayon-box accents, bold ink-dark panel borders with real gutters between panels (an actual comic-page grid, not just background color blocks), at least one panel using ink crosshatch/linework for texture variety, and a speed-line/impact-burst flourish used exactly once — behind the 3D model at the moment it rises through the bottom panel. The 3D model interaction itself is unchanged: centered at rest, rises through the bottom (largest) panel and layers over the wordmark on hover/click, reverses on mouse-out — still hover/click-triggered, not scroll-linked.

This drops `Nanju_render`, `colourgradebear_1` and `Aquarius` from the hero entirely — the new hero has no media dependency at all, so it doesn't need the "waiting on files" graceful-fallback handling the video version required. Removed those three from the tracker's project table; noted that Aquarius is real Ryan artwork that could still land in the work grid later, and that Nanju_render/colourgradebear_1's identity was never confirmed and no longer needs chasing.

### 2026-09-24 — Hero redesigned around a 3-panel video stack and a pop-up 3D model (superseded same day)
New hero concept from a hand sketch: three video panels stacked vertically behind the RAYCRAYON wordmark (top: `Nanju_render`, middle: `colourgradebear_1`, bottom: `Aquarius`), with the existing hero 3D model centered over the stack at rest, rising through the bottom panel on hover/click. Superseded later the same day by the comic-panel column above — kept here for history since a build prompt was issued for this version first.

### 2026-09-24 — Felines vision board rebuilt around a fixed six-field structure, not ad-hoc elements
The earlier vision-board spec (main render, detail crops, palette, caption card, spec stamp, credit tag, process breakdown) only worked for pieces that happened to have a caption/credit/breakdown — uneven across the series and impossible to build uniformly without inventing content for the rest. Replaced with six fields present on every board regardless of what Ryan wrote: main render, palette (sampled), style (written from the actual image), font (a genuine constant across the series — same stamped condensed type on every post), elements used (written from actually looking at the artwork), and explanation (his real words where given, a plain visual observation where not). Verified this was buildable by re-reading the actual Instagram screenshots rather than relying on memory — wrote real style/elements copy for Felines #1, #2, #3, #4, #5 and #7 into `03-project-tracker.md`. Feline #6 is the one exception: only a process-breakdown image has ever been seen, never the finished poster, so its style/elements/explanation are explicitly left blank pending that file from Ryan, rather than guessed.

### 2026-09-23 — Repo never received the vision-board spec docs; corrected
Traced a build confusion to its root cause: `01-brand-and-design-system.md` and `03-project-tracker.md` were written to claude.ai project knowledge only, never pushed to the repo, and Claude Code in VS Code has no access to that store. Sent both files directly (plus the recovered Feline #6 breakdown screenshot, which had also never been delivered as an actual file) for Aaron to add to the repo's `claude/` folder. Going forward: any doc Claude Code needs to read must be delivered as an actual file into the repo, not just written to project knowledge.

### 2026-09-23 — Hero got a real interactive 3D model; model-viewer approved as the one library exception
The build had already moved past the original hero concept (loop/still) to a live, draggable 3D character model layered with the wordmark. First attempt (custom viewer, unclear library) rendered laggy and flat — root cause diagnosed as an uncompressed/unbaked model export plus missing environment lighting, not fundamentally a code problem. Decided: Ryan re-exports as Draco-compressed `.glb` from Blender with baked textures; site uses Google's `<model-viewer>` web component to render it, chosen over a custom three.js build for lower code/maintenance overhead. This is now the one approved exception to the "no external JS libraries" rule in `04-tech-and-deploy.md`.

### 2026-09-23 — Project docs restructured
Split the single planning doc into `00`–`05` for easier partial reads across chats. The repo's `CLAUDE.md` remains the build-facing merge of the design/content/tracker/tech docs; it is not auto-synced with these, so changes need to be applied in both places manually.

### 2026-09-23 — Vercel for hosting, to start
Aaron's call. Free Hobby plan accepted despite its non-commercial-use clause, since migrating a static site to Cloudflare Pages later is low-effort if that becomes a problem.

### 2026-09-23 — Aaron maintains the site, plain code in VS Code
Ruled out Framer/Cargo/Webflow as the primary build for now (kept Framer as a noted fallback) since Aaron already codes and has Claude Code set up in VS Code.

### 2026-09-23 — Light/clean base instead of the original dark "Void" blueprint
An uploaded design blueprint proposed an all-black base. Aaron asked for something "very clean" with color only in interactive pops. Kept the blueprint's grid/type/composition rules but flipped the base to off-white (`#FAF8F2`), keeping black only for the Pangeo section (justified narratively — projection mapping work made for dark rooms).

### 2026-09-23 — Contact info: email + Instagram only
No phone number on the public site, per Aaron.

### 2026-09-23 — Single scrolling page, popup player for full films
Chosen for buildability in a short window; project detail pages explicitly deferred, not ruled out.

### 2026-09-23 — Style direction sourced from Ryan's actual work, not generic references
Reviewed Ryan's Instagram (@raycrayon_) via screenshots — identified two visual modes: the glossy "Felines" 3D-toy series (single saturated color per piece) and the darker neon "Pangeo" projection-mapping work. These became the basis for the accent-per-project system and the one dark section.
