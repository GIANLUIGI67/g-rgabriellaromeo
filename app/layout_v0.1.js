import './globals.css';
export const metadata = {
  title: 'G-R Gabriella Romeo',
  description: 'Luxury Fashion and Jewelry',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: 'black', minHeight: '100vh', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
