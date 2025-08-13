// __tests__/supabaseQueries.test.jsx
// Esegue chiamate tipiche (select/eq/single/insert) sul mock per verificare il wiring.

jest.mock("../app/lib/supabaseClient", () => require("../test/mocks/supabaseClient"));

describe("Supabase mock - query base", () => {
  test("select su 'products' ritorna dati", async () => {
    const { supabase } = require("../test/mocks/supabaseClient");
    const { data, error } = await supabase.from("products").select();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test("eq + single recupera un record per id", async () => {
    const { supabase } = require("../test/mocks/supabaseClient");
    const { data, error } = await supabase.from("products").select().eq("id", 1).single();
    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data.name).toBe("Anello");
  });

  test("insert aggiunge un record", async () => {
    const { supabase } = require("../test/mocks/supabaseClient");
    const toAdd = { id: 3, name: "Bracciale", price: 59 };
    const { data, error } = await supabase.from("products").insert(toAdd);
    expect(error).toBeNull();
    expect(data[0].name).toBe("Bracciale");

    // Verifica che ora esista
    const after = await supabase.from("products").select().eq("id", 3).single();
    expect(after.data?.name).toBe("Bracciale");
  });
});
