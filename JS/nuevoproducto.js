document.addEventListener('DOMContentLoaded', () => {
  const inputImg = document.getElementById('imagen');
  const preview = document.getElementById('preview');
  const form = document.getElementById('form-producto');
  const inputId = document.getElementById('id');

  // Si venimos del scaner, cargar ID desde localStorage
  const idEscaneado = localStorage.getItem('codigo_barras');
  if (idEscaneado) {
    inputId.value = idEscaneado;
  }

  inputImg.addEventListener('change', () => {
    const file = inputImg.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('🔧 Aquí se procesará el envío del nuevo producto a Supabase (por implementar).');
  });
});
