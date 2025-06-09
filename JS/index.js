document.addEventListener('DOMContentLoaded', async function () {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('menu-close');
  const productsContainer = document.querySelector('.products');
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');

  // Supabase config
  const supabaseUrl = 'https://qybynnifyuvbuacanlaa.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNTc5MTAsImV4cCI6MjA2NDkzMzkxMH0.OgVrVZ5-K0nwpFp3uLuT_iw-UNlLtlvuP2E97Gh9TAo';
  const client = supabase.createClient(supabaseUrl, supabaseKey);

  // 👉 Simulación (cámbialo luego por una sesión real)
  const sesionIniciada = false;
  const userData = null;


  // 📦 Cargar productos
  async function cargarProductos() {
    const { data: productos, error } = await client
      .from('productos')
      .select('id, nombre, descripcion, piezas, precio_venta, imagen_url')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al obtener productos:', error);
      return;
    }

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
      productsContainer.appendChild(card);
    });
  }

  await cargarProductos();

  // 🎛 Menú lateral
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));

  // 👤 Menú flotante de usuario
  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderizarFloatingUserMenu();
  });

      function renderizarFloatingUserMenu() {
        if (sesionIniciada) {
          floatingMenu.innerHTML = `
            <div class="avatar">👤</div>
            <hr />
            <div class="info">
              <strong>${userData.nombre}</strong>
              <span>${userData.correo}</span>
            </div>
            <div class="logout-row">
              <span>Cerrar sesión</span>
              <button class="logout-btn" title="Cerrar sesión">🔌</button>
            </div>
          `;
        } else {
          floatingMenu.innerHTML = `
            <div class="avatar">👤</div>
            <hr />
            <div class="info">
              <strong>No has iniciado sesión</strong>
            </div>
            <div class="logout-row">
              <button class="logout-btn" id="login-btn" title="Iniciar sesión">🔓</button>
            </div>
          `;

          // 🔁 Después de insertar el botón, agregamos el listener
          const loginBtn = document.getElementById('login-btn');
          loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
          });
        }
      }


  // Cerrar el menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
      floatingMenu.classList.remove('show');
    }
  });
});
