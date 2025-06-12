// Función para abrir el modal de producto
export function mostrarModalProducto(producto, usuario) {
  document.getElementById('modal-img').src = producto.imagen_url;
  document.getElementById('modal-nombre').textContent = producto.nombre;
  document.getElementById('modal-descripcion').textContent = producto.descripcion;
  document.getElementById('modal-precio').textContent = producto.precio_venta;
  document.getElementById('modal-stock').textContent = producto.piezas;
  document.getElementById('modal-cantidad').value = 1;

  const btnAgregar = document.getElementById('btn-agregar-carrito');
  const msgSesion = document.getElementById('modal-msg');

  if (usuario) {
    btnAgregar.disabled = false;
    msgSesion.classList.add('oculto');
  } else {
    btnAgregar.disabled = true;
    msgSesion.classList.remove('oculto');
  }

  btnAgregar.onclick = () => {
    const cantidad = parseInt(document.getElementById('modal-cantidad').value);
    if (cantidad > 0) {
      console.log(`Agregar ${cantidad} de ${producto.nombre} al carrito`);
      // Aquí puedes llamar a tu función real para agregar al carrito
    }
  };

  document.getElementById('modal-producto').classList.remove('oculto');
}

// Cerrar modal al presionar ✖ o fuera del contenido
document.getElementById('cerrar-modal').addEventListener('click', () => {
  document.getElementById('modal-producto').classList.add('oculto');
});

document.getElementById('modal-producto').addEventListener('click', (e) => {
  if (e.target.id === 'modal-producto') {
    document.getElementById('modal-producto').classList.add('oculto');
  }
});
