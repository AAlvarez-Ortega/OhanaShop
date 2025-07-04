// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Configura Supabase
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
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
