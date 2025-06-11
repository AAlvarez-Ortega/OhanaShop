import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

export async function obtenerUsuarioActivo() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    nombre: data.user.user_metadata?.name || 'Usuario',
    email: data.user.email,
    foto: data.user.user_metadata?.avatar_url || null,
    rol: data.user.user_metadata?.rol || 'cliente'
  };
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.reload();
}
