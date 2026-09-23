// film: YouTube or Vimeo URL once uploaded. Until then the player shows the hover loop.
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
    slug: 'gumizoo', group: 'gumizoo', title: 'Gumizoo', meta: 'Characters', accent: '#86B83A', ratio: '9 / 16',
    still: 'media/stills/gumizoo.webp',
    alt: 'Gumizoo poster: a green gummy character behind pink “Gumi Zoo” lettering',
    film: '', year: '', role: '', context: 'A collection of gummy characters: Ashik Rancher, Gia Tangerine, Nanju Jam and Rana Ghee.',
  },
  {
    slug: 'pangeo-pride', group: 'pangeo', title: 'Pride', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-pride.mp4', poster: 'media/posters/pangeo-pride.jpg',
    alt: 'Pride: collaged bands of a sunlit god, chameleons, fish and palms across a classical arcade',
    film: '', year: '', role: 'Projection mapping artist', context: 'Season One Inc.',
  },
  {
    slug: 'pangeo-lust', group: 'pangeo', title: 'Lust', meta: 'Pangeo', accent: '#FF3DAC', ratio: '16 / 9',
    loop: 'media/loops/pangeo-lust.mp4', poster: 'media/posters/pangeo-lust.jpg',
    alt: 'Lust: a pineapple shrine framed by snakes and fluted columns in violet light',
    film: '', year: '', role: 'Projection mapping artist', context: 'Season One Inc.',
  },
  {
    slug: 'mystery-shack', group: 'mystery-shack', title: 'Mystery Shack', meta: 'Tribute', accent: '#FF5C2B', ratio: '16 / 9',
    film: '', year: '', role: '', context: 'A tribute to Gravity Falls.',
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
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'asterisk', group: 'client', title: 'ASTERISK', meta: '2026', accent: '#3154FF', ratio: '4 / 5',
    film: '', year: '2026', role: '3D artist', context: '3D-printed accessories for footwear: modelling, refinement and print feasibility.',
  },
  {
    slug: '70emg', group: 'client', title: '70EMG', meta: '2025', accent: '#B8FF38', ratio: '4 / 5',
    loop: 'media/loops/70emg-animation.mp4', poster: 'media/posters/70emg-animation.jpg',
    alt: '70EMG: a red wireframe structure glowing against a dark red background',
    film: '', year: '2025', role: 'Junior visual intern', context: 'Visual and video content for events and social media.',
  },
  {
    slug: 'funk-house', group: 'client', title: 'Funk House Media', meta: '2024', accent: '#26E1DD', ratio: '4 / 5',
    film: '', year: '2024', role: 'Junior video editor', context: 'Promotional videos for social media and ad campaigns.',
  },
];
