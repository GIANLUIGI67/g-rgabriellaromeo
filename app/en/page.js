'use client';
import Link from 'next/link';
import Image from 'next/image';
import CategoryButtons from '../../components/CategoryButtons';

export default function EnglishPage() {
  return (
    <main style={{ 
      textAlign: 'center', 
      padding: '2rem', 
      backgroundColor: 'black', 
      minHeight: '100vh', 
      color: 'white', 
      position: 'relative' 
    }}>
      
      {/* Back to Home Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000 
      }}>
        <Link href="/" style={{ color: 'white', fontSize: '2rem', textDecoration: 'none' }}>
          ←
        </Link>
      </div>

      {/* Hero Image */}
      <div style={{ marginBottom: '2rem' }}>
        <Image 
          src="/hero.png" 
          alt="G-R Gabriella Romeo Logo" 
          width={800} 
          height={500} 
          priority 
          style={{ margin: 'auto', display: 'block' }}
        />
      </div>

      {/* Category Buttons */}
      <div style={{ marginBottom: '2rem' }}>
        <CategoryButtons lang="en" />
      </div>

    </main>
  );
}
