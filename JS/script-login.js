// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Configura Supabase
  const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
);

  // Detectar entorno y definir redirección
  const redirectUrl = location.hostname === 'localhost'
    ? 'http://localhost:3000/index.html'
    : 'https://aalvarez-ortega.github.io/OhanaShop/index.html';

  // Agrega el listener al botón de Google
  const btnGoogle = document.getElementById('btn-google');
  if (!btnGoogle) {
    console.error('❌ No se encontró el botón de Google');
    return;
  }

  btnGoogle.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Error al iniciar sesión con Google:', error.message);
      alert('Error al iniciar sesión con Google');
    }
  });

});
