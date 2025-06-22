import { supabase } from './auth.js';

const imgProducto = document.getElementById('img-producto');
const nombreProducto = document.getElementById('nombre-producto');
const codigoProducto = document.getElementById('codigo-producto');
const descripcionProducto = document.getElementById('descripcion-producto');
const precioProducto = document.getElementById('precio-producto');
const stockProducto = document.getElementById('stock-producto');
const preciosCompra = document.getElementById('precio-compra');

const btnAdd = document.getElementById('btn-add');
const btnEdit = document.getElementById('btn-edit');
const btnDelete = document.getElementById('btn-delete');

// Modales
const modalAdd = document.getElementById('modal-add');
const modalEdit = document.getElementById('modal-edit');
const modalDelete = document.getElementById('modal-delete');

// Inputs modales
const inputStock = document.getElementById('input-stock');
const editNombre = document.getElementById('edit-nombre');
const editDescripcion = document.getElementById('edit-descripcion');
const editPrecio = document.getElementById('edit-precio');
const editImagen = document.getElementById('edit-imagen');

const confirmarAdd = document.getElementById('confirmar-add');
const confirmarEdit = document.getElementById('confirmar-edit');
const confirmarDelete = document.getElementById('confirmar-delete');

let productoId = localStorage.getItem('codigo_barras');
let productoActual = null;

// Cargar producto
async function cargarProducto() {
  const { data, error } = await supabase.from('productos').select('*').eq('id', productoId).single();
  if (error || !data) return alert("❌ Error al cargar producto");

  productoActual = data;

  imgProducto.src = data.imagen_url;
nombreProducto.innerHTML = `<strong>Nombre:</strong> ${data.nombre}`;
codigoProducto.innerHTML = `<strong>Código:</strong> ${data.id}`;
descripcionProducto.innerHTML = `<strong>Descripción:</strong> ${data.descripcion}`;
precioProducto.innerHTML = `<strong>Precio:</strong> $${data.precio_venta}`;
preciosCompra.innerHTML = `<strong>Precio compra:</strong> $${data.precio_compra}`;
stockProducto.innerHTML = `<strong>Piezas en stock:</strong> ${data.piezas}`;


}
await cargarProducto();

// Abrir modales
btnAdd.addEventListener('click', () => modalAdd.classList.remove('oculto'));
btnEdit.addEventListener('click', () => {
  editNombre.value = productoActual.nombre;
  editDescripcion.value = productoActual.descripcion;
  editPrecio.value = productoActual.precio_venta;
  modalEdit.classList.remove('oculto');
});
btnDelete.addEventListener('click', () => modalDelete.classList.remove('oculto'));

// Cerrar modales al hacer clic en ✖ o fuera
document.querySelectorAll('.cerrar').forEach(el => {
  el.addEventListener('click', () => el.closest('.modal').classList.add('oculto'));
});
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.add('oculto');
  });
});

// Confirmar agregar stock
confirmarAdd.addEventListener('click', async () => {
  const cantidad = parseInt(inputStock.value);
  if (!cantidad || cantidad < 1) return alert("Ingresa una cantidad válida");

  const nuevoStock = productoActual.piezas + cantidad;
  const { error } = await supabase.from('productos').update({ piezas: nuevoStock }).eq('id', productoId);

  if (!error) {
    modalAdd.classList.add('oculto');
    await cargarProducto();
    inputStock.value = '';
  } else {
    alert("❌ Error al agregar stock");
  }
});

// Confirmar edición
confirmarEdit.addEventListener('click', async () => {
  const nuevoNombre = editNombre.value.trim();
  const nuevaDescripcion = editDescripcion.value.trim();
  const nuevoPrecio = parseFloat(editPrecio.value);
  let nuevaImagenUrl = productoActual.imagen_url;

  if (editImagen.files.length > 0) {
    const archivo = editImagen.files[0];
    const nombreArchivo = `${productoId}-${Date.now()}`;
    const { data: imgData, error: imgError } = await supabase.storage
      .from('productos')
      .upload(nombreArchivo, archivo, { upsert: true });

    if (!imgError) {
      const { data } = supabase.storage.from('productos').getPublicUrl(nombreArchivo);
      nuevaImagenUrl = data.publicUrl;
    }
  }

  const { error } = await supabase.from('productos')
    .update({
      nombre: nuevoNombre,
      descripcion: nuevaDescripcion,
      precio_venta: nuevoPrecio,
      imagen_url: nuevaImagenUrl
    })
    .eq('id', productoId);

  if (!error) {
    modalEdit.classList.add('oculto');
    await cargarProducto();
  } else {
    alert("❌ Error al guardar cambios");
  }
});

// Confirmar eliminación
confirmarDelete.addEventListener('click', async () => {
  const { error } = await supabase.from('productos').delete().eq('id', productoId);

  if (!error) {
    localStorage.removeItem('codigo_barras');
    window.location.href = 'almacen.html';
  } else {
    alert("❌ Error al eliminar producto");
  }
});