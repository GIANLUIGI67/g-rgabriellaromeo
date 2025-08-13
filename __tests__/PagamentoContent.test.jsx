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
} from "../mocks/pagamentoContent.mocks";

// --- MOCK: next/navigation (App Router) ---
jest.mock("next/navigation", () => {
  const real = jest.requireActual("next/navigation");
  return {
    ...real,
    useRouter: () => global.__TEST_ROUTER__.router,
  };
});

// --- MOCK: supabase client (se lo importi nel componente) ---
jest.mock("../../app/lib/supabaseClient.js", () => {
  return {
    __esModule: true,
    default: {
      auth: {
        getSession: async () => ({ data: { session: null } }),
      },
    },
  };
});

// --- MOCK: fetch verso le tue API (/api/save-ordini, /api/fattura, ...) ---
const okJson = (data) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
beforeEach(() => {
  global.fetch = jest.fn((url, opts) => {
    if (url.includes("/api/save-ordini")) {
      return okJson({ id: "ord-123" });
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
});

// Import del componente sotto test
// NB: Percorso previsto -> app/pagamento/PagamentoContent.js
// Se il file ha un nome diverso, aggiorna SOLO la riga sottostante.
import PagamentoContent from "../../app/pagamento/PagamentoContent";

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

  test("selezione metodi + conferma invia l'ordine e fa push alla pagina di conferma", async () => {
    const { router, pushes } = (global.__TEST_ROUTER__ = mockRouter());

    const cart = buildCart();
    const shipping = shippingMethods[1]; // espressa
    const payment = paymentMethods[0];   // carta

    render(
      <PagamentoContent
        cart={cart}
        shippingOptions={shippingMethods}
        paymentOptions={paymentMethods}
        customer={{ name: "Mario Rossi", email: "mario@example.com" }}
      />
    );

    // Proviamo prima con i data-testid "consigliati"
    const shippingEl =
      screen.queryByTestId(`shipping-option-${shipping.id}`) ||
      screen.getByRole("radiogroup", { name: /spedizione|shipping/i });

    if (shippingEl.getAttribute?.("data-testid")) {
      fireEvent.click(shippingEl);
    } else {
      // fallback: seleziona il primo radio dentro al radiogroup
      pickFirstRadioIn(shippingEl);
    }

    const paymentEl =
      screen.queryByTestId(`payment-option-${payment.id}`) ||
      screen.getByRole("radiogroup", { name: /pagamento|payment/i });

    if (paymentEl.getAttribute?.("data-testid")) {
      fireEvent.click(paymentEl);
    } else {
      pickFirstRadioIn(paymentEl);
    }

    const confirmBtn =
      screen.queryByTestId("confirm-order") || pickFirstButtonByLabel();

    fireEvent.click(confirmBtn);

    await waitFor(() => {
      // chiamata all'endpoint principale di salvataggio ordine
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/save-ordini/),
        expect.objectContaining({ method: "POST" })
      );
    });

    // spinta verso la pagina di conferma (percorso tipico)
    const pushed = pushes.join(" | ");
    expect(pushed).toMatch(/ordine-confermato/i);
    expect(pushed).toMatch(/ord-123/); // id mockato
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
