import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.87.1';


export const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
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
