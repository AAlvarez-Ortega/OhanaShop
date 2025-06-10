const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-categoria');
  const inputNombre = document.getElementById('nombre');
  const mensaje = document.getElementById('mensaje');
  const lista = document.getElementById('lista-categorias');
  const btnSubmit = document.getElementById('btn-submit');

  let categoriaEditando = null;

  cargarCategorias();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (!nombre) return;

    if (categoriaEditando) {
      // Editar existente
      const { error } = await supabase
        .from('categorias')
        .update({ nombre })
        .eq('id', categoriaEditando);

      if (error) {
        mensaje.textContent = "❌ Error al actualizar";
      } else {
        mensaje.textContent = "✅ Categoría actualizada";
        categoriaEditando = null;
        btnSubmit.textContent = "Guardar";
        form.reset();
        cargarCategorias();
      }
    } else {
      // Crear nueva
      const { error } = await supabase.from('categorias').insert([{ nombre }]);
      if (error) {
        mensaje.textContent = "❌ Error al guardar";
      } else {
        mensaje.textContent = "✅ Categoría agregada";
        form.reset();
        cargarCategorias();
      }
    }
  });

  async function cargarCategorias() {
    const { data: categorias, error } = await supabase.from('categorias').select('*').order('nombre', { ascending: true });

    if (error) {
      mensaje.textContent = "❌ Error al cargar categorías";
      return;
    }

    lista.innerHTML = '';
    categorias.forEach(cat => {
      const li = document.createElement('li');

      const input = document.createElement('input');
      input.type = 'text';
      input.value = cat.nombre;
      input.disabled = true;

      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.addEventListener('click', () => {
        inputNombre.value = cat.nombre;
        categoriaEditando = cat.id;
        btnSubmit.textContent = "Actualizar";
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      li.appendChild(input);
      li.appendChild(btnEditar);
      lista.appendChild(li);
    });
  }
});
