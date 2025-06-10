const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-categoria');
  const inputNombre = document.getElementById('nombre');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();

    if (!nombre) {
      mensaje.textContent = "El nombre no puede estar vacío.";
      return;
    }

    const { error } = await supabase
      .from('categorias')
      .insert([{ nombre }]);

    if (error) {
      mensaje.textContent = "❌ Error al guardar: " + error.message;
    } else {
      mensaje.textContent = "✅ Categoría guardada exitosamente.";
      form.reset();
    }
  });
});
