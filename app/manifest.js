export default function manifest() {
  return {
    name: 'G-R Gabriella Romeo',
    short_name: 'G-R',
    description: 'Luxury fashion, jewelry and events by Gabriella Romeo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    lang: 'it',
    icons: [
      {
        src: '/hero.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
