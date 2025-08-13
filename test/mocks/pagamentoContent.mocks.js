// mocks/pagamentoContent.mocks.js

// Cart/fake-data helpers
export const buildCart = (overrides = {}) => ({
    items: [
      { id: "sku-1", name: "Collana", qty: 1, price: 59.9 },
      { id: "sku-2", name: "Anello", qty: 2, price: 29.9 },
    ],
    currency: "EUR",
    ...overrides,
  });
  
  export const shippingMethods = [
    { id: "std", label: "Standard", price: 4.9 },
    { id: "exp", label: "Espressa", price: 8.9 },
  ];
  
  export const paymentMethods = [
    { id: "card", label: "Carta" },
    { id: "cod", label: "Contrassegno" },
  ];
  
  export const buildOrderPayload = ({
    cart = buildCart(),
    shipping = shippingMethods[0],
    payment = paymentMethods[0],
    customer = { name: "Mario Rossi", email: "mario@example.com" },
  } = {}) => ({
    cart,
    shipping,
    payment,
    customer,
  });
  
  // Router mock (Next.js App Router)
  export const mockRouter = () => {
    const pushes = [];
    return {
      pushes,
      router: {
        push: (href) => pushes.push(href),
        replace: (href) => pushes.push(`replace:${href}`),
        back: () => pushes.push("back"),
        prefetch: () => Promise.resolve(),
      },
    };
  };
  
  // Simple utility: total
  export const calcTotal = (cart, shipping) => {
    const items = cart.items ?? [];
    const sum = items.reduce((acc, it) => acc + (it.price * it.qty), 0);
    return +(sum + (shipping?.price ?? 0)).toFixed(2);
  };
  