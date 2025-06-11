// JS/auth.js

const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

export async function obtenerUsuarioActivo() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return error ? null : usuario;
}

export async function cerrarSesion() {
  await supabase.auth.signOut();
  location.reload();
}

export { supabase };
