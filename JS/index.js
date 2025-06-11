// JS/index.js
import { supabase, obtenerUsuarioActivo, cerrarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const closeBtn = document.getElementById('menu-close');
  const productsContainer = document.querySelector('.products');
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');
  const btnNuevo = document.getElementById('btn-nuevo-producto');
  const btnAlmacen = document.getElementById('btn-almacen');
  const btnCategorias = document.getElementById('btn-categorias');
  const btnVentas = document.getElementById('btn-ventas');
  const filtroCategorias = document.getElementById('filtro-categorias');

  let userData = await obtenerUsuarioActivo();

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

  await cargarProductos();

  if (userData) {
    if (userData.foto) {
      userIcon.innerHTML = `<img src="${userData.foto}" alt="user" style="width:100%; height:100%; border-radius:50%;" />`;
    }

    if (userData.rol === 'administrador') {
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
  }

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

      // Agregar redirección al hacer clic
      card.addEventListener('click', () => {
        window.location.href = `Vproductos.html?id=${producto.id}`;
      });

      productsContainer.appendChild(card);
    });
  }
}


  menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));

  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderFloatingMenu();
  });

  function renderFloatingMenu() {
    if (userData) {
      floatingMenu.innerHTML = `
        <div class="avatar"><img src="${userData.foto}" alt="avatar" /></div>
        <hr />
        <div class="info">
          <strong>${userData.nombre}</strong>
          <span>${userData.email}</span>
        </div>
        <div class="logout-row">
          <span>Cerrar sesión</span>
          <button class="logout-btn" title="Cerrar sesión" id="logout-btn">🔌</button>
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

  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
      floatingMenu.classList.remove('show');
    }
  });
});
