// ✅ IMPORTANTE: este script requiere que antes cargues Supabase en el HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>

document.addEventListener('DOMContentLoaded', async function () {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const productsContainer = document.querySelector('.products');

  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('show');
  });

  // ✅ CONFIGURA TU PROYECTO SUPABASE
  const supabaseUrl = 'https://qybynnifyuvbuacanlaa.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTc5MTAsImV4cCI6MjA2NDkzMzkxMH0.OgVrVZ5-K0nwpFp3uLuT_iw-UNlLtlvuP2E97Gh9TAo';
  const client = supabase.createClient(supabaseUrl, supabaseKey); // ✅ Usa un nombre diferente (client)

  // ✅ CARGA Y MUESTRA LOS PRODUCTOS
  async function cargarProductos() {
    const { data: productos, error } = await client
      .from('productos')
      .select(`
        id,
        nombre,
        descripcion,
        piezas,
        precio_venta,
        imagen_url
      `)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }

    productsContainer.innerHTML = ''; // Limpiar contenido inicial

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


      productsContainer.appendChild(card);
    });
  }

  await cargarProductos();

  const closeBtn = document.getElementById('menu-close');

    closeBtn.addEventListener('click', function () {
      sidebar.classList.remove('show');
    });

});
