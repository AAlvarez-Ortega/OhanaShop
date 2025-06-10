import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

const select = document.getElementById('filtro-categorias');
const lista = document.getElementById('lista-productos');

// Cargar categorías
const { data: categorias } = await supabase.from('categorias').select('*');
categorias.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat.id;
  option.textContent = cat.nombre;
  select.appendChild(option);
});

// Función para mostrar productos
async function cargarProductos(categoria = 'todas') {
  lista.innerHTML = 'Cargando...';

  let query = supabase.from('productos').select('*');
  if (categoria !== 'todas') {
    query = query.eq('categoria_id', categoria);
  }

  const { data: productos, error } = await query;

  if (error) {
    lista.innerHTML = 'Error al cargar productos.';
    console.error(error);
    return;
  }

  if (!productos.length) {
    lista.innerHTML = 'No hay productos en esta categoría.';
    return;
  }

  lista.innerHTML = '';

 productos.forEach(prod => {
  const div = document.createElement('div');
  div.className = 'producto';
  div.innerHTML = `
    <div class="producto-info">
      <strong>${prod.nombre}</strong>
      <div class="producto-imagen">
        <img src="${prod.imagen_url}" alt="img" />
      </div>
      <div class="producto-piezas">${prod.piezas} pz en existencia</div>
    </div>
    <div class="producto-precio">$${prod.precio_venta}</div>
  `;

  div.addEventListener('click', () => {
    localStorage.setItem('codigo_barras', prod.id);
    window.location.href = 'productoexistente.html';
  });

  lista.appendChild(div);
});

}

// Filtro por categoría
select.addEventListener('change', (e) => {
  cargarProductos(e.target.value);
});

// Cargar al iniciar
cargarProductos();
