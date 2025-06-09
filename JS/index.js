document.addEventListener('DOMContentLoaded', async function () {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('menu-close');
  const productsContainer = document.querySelector('.products');
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');
  const btnNuevoProducto = document.getElementById('btn-nuevo-producto');

  const supabaseUrl = 'https://qybynnifyuvbuacanlaa.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  let userData = null;

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) console.error('❌ Error obteniendo sesión:', sessionError);

  if (session?.user) {
    const id = session.user.id;
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && usuario) {
      userData = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.email,
        foto: usuario.foto,
        rol: usuario.rol
      };

      if (userData.foto) {
        userIcon.innerHTML = `<img src="${userData.foto}" alt="user" style="width:100%; height:100%; border-radius:50%;" />`;
      }

      if (userData.rol === 'administrador') {
        const btnAlmacen = document.querySelector('.menu-btn[data-role="admin-almacen"]');
        if (btnAlmacen) btnAlmacen.style.display = 'block';
        if (btnNuevoProducto) {
          btnNuevoProducto.style.display = 'block';
          btnNuevoProducto.addEventListener('click', () => {
            window.location.href = 'scaner.html';
          });
        }
      }
    } else {
      console.warn('⚠️ Usuario no encontrado o error:', error);
    }
  }

  async function cargarProductos() {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, piezas, precio_venta, imagen_url')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener productos:', error);
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

  menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));

  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderizarFloatingUserMenu();
  });

  function renderizarFloatingUserMenu() {
    if (userData) {
      floatingMenu.innerHTML = `
        <div class="avatar"><img src="${userData.foto}" alt="avatar" /></div>
        <hr />
        <div class="info">
          <strong>${userData.nombre}</strong>
          <span>${userData.correo}</span>
        </div>
        <div class="logout-row">
          <span>Cerrar sesión</span>
          <button class="logout-btn" title="Cerrar sesión" id="logout-btn">🔌</button>
        </div>
      `;
      document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        location.reload();
      });
    } else {
      floatingMenu.innerHTML = `
        <div class="avatar">👤</div>
        <hr />
        <div class="info"><strong>No has iniciado sesión</strong></div>
        <div class="logout-row">
          <button class="logout-btn" id="login-btn" title="Iniciar sesión">🔓</button>
        </div>
      `;
      document.getElementById('login-btn').addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }

  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
      floatingMenu.classList.remove('show');
    }
  });
});
