import './globals.css';
import { Michroma } from 'next/font/google';
import { getSiteUrl } from './lib/siteUrl';

const michroma = Michroma({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

const siteUrl = getSiteUrl();

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'G-R Gabriella Romeo',
  description: 'Luxury Fashion and Jewelry',
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'G-R Gabriella Romeo',
    description: 'Luxury Fashion and Jewelry',
    url: siteUrl,
    siteName: 'G-R Gabriella Romeo',
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'G-R Gabriella Romeo',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={michroma.className} style={{ backgroundColor: 'black', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
