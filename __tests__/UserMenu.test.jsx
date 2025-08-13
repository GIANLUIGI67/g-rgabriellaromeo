// __tests__/UserMenu.test.jsx
// Verifica che il modulo si importi e che il mock auth sia disponibile.

jest.mock("../app/lib/supabaseClient", () => require("../test/mocks/supabaseClient"));

describe("UserMenu module", () => {
  test("si importa correttamente", async () => {
    const mod = await import("../components/UserMenu");
    expect(mod).toBeDefined();
  });

  test("mock supabase.auth.getUser restituisce un utente", async () => {
    const { supabase } = require("../test/mocks/supabaseClient");
    const { data } = await supabase.auth.getUser();
    expect(data.user).toBeTruthy();
    expect(data.user.email).toBe("demo@example.com");
  });
});
