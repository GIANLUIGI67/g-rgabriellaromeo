// app/lib/formatEuro.js

export const formatEuro = (val) => {
    const value = Number(val || 0);
    return `\u20AC ${value.toFixed(2)}`; // Simbolo euro Unicode garantito
  };
  