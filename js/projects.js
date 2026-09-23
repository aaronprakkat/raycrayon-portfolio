// film: YouTube or Vimeo URL once uploaded. Until then the player shows the hover loop.
// year / role / context: empty strings are hidden on the page.
const PROJECTS = [
  {
    slug: 'felines-01', group: 'felines', title: 'Feline #1', meta: 'House Cat', accent: '#FF7A6B', ratio: '9 / 16',
    loop: 'media/loops/felines-01.mp4', poster: 'media/posters/felines-01.jpg',
    alt: 'Feline #1: a glossy pink and blue 3D house cat on a coral background',
    film: '', year: '', role: '', context: 'Day one of a ten-day art challenge with @supersolarian.',
  },
  {
    slug: 'felines-02', group: 'felines', title: 'Feline #2', meta: 'Jaguar', accent: '#6EC8FF', ratio: '9 / 16',
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'felines-03', group: 'felines', title: 'Feline #3', meta: 'Cheetah', accent: '#C6F24E', ratio: '9 / 16',
    loop: 'media/loops/felines-03.mp4', poster: 'media/posters/felines-03.jpg',
    alt: 'Feline #3: a lime-green glossy 3D cheetah',
    film: '', year: '', role: '', context: 'Lemon flavour.',
  },
  {
    slug: 'felines-04', group: 'felines', title: 'Feline #4', meta: 'Lion', accent: '#FF6A1A', ratio: '9 / 16',
    loop: 'media/loops/felines-04.mp4', poster: 'media/posters/felines-04.jpg',
    alt: 'Feline #4: a red and orange 3D lion with a flame-shaped mane',
    film: '', year: '', role: '', context: 'Ketchup and mustard.',
  },
  {
    slug: 'felines-05', group: 'felines', title: 'Feline #5', meta: 'Lynx', accent: '#FF4FB8', ratio: '9 / 16',
    loop: 'media/loops/felines-05.mp4', poster: 'media/posters/felines-05.jpg',
    alt: 'Feline #5: a hot pink 3D lynx paw wrapped in a cobalt cage',
    film: '', year: '', role: '', context: 'Hot pink.',
  },
  {
    slug: 'felines-06', group: 'felines', title: 'Feline #6', meta: 'Ocelot', accent: '#16A6A0', ratio: '9 / 16',
    loop: 'media/loops/felines-06.mp4', poster: 'media/posters/felines-06.jpg',
    alt: 'Feline #6: a teal 3D ocelot with yellow and red splashes',
    film: '', year: '', role: '', context: '',
  },
  {
    slug: 'felines-07', group: 'felines', title: 'Feline #7', meta: 'Panther', accent: '#B38CFF', ratio: '9 / 16',
    loop: 'media/loops/felines-07.mp4', poster: 'media/posters/felines-07.jpg',
    alt: 'Feline #7: a lavender 3D panther curled around a spiked wheel',
    film: '', year: '', role: '', context: 'Lavender.',
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
