// tests/mocks/nextNavigation.js
// Mock di next/navigation per evitare errori con useRouter, redirect, ecc.

export const useRouter = () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  });
  
  export const usePathname = () => '/';
  export const useSearchParams = () => new URLSearchParams();
  export const notFound = () => {};
  export const redirect = () => {};
  