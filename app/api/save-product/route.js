import { supabase } from '../../lib/supabaseClient';


export async function POST(request) {
  try {
    const prodotto = await request.json();

    const result = await supabase
  .from('products')
  .insert([prodotto]);

if (result.error) {
  console.error('❌ ERRORE SUPABASE:', result.error);
  return new Response(JSON.stringify({
    error: result.error.message || 'Errore sconosciuto da Supabase'
  }), {
    status: 500,
  });
}

return new Response(JSON.stringify({ message: 'Prodotto salvato con successo' }), {
  status: 200,
});
    return new Response(JSON.stringify({ error: error.message || 'Errore generico su Supabase' }), {
  status: 500,
    });    
  } catch (error) {
    console.error('❌ ERRORE DA SUPABASE:', error); // <--- STAMPA NEL TERMINALE
    return new Response(JSON.stringify({
      error: error?.message || JSON.stringify(error) || 'Errore generico su Supabase'
    }), {
      status: 500,
    });
  }  
}
