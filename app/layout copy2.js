import { Michroma } from 'next/font/google';
import './globals.css';


const michroma = Michroma({ subsets: ['latin'], weight: ['400'] });


export const metadata = {
  title: 'G-R Gabriella Romeo',
  description: 'Luxury Fashion and Jewelry',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      {/* Applica il font a tutto il sito qui */}
      <body className={michroma.className} style={{ backgroundColor: 'black', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
