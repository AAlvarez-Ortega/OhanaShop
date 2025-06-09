document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
  );

  const idInput = document.getElementById('input-id');
  const nombreInput = document.getElementById('input-nombre');
  const descripcionInput = document.getElementById('input-descripcion');
  const piezasInput = document.getElementById('input-piezas');
  const compraInput = document.getElementById('input-compra');
  const ventaInput = document.getElementById('input-venta');
  const categoriaSelect = document.getElementById('select-categoria');
  const imgInput = document.getElementById('input-img');
  const previewImg = document.getElementById('preview-img');
  const form = document.getElementById('form-producto');

  // Mostrar código escaneado
  const codigo = localStorage.getItem('codigo_barras');
  if (codigo) {
    idInput.value = codigo;
  }

  // Cargar categorías desde Supabase
  const { data: categorias, error: errorCat } = await supabase.from('categorias').select('*');
  if (errorCat) {
    alert('Error cargando categorías');
  } else {
    categorias.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      categoriaSelect.appendChild(opt);
    });
  }

  // Vista previa imagen
  imgInput.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (file) {
      previewImg.src = URL.createObjectURL(file);
      previewImg.style.display = 'block';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = imgInput.files[0];
    if (!file) return alert('Sube una imagen');

    const ext = file.name.split('.').pop();
    const imgPath = `${Date.now()}.${ext}`;
    const { error: imgError } = await supabase.storage
      .from('productos')
      .upload(imgPath, file, { upsert: true });

    if (imgError) {
      alert('Error subiendo imagen');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    const { data: imgUrlData } = supabase.storage
      .from('productos')
      .getPublicUrl(imgPath);

    const producto = {
      id: idInput.value.trim(),
      nombre: nombreInput.value.trim(),
      descripcion: descripcionInput.value.trim(),
      piezas: parseInt(piezasInput.value),
      precio_compra: parseFloat(compraInput.value),
      precio_venta: parseFloat(ventaInput.value),
      categoria_id: categoriaSelect.value,
      imagen_url: imgUrlData.publicUrl,
      creado_por: userId,
      fecha_creacion: new Date().toISOString()
    };

    const { error: insertError } = await supabase.from('productos').insert([producto]);

    if (insertError) {
      alert('Error al guardar el producto');
      console.error(insertError);
    } else {
      alert('Producto registrado correctamente');
      window.location.href = 'index.html';
    }
  });
});
