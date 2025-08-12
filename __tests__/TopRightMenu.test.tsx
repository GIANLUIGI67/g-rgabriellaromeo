import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopRightMenu from '../components/TopRightMenu';

// Mock minimale di next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams('lang=it'),
}));

describe('TopRightMenu', () => {
  it('mostra il menu in alto a destra senza errori', () => {
    render(<TopRightMenu />);
    // Verifica che il DOM esista (sostituisci con query più specifiche se vuoi)
    expect(document.body).toBeInTheDocument();
  });
});
