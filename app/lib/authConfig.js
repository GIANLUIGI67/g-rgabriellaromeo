export const protectedRoutes = {
    '/carrello': true,
    '/checkout': true,
    '/ordini': true,
    '/lista-desideri': true,
    '/account': true,
    '/pagamento': true
  };
  
  export const semiProtectedRoutes = {
    '/checkout': { requireAuth: true, redirectIfGuest: true },
    '/pagamento': { requireAuth: true, redirectIfGuest: true }
  };
  
  export const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 ore