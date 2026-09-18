-- ============================================================
-- Bienestar Integral — esquema de testimonios
-- Ejecutar una sola vez en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Tabla de testimonios
create table if not exists public.testimonios (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null check (char_length(trim(nombre)) between 1 and 80),
  texto      text not null check (char_length(trim(texto)) between 1 and 600),
  estrellas  smallint not null check (estrellas between 1 and 5),
  estado     text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  fecha      timestamptz not null default now()
);

-- 2) Activar Row Level Security (RLS)
-- A partir de acá, nadie puede leer/escribir en la tabla salvo que
-- exista una política explícita que lo permita.
alter table public.testimonios enable row level security;

-- 3) Cualquier visitante (rol "anon") puede insertar un testimonio,
--    pero SIEMPRE queda con estado "pendiente" (no puede publicarlo
--    directamente ni auto-aprobarse).
create policy "Visitantes insertan como pendiente"
  on public.testimonios
  for insert
  to anon
  with check (estado = 'pendiente');

-- 4) Cualquier visitante puede leer únicamente los testimonios
--    que ya fueron aprobados.
create policy "Visitantes leen solo aprobados"
  on public.testimonios
  for select
  to anon
  using (estado = 'aprobado');

-- 5) Un usuario autenticado (Josefina, vía Supabase Auth) puede
--    leer todos los testimonios, sin importar su estado.
create policy "Admin lee todos los testimonios"
  on public.testimonios
  for select
  to authenticated
  using (true);

-- 6) Un usuario autenticado puede aprobar/rechazar (actualizar el estado).
create policy "Admin actualiza estado"
  on public.testimonios
  for update
  to authenticated
  using (true)
  with check (true);

-- 7) Un usuario autenticado puede eliminar un testimonio publicado.
create policy "Admin elimina testimonios"
  on public.testimonios
  for delete
  to authenticated
  using (true);

-- ============================================================
-- Con esto la tabla queda lista. Los pasos que faltan (crear el
-- usuario administrador y copiar las claves del proyecto) están
-- detallados en README.md, sección "Configurar Supabase".
-- ============================================================
