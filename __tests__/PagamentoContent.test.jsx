/**
 * __tests__/PagamentoContent.test.jsx
 * Test "smoke" + interazione essenziale per PagamentoContent.
 *
 * Assunzioni (robuste ma generiche):
 * - Il componente è esportato da: app/pagamento/PagamentoContent.js
 * - Espone opzionalmente dei data-testid:
 *     - data-testid="shipping-option-<id>"
 *     - data-testid="payment-option-<id>"
 *     - data-testid="confirm-order"
 *   Se non li hai, il test cliccherà comunque il primo radio di spedizione/pagamento
 *   e il primo bottone che include “Paga” / “Conferma”.
 */

import React from "react";
import { render, screen, within, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  buildCart,
  shippingMethods,
  paymentMethods,
  buildOrderPayload,
  mockRouter,
  calcTotal,
} from "../test/mocks/pagamentoContent.mocks";

// --- MOCK: next/navigation (App Router) ---
jest.mock("next/navigation", () => {
  const real = jest.requireActual("next/navigation");
  return {
    ...real,
    useRouter: () => global.__TEST_ROUTER__.router,
  };
});

// --- MOCK: supabase client (se lo importi nel componente) ---
jest.mock("../app/lib/supabaseClient.js", () => {
  const cliente = {
    email: "mario@example.com",
    nome: "Mario Rossi",
    primo_sconto: null,
  };

  return {
    __esModule: true,
    supabase: {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              access_token: "test-token",
              user: { email: cliente.email },
            },
          },
          error: null,
        }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: cliente, error: null }),
          }),
        }),
      }),
    },
  };
});

// --- MOCK: fetch verso le tue API (/api/save-ordini, /api/fattura, ...) ---
const okJson = (data) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
beforeEach(() => {
  localStorage.setItem(
    "carrello",
    JSON.stringify([{ id: "sku-1", nome: "Collana", prezzo: 10, quantita: 1 }])
  );
  global.fetch = jest.fn((url, opts) => {
    if (url.includes("/api/checkout/quote")) {
      return okJson({
        quote: {
          subtotal: 10,
          discountAmount: 0,
          shippingAmount: 5,
          total: 15,
          productionPolicyRequired: false,
          productionItems: [],
        },
      });
    }
    if (url.includes("/api/checkout/finalize")) {
      return okJson({ orderId: "ord-123" });
    }
    if (url.includes("/api/fattura")) {
      return okJson({ invoice: "inv-999" });
    }
    if (url.includes("/api/email")) {
      return okJson({ sent: true });
    }
    return okJson({});
  });
});

afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// Import del componente sotto test
// NB: Percorso previsto -> app/pagamento/PagamentoContent.js
// Se il file ha un nome diverso, aggiorna SOLO la riga sottostante.
import PagamentoContent from "../app/pagamento/PagamentoContent";

// Helpers “robusti” per trovare controlli anche senza testid
const pickFirstRadioIn = (root) => {
  const radios = within(root).getAllByRole("radio");
  fireEvent.click(radios[0]);
};

const pickFirstButtonByLabel = (labels = ["Paga", "Conferma", "Procedi"]) => {
  for (const text of labels) {
    const btn = screen.queryByRole("button", { name: new RegExp(text, "i") });
    if (btn) return btn;
  }
  // fallback: primo button qualunque
  return screen.getAllByRole("button")[0];
};

describe("PagamentoContent", () => {
  test("render smoke: non crasha e mostra qualcosa di significativo", () => {
    global.__TEST_ROUTER__ = mockRouter();

    const cart = buildCart();
    render(
      <PagamentoContent
        cart={cart}
        shippingOptions={shippingMethods}
        paymentOptions={paymentMethods}
        customer={{ name: "Mario Rossi", email: "mario@example.com" }}
      />
    );

    // Almeno uno tra questi dovrebbe esserci in ogni versione ragionevole
    expect(
      screen.queryByText(/spedizione|shipping|consegna/i)
      || screen.queryByText(/pagamento|payment/i)
      || screen.queryByText(/totale|total/i)
    ).toBeInTheDocument();
  });

  test("selezione metodi + conferma bonifico invia l'ordine e fa push alla pagina di conferma", async () => {
    const { router, pushes } = (global.__TEST_ROUTER__ = mockRouter());

    render(
      <PagamentoContent
        lang="it"
        cart={buildCart()}
        shippingOptions={shippingMethods}
        paymentOptions={paymentMethods}
        customer={{ name: "Mario Rossi", email: "mario@example.com" }}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText(/caricamento/i)).not.toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/metodo di spedizione/i), {
      target: { value: "standard" },
    });
    fireEvent.change(screen.getByLabelText(/metodo di pagamento/i), {
      target: { value: "bonifico" },
    });

    fireEvent.click(screen.getByLabelText(/rivedi termini/i));
    fireEvent.click(screen.getByLabelText(/bonifico è stato effettuato/i));

    const confirmBtn = screen.getByRole("button", { name: /conferma bonifico/i });

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/checkout\/finalize/),
        expect.objectContaining({ method: "POST" })
      );
    });

    // spinta verso la pagina di conferma (percorso tipico)
    const pushed = pushes.join(" | ");
    expect(pushed).toMatch(/ordine-confermato/i);
    expect(localStorage.getItem("ordineId")).toBe("ord-123");
  });

  test("calcolo totale include spedizione", () => {
    const cart = buildCart({
      items: [{ id: "sku-x", name: "Bracciale", qty: 1, price: 10 }],
    });
    const totStd = calcTotal(cart, shippingMethods[0]); // 10 + 4.9 = 14.9
    const totExp = calcTotal(cart, shippingMethods[1]); // 10 + 8.9 = 18.9
    expect(totStd).toBe(14.9);
    expect(totExp).toBe(18.9);
  });
});
