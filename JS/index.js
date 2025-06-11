document.addEventListener('DOMContentLoaded', async () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('menu-close');
  const productsContainer = document.querySelector('.products');
  const filtroCategorias = document.getElementById('filtro-categorias');

  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
  );

  // Mostrar filtro de categorías siempre
  if (filtroCategorias) {
    filtroCategorias.style.display = 'block';
    const { data: categorias, error } = await supabase.from('categorias').select('id, nombre');
    if (!error && categorias) {
      filtroCategorias.innerHTML = `<option value="todos">Todas las categorías</option>`;
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        filtroCategorias.appendChild(option);
      });

      filtroCategorias.addEventListener('change', (e) => {
        const categoriaSeleccionada = e.target.value;
        cargarProductos(categoriaSeleccionada);
      });
    }
  }

  // Cargar productos sin importar sesión
  await cargarProductos();

  async function cargarProductos(filtroCategoria = null) {
    let query = supabase.from('productos').select('id, nombre, descripcion, piezas, precio_venta, imagen_url, categoria_id');
    if (filtroCategoria && filtroCategoria !== 'todos') {
      query = query.eq('categoria_id', filtroCategoria);
    }

    const { data: productos, error } = await query.order('fecha_creacion', { ascending: false });

    if (!error && productos) {
      productsContainer.innerHTML = '';
      productos.forEach(producto => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
          <div class="image-container">
            <img src="${producto.imagen_url}" alt="${producto.nombre}" />
          </div>
          <p><strong>${producto.nombre}</strong></p>
          <p><strong>$${producto.precio_venta}</strong></p>
          <p><small>${producto.piezas} piezas</small></p>
        `;

        // Navegar a vista de producto al hacer clic
        card.addEventListener('click', () => {
          localStorage.setItem('producto_id', producto.id);
          window.location.href = 'vistaproductos.html';
        });

        productsContainer.appendChild(card);
      });
    }
  }

  // Navegación lateral
  menuToggle?.addEventListener('click', () => sidebar?.classList.toggle('show'));
  closeBtn?.addEventListener('click', () => sidebar?.classList.remove('show'));
});
