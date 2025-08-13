// __tests__/accessori.page.test.jsx
import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => require('../tests/mocks/nextNavigation.js'));
jest.mock('next/image', () => require('../tests/mocks/nextImage.js').default);
jest.mock('../app/lib/supabaseClient.js', () => require('../tests/mocks/supabaseClient.js'));

import AccessoriPage from '../app/accessori/page.js';

describe('/accessori (app/accessori/page.js)', () => {
  test('renderizza senza crash', async () => {
    let element;
    await act(async () => {
      element = await AccessoriPage();
    });
    const { container } = render(element);
    expect(container).toBeTruthy();
  });
});
