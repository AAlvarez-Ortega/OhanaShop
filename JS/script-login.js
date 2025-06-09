// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

  // Configura Supabase
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'TU_CLAVE_PUBLICA_ANON_AQUI'
  );

  // Validación de login con formulario (simulado por ahora)
  function validarLogin() {
    alert("Inicio de sesión simulado. Puedes conectar este formulario a backend más adelante.");
    return false;
  }

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
        redirectTo: window.location.origin + '/index.html'
      }
    });

    if (error) {
      console.error('Error al iniciar sesión con Google:', error.message);
      alert('Error al iniciar sesión con Google');
    }
  });

});
