document.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
  );

  const codigo = localStorage.getItem('codigo_barras');
  if (!codigo) return alert("Código no disponible");

  const { data, error } = await supabase.from('productos').select('*').eq('id', codigo).single();

  if (error || !data) {
    alert("Producto no encontrado. Redirigiendo...");
    window.location.href = 'nuevoproducto.html';
    return;
  }

  // Elementos
  document.getElementById('id').value = data.id;
  document.getElementById('nombre').value = data.nombre;
  document.getElementById('descripcion').value = data.descripcion;
  document.getElementById('piezas').value = data.piezas;
  document.getElementById('precio_compra').value = data.precio_compra;
  document.getElementById('precio_venta').value = data.precio_venta;
  document.getElementById('imagen_producto').src = data.imagen_url;

  // Editar producto
  document.getElementById('editar').addEventListener('click', async () => {
    const { error: updateError } = await supabase
      .from('productos')
      .update({
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio_venta: parseFloat(document.getElementById('precio_venta').value)
      })
      .eq('id', codigo);

    if (updateError) {
      alert("❌ Error al actualizar");
      console.error(updateError);
    } else {
      alert("✅ Producto actualizado");
    }
  });

  // Agregar inventario
  document.getElementById('agregar_piezas').addEventListener('click', async () => {
    const extra = parseInt(document.getElementById('nuevas_piezas').value);
    const total = data.piezas + extra;

    const { error: inventarioError } = await supabase
      .from('productos')
      .update({ piezas: total })
      .eq('id', codigo);

    if (inventarioError) {
      alert("❌ Error al actualizar inventario");
    } else {
      alert("✅ Inventario actualizado");
      location.reload();
    }
  });

  // Eliminar producto e imagen
  document.getElementById('eliminar').addEventListener('click', async () => {
    const pathImagen = data.imagen_url.split('/').pop();

    const { error: deleteImgError } = await supabase.storage
      .from('productos')
      .remove([pathImagen]);

    const { error: deleteProdError } = await supabase
      .from('productos')
      .delete()
      .eq('id', codigo);

    if (deleteImgError || deleteProdError) {
      alert("❌ Error al eliminar");
      console.error(deleteImgError || deleteProdError);
    } else {
      alert("✅ Producto eliminado");
      window.location.href = 'index.html';
    }
  });
});
