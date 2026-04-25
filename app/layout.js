import './globals.css';
import { Michroma } from 'next/font/google';

const michroma = Michroma({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'G-R Gabriella Romeo',
  description: 'Luxury Fashion and Jewelry',
  manifest: '/manifest.webmanifest',
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
