// __tests__/TopRightMenu.test.jsx
// Verifica che il modulo si importi senza errori.
// Copia questo file in: __tests__/TopRightMenu.test.jsx

// Mappiamo l'import del client reale verso il mock
jest.mock("../app/lib/supabaseClient", () => require("../test/mocks/supabaseClient"));

describe("TopRightMenu module", () => {
  test("si importa correttamente", async () => {
    const mod = await import("../components/TopRightMenu");
    expect(mod).toBeDefined();
  });
});
