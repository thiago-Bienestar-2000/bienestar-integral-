// ============================================================
// Configuración de Supabase — Bienestar Integral
// ============================================================
// Estos dos valores son la URL de tu proyecto y la clave pública
// "anon" de Supabase. NO son secretos: están pensadas para vivir
// en el código del navegador. La seguridad real la da la
// Seguridad a Nivel de Fila (Row Level Security / RLS) que se
// configura en la base de datos (ver supabase/schema.sql).
//
// Reemplazá los dos valores de abajo por los de tu proyecto:
// Supabase Dashboard → Project Settings → API
//   - "Project URL"          → SUPABASE_URL
//   - "anon public" API key  → SUPABASE_ANON_KEY
//
// NUNCA pegues acá la clave "service_role": esa sí es secreta
// y no se usa en ningún archivo de este proyecto.
// ============================================================

const SUPABASE_URL = "https://bydtgsdcymdbezwbouwk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_kEtI1yQ0ki00nRwwHlzPWw_2t-7o_VW";

window.sb = (SUPABASE_URL.includes("TU-PROYECTO"))
  ? null
  : supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (!window.sb) {
  console.warn(
    "Bienestar Integral: falta configurar Supabase en js/supabase-config.js " +
    "(SUPABASE_URL y SUPABASE_ANON_KEY). El formulario de testimonios no " +
    "funcionará hasta que se complete esta configuración."
  );
}
