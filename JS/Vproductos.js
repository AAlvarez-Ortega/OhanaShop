import { supabase } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) return;

  const { data: producto, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !producto) {
    document.body.innerHTML = '<p style="padding:20px;">Producto no encontrado.</p>';
    return;
  }

  const imagenDiv = document.getElementById('imagen-producto');
  const infoDiv = document.getElementById('info-producto');

  imagenDiv.innerHTML = `
    <img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100%; max-width: 500px; border-radius: 12px;" />
  `;

  infoDiv.innerHTML = `
    <h2>${producto.nombre}</h2>
    <p>${producto.descripcion}</p>
    <p><strong>Precio:</strong> $${producto.precio_venta}</p>
    <p><strong>Stock:</strong> ${producto.piezas} piezas</p>
    <div style="margin: 10px 0;">
      <label for="cantidad">Pz:</label>
      <input type="number" id="cantidad" min="1" value="1" style="width: 60px; margin-left: 8px;" />
    </div>
    <button style="padding: 10px 16px; background-color: #7a003c; color: white; border: none; border-radius: 10px; cursor: pointer;">
      Añadir al carrito
    </button>
  `;
});
