document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(

  'https://qybynnifyuvbuacanlaa.supabase.co',
  'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
  );

  // Elementos del formulario
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

  // Cargar código escaneado desde localStorage
  const codigo = localStorage.getItem('codigo_barras');
  if (codigo) idInput.value = codigo;

  // Cargar categorías
  const { data: categorias, error: catError } = await supabase
    .from('categorias')
    .select('*');

  if (catError) {
    alert('Error al cargar categorías');
    console.error(catError);
  } else {
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.nombre;
      categoriaSelect.appendChild(option);
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

  // Subir producto
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = imgInput.files[0];
    if (!file || file.size === 0) {
      alert("La imagen no es válida o está vacía");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = crypto.randomUUID ? crypto.randomUUID() : Date.now();
    const imgPath = `productos/${fileName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(imgPath, file, {
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      alert('Error subiendo imagen');
      console.error(uploadError);
      return;
    }

    // Obtener URL pública
    const { data: urlData } = supabase
      .storage
      .from('productos')
      .getPublicUrl(imgPath);
    const imagenUrl = urlData?.publicUrl ?? '';

    // Obtener usuario autenticado
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;

    // Armar objeto producto
    const producto = {
      id: idInput.value.trim(),
      nombre: nombreInput.value.trim(),
      descripcion: descripcionInput.value.trim(),
      piezas: parseInt(piezasInput.value),
      precio_compra: parseFloat(compraInput.value),
      precio_venta: parseFloat(ventaInput.value),
      categoria_id: categoriaSelect.value,
      imagen_url: imagenUrl,
      creado_por: userId,
      fecha_creacion: new Date().toISOString()
    };

    // Insertar en base de datos
    const { error: insertError } = await supabase
      .from('productos')
      .insert([producto]);

    if (insertError) {
      alert('Error al guardar el producto');
      console.error(insertError);
    } else {
      alert('✅ Producto registrado correctamente');
      localStorage.removeItem('codigo_barras');
      window.location.href = 'index.html';
    }
  });
});
