// Mock Supabase client usato nei componenti
export const supabase = {
    auth: {
      getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
      signInWithPassword: jest.fn(async ({ email, password }) => {
        // finto login ok se email include "@"
        if (email && email.includes('@') && password) {
          return { data: { user: { id: 'user_1', email } }, error: null };
        }
        return { data: { user: null }, error: new Error('Invalid login credentials') };
      }),
      signOut: jest.fn(async () => ({ error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: [{ id: 'row_1' }], error: null }),
      update: jest.fn().mockResolvedValue({ data: [{ id: 'row_1' }], error: null }),
      delete: jest.fn().mockResolvedValue({ data: [], error: null }),
      eq: jest.fn().mockReturnThis(),
    })),
  };
  