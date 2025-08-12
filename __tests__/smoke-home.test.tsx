import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock router + search params per App Router in JSDOM
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams('lang=it'),
}));

// Mock supabase (nuovo percorso fuori da __tests__)
jest.mock('../app/lib/supabaseClient', () => require('../test/mocks/supabaseClient'));
jest.mock('@/app/lib/supabaseClient', () => require('../test/mocks/supabaseClient'));

import HomePage from '../app/page';

describe('Home page', () => {
  it('renderizza senza crash', () => {
    const { container } = render(<HomePage />);
    expect(container).toBeTruthy();
  });
});
