// test/mocks/supabaseClient.js
// Mock minimale ma utile del client Supabase usato nei componenti.
// Copia questo file in: test/mocks/supabaseClient.js

const _db = {
  products: [
    { id: 1, name: "Anello", price: 99 },
    { id: 2, name: "Collana", price: 149 },
  ],
  users: [
    { id: "u1", email: "demo@example.com" }
  ],
};

// QueryBuilder finto con una mini pipeline tipo supabase
function makeQuery(table) {
  let rows = Array.isArray(_db[table]) ? [..._db[table]] : [];

  const api = {
    select() {
      return Promise.resolve({ data: rows, error: null });
    },
    insert(payload) {
      const toInsert = Array.isArray(payload) ? payload : [payload];
      _db[table] = [...rows, ...toInsert];
      return Promise.resolve({ data: toInsert, error: null });
    },
    update(patch) {
      // Applichiamo la update in maniera semplicissima
      rows = rows.map((r) => ({ ...r, ...patch }));
      _db[table] = rows;
      return Promise.resolve({ data: rows, error: null });
    },
    eq(field, value) {
      rows = rows.filter((r) => r?.[field] === value);
      return api;
    },
    single() {
      const first = rows[0] ?? null;
      return Promise.resolve({ data: first, error: null });
    },
  };

  return api;
}

const auth = {
  getUser: () =>
    Promise.resolve({ data: { user: _db.users[0] }, error: null }),
  signInWithPassword: async ({ email }) => {
    const user = _db.users.find((u) => u.email === email) || null;
    return { data: { user }, error: null };
  },
  signOut: async () => ({ error: null }),
};

const storage = {
  from: () => ({
    upload: async () => ({ data: { path: "uploads/fake.png" }, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: "/uploads/fake.png" }, error: null }),
  }),
};

const functions = { invoke: async () => ({ data: {}, error: null }) };

// Questo è ciò che molti file del progetto importano come "supabase"
const supabase = {
  from: (table) => makeQuery(table),
  auth,
  storage,
  functions,
};

// Esportazione compatibile con "import { supabase } from 'app/lib/supabaseClient'"
module.exports = { supabase };
