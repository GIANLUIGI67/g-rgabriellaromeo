create or replace function public.sync_cliente_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  signup_discount numeric := case
    when nullif(trim(coalesce(meta->>'primo_sconto', '')), '') is null then 10
    else (meta->>'primo_sconto')::numeric
  end;
begin
  insert into public.clienti (
    user_id,
    email,
    nome,
    cognome,
    telefono1,
    telefono2,
    indirizzo,
    citta,
    paese,
    codice_postale,
    ordini,
    created_at,
    updated_at,
    primo_sconto,
    nuovo_sconto,
    is_guest
  )
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(meta->>'nome', '')), ''),
    nullif(trim(coalesce(meta->>'cognome', '')), ''),
    nullif(trim(coalesce(meta->>'telefono1', '')), ''),
    nullif(trim(coalesce(meta->>'telefono2', '')), ''),
    nullif(trim(coalesce(meta->>'indirizzo', '')), ''),
    nullif(trim(coalesce(meta->>'citta', '')), ''),
    nullif(trim(coalesce(meta->>'paese', '')), ''),
    nullif(trim(coalesce(meta->>'codice_postale', '')), ''),
    '[]'::jsonb,
    now(),
    now(),
    signup_discount,
    nullif(trim(coalesce(meta->>'nuovo_sconto', '')), ''),
    false
  )
  on conflict (email) do update
  set
    user_id = excluded.user_id,
    nome = coalesce(excluded.nome, clienti.nome),
    cognome = coalesce(excluded.cognome, clienti.cognome),
    telefono1 = coalesce(excluded.telefono1, clienti.telefono1),
    telefono2 = coalesce(excluded.telefono2, clienti.telefono2),
    indirizzo = coalesce(excluded.indirizzo, clienti.indirizzo),
    citta = coalesce(excluded.citta, clienti.citta),
    paese = coalesce(excluded.paese, clienti.paese),
    codice_postale = coalesce(excluded.codice_postale, clienti.codice_postale),
    updated_at = now(),
    primo_sconto = coalesce(clienti.primo_sconto, excluded.primo_sconto),
    nuovo_sconto = coalesce(excluded.nuovo_sconto, clienti.nuovo_sconto),
    is_guest = false;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_sync_cliente on auth.users;

create trigger on_auth_user_created_sync_cliente
after insert on auth.users
for each row
execute function public.sync_cliente_from_auth_user();

insert into public.clienti (
  user_id,
  email,
  nome,
  cognome,
  telefono1,
  telefono2,
  indirizzo,
  citta,
  paese,
  codice_postale,
  ordini,
  created_at,
  updated_at,
  primo_sconto,
  nuovo_sconto,
  is_guest
)
select
  u.id,
  u.email,
  nullif(trim(coalesce(u.raw_user_meta_data->>'nome', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'cognome', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'telefono1', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'telefono2', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'indirizzo', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'citta', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'paese', '')), ''),
  nullif(trim(coalesce(u.raw_user_meta_data->>'codice_postale', '')), ''),
  '[]'::jsonb,
  now(),
  now(),
  case
    when nullif(trim(coalesce(u.raw_user_meta_data->>'primo_sconto', '')), '') is null then 10
    else (u.raw_user_meta_data->>'primo_sconto')::numeric
  end,
  nullif(trim(coalesce(u.raw_user_meta_data->>'nuovo_sconto', '')), ''),
  false
from auth.users u
left join public.clienti c on c.email = u.email
where c.email is null
  and u.email is not null;
