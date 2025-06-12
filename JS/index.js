import { supabase, obtenerUsuarioActivo, cerrarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('menu-close');
  const productsContainer = document.querySelector('.products');
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');
  const loginText = document.querySelector('.login-text');
  const btnNuevo = document.getElementById('btn-nuevo-producto');
  const btnAlmacen = document.getElementById('btn-almacen');
  const btnCategorias = document.getElementById('btn-categorias');
  const btnVentas = document.getElementById('btn-ventas');
  const filtroCategorias = document.getElementById('filtro-categorias');

  let userData = await obtenerUsuarioActivo();

  // Mostrar icono e imagen de sesión
  if (userData) {
    loginText.textContent = 'Sesión iniciada';
    if (userData.foto) {
      userIcon.innerHTML = `<img src="${userData.foto}" alt="user" />`;
    } else {
      userIcon.innerHTML = '';
    }
    userIcon.style.cursor = 'pointer';
  } else {
    loginText.textContent = 'Inicio de sesión';
    userIcon.innerHTML = '';
    userIcon.style.cursor = 'pointer';
  }

  // Menú flotante
  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderFloatingMenu(userData);
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', (e) => {
    const clickedInside = floatingMenu.contains(e.target) || userIcon.contains(e.target);
    if (!clickedInside) {
      floatingMenu.classList.remove('show');
    }
  });

  // Construir menú flotante
  function renderFloatingMenu(user) {
    if (user) {
      floatingMenu.innerHTML = `
        <div class="avatar">${user.foto ? `<img src="${user.foto}" alt="avatar" />` : '👤'}</div>
        <hr />
        <div class="info">
          <strong>${user.nombre}</strong>
          <span>${user.email}</span>
        </div>
        <div class="logout-row">
          <span>Cerrar sesión</span>
          <button class="logout-btn" id="logout-btn">🔌</button>
        </div>
      `;
      document.getElementById('logout-btn').addEventListener('click', cerrarSesion);
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

  // Mostrar botones según rol
  if (userData?.rol === 'administrador') {
    if (btnAlmacen) {
      btnAlmacen.style.display = 'block';
      btnAlmacen.addEventListener('click', () => window.location.href = 'almacen.html');
    }
    if (btnNuevo) {
      btnNuevo.style.display = 'block';
      btnNuevo.addEventListener('click', () => window.location.href = 'scaner.html');
    }
    if (btnCategorias) {
      btnCategorias.style.display = 'block';
      btnCategorias.addEventListener('click', () => window.location.href = 'categorias.html');
    }
    if (btnVentas) {
      btnVentas.style.display = 'block';
      btnVentas.addEventListener('click', () => window.location.href = 'ventas.html');
    }
    if (filtroCategorias) filtroCategorias.style.display = 'none';
  }

  // Cargar filtro de categorías (solo para clientes)
  if (filtroCategorias && userData?.rol !== 'administrador') {
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
        card.style.cursor = 'pointer';

        card.innerHTML = `
          <div class="image-container">
            <img src="${producto.imagen_url}" alt="${producto.nombre}" />
          </div>
          <p><strong>${producto.nombre}</strong></p>
          <p><strong>$${producto.precio_venta}</strong></p>
          <p><small>${producto.piezas} piezas</small></p>
        `;

        card.addEventListener('click', () => {
          floatingMenu.classList.remove('show');
          window.location.href = `Vproductos.html?id=${producto.id}`;
        });

        productsContainer.appendChild(card);
      });
    }
  }

  // Menú lateral
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));
});
