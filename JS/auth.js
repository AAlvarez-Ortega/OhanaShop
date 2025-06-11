import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

export async function obtenerUsuarioActivo() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const email = data.user.email;

  // 🔎 Buscar datos reales desde tu tabla personalizada 'usuarios'
  const { data: usuario, error: errorUsuario } = await supabase
    .from('usuarios')
    .select('nombre, email, rol, foto')
    .eq('email', email)
    .single();

  if (errorUsuario || !usuario) return null;

  return {
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    foto: usuario.foto
  };
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.reload();
}
