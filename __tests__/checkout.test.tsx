import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock router + search params
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams('lang=it'),
}));

// Mock supabase (nuovo percorso)
jest.mock('../app/lib/supabaseClient', () => require('../test/mocks/supabaseClient'));
jest.mock('@/app/lib/supabaseClient', () => require('../test/mocks/supabaseClient'));

// Se la pagina importa un PaypalButton che usa window/SDK, stubbiamo per sicurezza
jest.mock('../components/PaypalButton', () => () => <div data-testid="paypal-button" />);

import CheckoutPage from '../app/checkout/page';

describe('Checkout page', () => {
  it('renderizza senza crash', () => {
    const { container } = render(<CheckoutPage />);
    expect(container).toBeTruthy();
  });
});
