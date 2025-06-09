// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Configura Supabase
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTc5MTAsImV4cCI6MjA2NDkzMzkxMH0.OgVrVZ5-K0nwpFp3uLuT_iw-UNlLtlvuP2E97Gh9TAo'
  );

  // Agrega el listener al botón de Google
  const btnGoogle = document.getElementById('btn-google');
  if (!btnGoogle) {
    console.error('❌ No se encontró el botón de Google');
    return;
  }

  btnGoogle.addEventListener('click', async () => {
    const redirectUrl = 'https://aalvarez-ortega.github.io/OhanaShop/index.html';

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
