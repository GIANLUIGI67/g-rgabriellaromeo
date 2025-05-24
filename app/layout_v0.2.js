import './globals.css';
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata = {
  title: 'G-R Gabriella Romeo',
  description: 'Luxury Fashion and Jewelry',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={orbitron.className}
        style={{ backgroundColor: 'black', minHeight: '100vh', margin: 0 }}
      >
        {children}
      </body>
    </html>
  );
}
