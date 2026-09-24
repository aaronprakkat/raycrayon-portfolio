// film: YouTube or Vimeo URL once uploaded. Until then the player shows the hover loop.
// clips: optional ordered list ({ label, loop, poster, alt } or { label, still, alt }) for multi-clip cards.
//   Clip 1 is the default cover; with more than one, the card gets Previous/Next arrows and the player
//   opens whichever clip is active. A clip's fields override the project's own.
// year / role / context: empty strings are hidden on the page.
// board (Felines): palette is sampled from the artwork; style, elements and caption come from
// claude/03-project-tracker.md. caption is Ryan's own words; note is a plain visual observation.
// Leave a field out when it isn't known rather than writing placeholder copy.
// captionDraft: true marks a caption we wrote in Ryan's voice; replace it once he approves or rewrites it.
const PROJECTS = [
  {
    slug: 'felines-01', group: 'felines', title: 'Feline #1', meta: 'House Cat', accent: '#FF7A6B', ratio: '9 / 16',
    loop: 'media/loops/felines-01.mp4', poster: 'media/posters/felines-01.jpg',
    alt: 'Feline #1: a glossy pink and blue 3D house cat on a coral background',
    film: '', year: '', role: '', context: 'Day one of a ten-day art challenge with @supersolarian.',
    board: {
      palette: ['#F9B6F5', '#F27776', '#3340F4', '#EA0F70', '#F39B25'],
      style: 'Warm pink-to-orange gradient ground; softer, rounder toy-blob forms than the later pieces.',
      elements: ['Inflated cream and peach claw-paw forms', 'Cobalt triangular claw tips', 'One pink dagger-like spike', 'Concentric blue-and-purple dial, like an iris', 'Small gold star-shaped cat head with ears'],
      caption: 'Day one, starting soft. Strawberry peach with a few blueberry claws.',
      captionDraft: true,
      note: 'Inspired by @azpeger.tat’s cat photos.',
    },
  },
  {
    slug: 'felines-02', group: 'felines', title: 'Feline #2', meta: 'Jaguar', accent: '#6EC8FF', ratio: '9 / 16',
    loop: 'media/loops/felines-02.mp4', poster: 'media/posters/felines-02.jpg',
    alt: 'Feline #2: pale blue 3D rings and a rosette-patterned cat wrapped in hot-pink spiked chains on an icy blue swirl',
    film: '', year: '', role: '', context: 'My laptop hasn’t gotten a break from rendering.',
    board: {
      palette: ['#B1E2FB', '#64CAF7', '#E874D8', '#F7CFF7', '#2FB1E4'],
      style: 'Cool icy blue, swirling vortex background, more mechanical and interlocking than organic.',
      elements: ['Pale blue glossy interlocked ring and donut forms', 'Hot-pink spiked chain wrapping through them', 'Rosette-patterned blue cat at the centre', 'Paw-print detail'],
      caption: 'My laptop hasn’t gotten a break from rendering.',
    },
  },
  {
    slug: 'felines-03', group: 'felines', title: 'Feline #3', meta: 'Cheetah', accent: '#C6F24E', ratio: '9 / 16',
    loop: 'media/loops/felines-03.mp4', poster: 'media/posters/felines-03.jpg',
    alt: 'Feline #3: a lime-green glossy 3D cheetah',
    film: '', year: '', role: '', context: 'Lemon flavour.',
    board: {
      palette: ['#C7EB5D', '#EEE99C', '#88EF3B', '#73FF9E'],
      style: 'Lime and citrus green, balloon-animal-like twisted tube forms, swirling vortex backdrop.',
      elements: ['Glossy lime balloon-twist tubes', 'Small yellow star accents', 'Green spiral background'],
      caption: 'Went for a Lemon flavour. I can taste the video.',
    },
  },
  {
    slug: 'felines-04', group: 'felines', title: 'Feline #4', meta: 'Lion', accent: '#FF6A1A', ratio: '9 / 16',
    loop: 'media/loops/felines-04.mp4', poster: 'media/posters/felines-04.jpg',
    alt: 'Feline #4: a red and orange 3D lion with a flame-shaped mane',
    film: '', year: '', role: '', context: 'Ketchup and mustard.',
    board: {
      palette: ['#F6A331', '#DE060B', '#FAD6AF', '#EF5A0F'],
      style: 'Fire palette (orange, red, mustard), radial and explosive: the most aggressive piece in the series so far.',
      elements: ['Large orange ring', 'Red conical spikes, like a mane or claws', 'Mustard-yellow star medallion', 'Flame pattern across the background'],
      caption: 'Ketchup and Mustard. I’ve been making too many food colour palettes I should finally eat.',
    },
  },
  {
    slug: 'felines-05', group: 'felines', title: 'Feline #5', meta: 'Lynx', accent: '#FF4FB8', ratio: '9 / 16',
    loop: 'media/loops/felines-05.mp4', poster: 'media/posters/felines-05.jpg',
    alt: 'Feline #5: a hot pink 3D lynx paw wrapped in a cobalt cage',
    film: '', year: '', role: '', context: 'Hot pink.',
    board: {
      palette: ['#F69FF8', '#F048DF', '#904CF4', '#EC3E9D', '#4530F0'],
      style: 'Hot pink with a cobalt wire structure woven through; by Ryan’s own note, the most abstract face in the series.',
      elements: ['Glossy hot-pink paw and claw forms', 'Cobalt looping wire structure threaded through them', 'Visible paw pad detail'],
      caption: 'I wanted to be more abstract with the face design, which is surprisingly the most satisfying part of the challenge.',
      note: 'Made possible by @mehu1x’s Adobe subscription.',
    },
  },
  {
    slug: 'felines-06', group: 'felines', title: 'Feline #6', meta: 'Ocelot', accent: '#16A6A0', ratio: '9 / 16',
    loop: 'media/loops/felines-06.mp4', poster: 'media/posters/felines-06.jpg',
    alt: 'Feline #6: glossy teal 3D forms with yellow ribbons and red flames on a near-black ground',
    film: '', year: '', role: '', context: '',
    board: {
      palette: ['#31FDD9', '#F1EE11', '#13A27F', '#061F19', '#DB1A0D'],
      style: 'Teal on a near-black ground, the darkest backdrop in the series, with yellow and red cutting through like flames.',
      elements: ['Glossy teal and aqua tube forms', 'Yellow ribbon swirls and flame curls', 'Red flame droplets', 'Red spiked starbursts', 'Small crown-like yellow and red clusters'],
      caption: 'Mint, mango and a bit of chilli. Still haven’t eaten.',
      captionDraft: true,
    },
  },
  {
    slug: 'felines-07', group: 'felines', title: 'Feline #7', meta: 'Panther', accent: '#B38CFF', ratio: '9 / 16',
    loop: 'media/loops/felines-07.mp4', poster: 'media/posters/felines-07.jpg',
    alt: 'Feline #7: a lavender 3D panther curled around a spiked wheel',
    film: '', year: '', role: '', context: 'Lavender.',
    board: {
      palette: ['#D485F3', '#AA16D2', '#EE3BAB', '#A255F7', '#F5D6FB'],
      style: 'Lavender and purple, the most “mecha” piece in the series: concentric mechanical dial forms rather than soft blobs.',
      elements: ['Lavender glossy forms', 'Pink cat-ear and bow shapes at the top', 'Large concentric dial with a starburst centre', 'Ring of triangular spikes'],
      caption: 'Took more time into polishing the details… a bit of a mecha/stand combo with this piece. At the end of the day I wanna see my whole collection in One Piece.',
    },
  },
  {
    slug: 'pangeo-pride', group: 'pangeo', title: 'Pride', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-pride.mp4', poster: 'media/posters/pangeo-pride.jpg',
    alt: 'Pride: collaged bands of a sunlit god, chameleons, fish and palms across a classical arcade',
    film: '', year: '', role: 'Projection mapping artist', context: 'Season One Inc.', tile: 'anchor',
  },
  {
    slug: 'pangeo-lust', group: 'pangeo', title: 'Lust', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-lust.mp4', poster: 'media/posters/pangeo-lust.jpg',
    alt: 'Lust: a pineapple shrine framed by snakes and fluted columns in violet light',
    film: '', year: '', role: 'Projection mapping artist', context: 'Season One Inc.', tile: 'anchor',
  },
  // tile: grid position in the Pangeo bento (see .pangeo-grid in style.css). ratio is each file's native shape;
  // tiles never crop, so a new ratio only changes letterboxing, not the layout.
  {
    slug: 'pangeo-valentine', group: 'pangeo', title: 'Valentine', meta: 'Pangeo', accent: '#FF3DAC', ratio: '9 / 16',
    loop: 'media/loops/pangeo-valentine.mp4', poster: 'media/posters/pangeo-valentine.jpg',
    alt: 'Valentine’s visuals: three stacked scenes titled Eros, Philia and Ludus in hot pink, red and violet',
    film: '', year: '', role: 'Projection mapping artist', context: 'Eros, Philia and Ludus. Season One Inc.', tile: 'flagship',
  },
  {
    slug: 'pangeo-blue-bear', group: 'pangeo', title: 'Blue bear', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-blue-bear.mp4', poster: 'media/posters/pangeo-blue-bear.jpg',
    alt: 'Bear colour study: glossy blue gummy bears tumbling through pink and white striped bands',
    film: '', year: '', role: 'Projection mapping artist', context: 'Bear colour study. Season One Inc.', tile: 'bear-lead',
  },
  {
    slug: 'pangeo-colour-bear-1', group: 'pangeo', title: 'Colour bear 1', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-colour-bear-1.mp4', poster: 'media/posters/pangeo-colour-bear-1.jpg',
    alt: 'Bear colour study: a pale bear face inside a violet mandala ring on bright blue',
    film: '', year: '', role: 'Projection mapping artist', context: 'Bear colour study. Season One Inc.', tile: 'bear',
  },
  {
    slug: 'pangeo-colour-bear-4', group: 'pangeo', title: 'Colour bear 4', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-colour-bear-4.mp4', poster: 'media/posters/pangeo-colour-bear-4.jpg',
    alt: 'Bear colour study: pale blue gummy bears and a checkered block on sweeping pink ribbons',
    film: '', year: '', role: 'Projection mapping artist', context: 'Bear colour study. Season One Inc.', tile: 'bear',
  },
  {
    slug: 'personal-0200', group: 'personal', title: '0200', meta: 'Personal', accent: '#B8577F', ratio: '16 / 9',
    loop: 'media/loops/personal-0200.mp4', poster: 'media/posters/personal-0200.jpg',
    alt: '0200: a small golden snail robot on a hill of orange grass at dusk',
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'personal-blr-2025', group: 'personal', title: 'BLR 2025', meta: 'Personal', accent: '#D6307A', ratio: '16 / 9',
    loop: 'media/loops/personal-blr-2025.mp4', poster: 'media/posters/personal-blr-2025.jpg',
    alt: 'BLR 2025: a pink and violet city of towers with a metro train crossing an overpass',
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'personal-render-house', group: 'personal', title: 'Render House', meta: 'Personal', accent: '#7A5CFF', ratio: '16 / 9',
    still: 'media/stills/personal-render-house.webp',
    alt: 'Render House: a grey clay render of a tiered, lattice-roofed house among tall grass at night',
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'mystery-shack', group: 'personal', title: 'Mystery Shack', meta: 'Tribute', accent: '#FF5C2B', ratio: '16 / 9',
    loop: 'media/loops/mystery-shack.mp4', poster: 'media/posters/mystery-shack.jpg',
    alt: 'Mystery Shack: the Gravity Falls shack in saturated reds and violets, with a glowing Bill Cipher on the roof',
    film: '', year: '', role: '', context: 'A tribute to Gravity Falls.',
  },
  {
    slug: 'asterisk', group: 'client', title: 'ASTERISK', meta: '2026', accent: '#3154FF', ratio: '4 / 5',
    film: '', year: '2026', role: '3D artist', context: '3D-printed accessories for footwear: modelling, refinement and print feasibility.',
    clips: [
      { label: 'Scene 3', loop: 'media/loops/asterisk-scene-3.mp4', poster: 'media/posters/asterisk-scene-3.jpg',
        alt: 'ASTERISK: a white 3D-printed shoe accessory turning slowly on black' },
      { label: 'Concept, black', still: 'media/stills/asterisk-concept-black.webp',
        alt: 'ASTERISK concept: a black leather sneaker with a mint-green and lilac sculpted 3D-printed accessory wrapped over the laces' },
      { label: 'Concept, cream', still: 'media/stills/asterisk-concept-cream.webp',
        alt: 'ASTERISK concept: a cream suede sneaker with a pink and yellow swirling 3D-printed accessory across the laces' },
      { label: 'Concept, white', still: 'media/stills/asterisk-concept-white.webp',
        alt: 'ASTERISK concept: a white and grey sneaker with a yellow and lime-green sculpted 3D-printed accessory at the laces' },
    ],
  },
  {
    slug: '70emg', group: 'client', title: '70EMG', meta: '2025', accent: '#B8FF38', ratio: '4 / 5',
    film: '', year: '2025', role: 'Junior visual intern', context: 'Visual and video content for events and social media.',
    clips: [
      { label: 'Animation', loop: 'media/loops/70emg-animation.mp4', poster: 'media/posters/70emg-animation.jpg',
        alt: '70EMG: a red wireframe structure glowing against a dark red background' },
      { label: 'Nikhil Kamath', loop: 'media/loops/70emg-nikhil-kamath.mp4', poster: 'media/posters/70emg-nikhil-kamath.jpg',
        alt: '70EMG: event invite with a black-and-white portrait of Nikhil Kamath over orange and blue shapes' },
      { label: 'Generation Speed', loop: 'media/loops/70emg-generation-speed.mp4', poster: 'media/posters/70emg-generation-speed.jpg',
        alt: '70EMG: Generation Speed logo animation, a green line-drawn car wheel on cream' },
      { label: 'ELF', loop: 'media/loops/70emg-elf.mp4', poster: 'media/posters/70emg-elf.jpg',
        alt: '70EMG: ELF promo with a woman applying lipstick in a polaroid frame over a pink sequinned backdrop' },
    ],
  },
  {
    slug: 'funk-house', group: 'client', title: 'Funk House Media', meta: '2024', accent: '#26E1DD', ratio: '4 / 5',
    film: '', year: '2024', role: 'Junior video editor', context: 'Promotional videos for social media and ad campaigns.',
    clips: [
      { label: 'Sling', loop: 'media/loops/funk-house-sling.mp4', poster: 'media/posters/funk-house-sling.jpg',
        alt: 'Funk House Media: a Dalwhinnie whisky bottle on a dim bar shelf' },
      { label: 'Manetain', loop: 'media/loops/funk-house-manetain.mp4', poster: 'media/posters/funk-house-manetain.jpg',
        alt: 'Funk House Media: a woman with curly hair and glasses talking to camera, with captions' },
      { label: 'Iza Dawgs', loop: 'media/loops/funk-house-iza-dawgs.mp4', poster: 'media/posters/funk-house-iza-dawgs.jpg',
        alt: 'Funk House Media: tongs lifting a seared piece of fish from a bowl of noodles and greens' },
    ],
  },
];

// Hero wordmark fill, in rotation order. Crops are greyscale; colour is applied at render time from `accent`,
// so no image regeneration is needed to change it. True lime/cyan (#B8FF38/#26E1DD) are too light to hold
// letterforms against the off-white page, so 0200 and BLR 2025 use same-hue stand-ins, darkened only as far
// as orange (the weakest of the site's five accents): contrast ~2.9:1 vs. the page, same as the others.
const HERO_FILLS = [
  { title: 'Pangeo', accent: '#FF3DAC', src: 'media/stills/hero-fill-pangeo.webp', small: 'media/stills/hero-fill-pangeo-800.webp' },
  { title: 'Mystery Shack', accent: '#FF5C2B', src: 'media/stills/hero-fill-mystery-shack.webp', small: 'media/stills/hero-fill-mystery-shack-800.webp' },
  { title: '70EMG', accent: '#3154FF', src: 'media/stills/hero-fill-70emg.webp', small: 'media/stills/hero-fill-70emg-800.webp' },
  { title: '0200', accent: '#69A300', src: 'media/stills/hero-fill-0200.webp', small: 'media/stills/hero-fill-0200-800.webp' },
  { title: 'BLR 2025', accent: '#16A19E', src: 'media/stills/hero-fill-blr-2025.webp', small: 'media/stills/hero-fill-blr-2025-800.webp' },
  { title: 'Render House', accent: '#3154FF', src: 'media/stills/hero-fill-render-house.webp', small: 'media/stills/hero-fill-render-house-800.webp' },
];

// accent is sampled from each character's body in its portrait; bg is the portrait's backdrop, used to fill the display window.
// bio: PROPOSED COPY pending final approval, not sourced from Ryan (bioDraft: true). Replace once he approves or rewrites it.
// fragments: small motifs scattered over the hover flood and the detail panel. These are PLACEHOLDERS cropped
//   from the portrait ({ at: [x, y] centre as 0–1 fractions, zoom, shape }). To use a prepared transparent PNG
//   instead, replace an entry with { src: 'media/stills/gumizoo-fragments/<file>.png' }. Positions live in CSS slots.
// video: optional extra clip; it plays only in the expanded panel's reserved slot, never over the display artwork.
const GUMIZOO = {
  poster: {
    src: 'media/stills/gumizoo.webp',
    alt: 'Gumizoo event poster: a green gummy character behind pink “Gumi Zoo” lettering, listing the four available gumis',
  },
  characters: [
    {
      slug: 'ashik-rancher', name: 'Ashik', surname: 'Rancher', trait: 'Hard-headed.', accent: '#B72D03', bg: '#5F0C8C',
      alt: 'Ashik Rancher: a red-orange 3D gummy monkey head with jagged teeth and a scowl, on purple',
      bio: 'Ashik is convinced he’s right about everything, mostly because he’s never once been wrong loud enough to notice. Named after ranch dressing: goes on everything, argues with nothing.',
      bioDraft: true,
      fragments: [
        { at: [0.47, 0.55], zoom: 6, shape: 'tooth' },
        { at: [0.1, 0.47], zoom: 5, shape: 'star' },
        { at: [0.36, 0.39], zoom: 9, shape: 'circle' },
      ],
    },
    {
      slug: 'gia-tangerine', name: 'Gia', surname: 'Tangerine', trait: 'Gluttonous.', accent: '#8C4079', bg: '#CF046B',
      alt: 'Gia Tangerine: a purple 3D gummy monkey head with teal hair and a long blue tongue, on magenta',
      bio: 'Gia would eat the couch if you left it near the fridge long enough. Named after a tangerine because she’s sweet, a little sour, and gone in one bite.',
      bioDraft: true,
      fragments: [
        { at: [0.46, 0.65], zoom: 5, shape: 'circle' },
        { at: [0.16, 0.47], zoom: 5, shape: 'star' },
        { at: [0.55, 0.45], zoom: 9, shape: 'circle' },
      ],
    },
    {
      slug: 'nanju-jam', name: 'Nanju', surname: 'Jam', trait: 'Gambling-type stupid.', accent: '#9A8807', bg: '#F4B60C',
      alt: 'Nanju Jam: an olive-green 3D gummy monkey head with dripping hair and clenched teeth, on yellow',
      bio: 'Nanju bets on things that were never a competition, staring contests with the microwave, mostly. Named after jam because he’s sticky, unpredictable, and somehow always all over the place.',
      bioDraft: true,
      fragments: [
        { at: [0.49, 0.63], zoom: 6, shape: 'tooth' },
        { at: [0.09, 0.46], zoom: 5, shape: 'star' },
        { at: [0.49, 0.31], zoom: 10, shape: 'circle' },
      ],
      video: {
        title: 'Breaking Gumi',
        src: 'media/loops/gumizoo-nanju-breaking-gumi.mp4',
        poster: 'media/posters/gumizoo-nanju-breaking-gumi.jpg',
        label: 'Breaking Gumi: a Breaking Bad parody with Nanju Jam’s head on a man in a desert, holding a gun',
      },
    },
    {
      slug: 'rana-ghee', name: 'Rana', surname: 'Ghee', trait: 'Boy-crazy.', accent: '#CF6C74', bg: '#1E4BC8',
      alt: 'Rana Ghee: a pink 3D gummy monkey head with purple hair, star eyes and a blue tongue, on blue',
      bio: 'Rana falls in love roughly every eleven minutes, usually with someone who hasn’t noticed her yet. Named after ghee because she melts fast, and often.',
      bioDraft: true,
      fragments: [
        { at: [0.58, 0.47], zoom: 10, shape: 'star' },
        { at: [0.49, 0.42], zoom: 10, shape: 'circle' },
        { at: [0.5, 0.65], zoom: 6, shape: 'circle' },
      ],
    },
  ],
};
