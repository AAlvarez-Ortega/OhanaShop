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

  const modal = document.getElementById('modal-producto');
  const cerrarModal = document.getElementById('cerrar-modal');
  const modalImg = document.getElementById('modal-img');
  const modalNombre = document.getElementById('modal-nombre');
  const modalDescripcion = document.getElementById('modal-descripcion');
  const modalPrecio = document.getElementById('modal-precio');
  const modalStock = document.getElementById('modal-stock');
  const modalCantidad = document.getElementById('modal-cantidad');
  const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
  const mensajeSesion = document.getElementById('modal-msg');

  let usuario = await obtenerUsuarioActivo();

  // Mostrar icono e imagen de sesión
  if (usuario) {
    loginText.textContent = 'Sesión iniciada';
    if (usuario.foto) {
      userIcon.innerHTML = `<img src="${usuario.foto}" alt="user" />`;
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
    renderFloatingMenu(usuario);
  });

  // Cerrar menú flotante si se hace clic fuera
  document.addEventListener('click', (e) => {
    const clickedInside = floatingMenu.contains(e.target) || userIcon.contains(e.target);
    if (!clickedInside) {
      floatingMenu.classList.remove('show');
    }
  });

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
  if (usuario?.rol === 'administrador') {
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
// Mostrar combo box solo para clientes
if (usuario?.rol !== 'administrador') {
  if (filtroCategorias) {
    filtroCategorias.style.display = 'block';

    const { data: categorias, error } = await supabase.from('categorias').select('id, nombre');

    if (!error && categorias) {
      filtroCategorias.innerHTML = `<option value="todo">Todas las categorías</option>`;
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.nombre;
        filtroCategorias.appendChild(option);
      });

      filtroCategorias.addEventListener('change', (e) => {
        const categoriaSeleccionada = e.target.value;
        cargarProductos(categoriaSeleccionada === 'todos' ? null : categoriaSeleccionada);
      });
    }
  }
}

// Mostrar barra horizontal de categorías PARA TODOS
const { data: categoriasScroll, error: catError } = await supabase.from('categorias').select('id, nombre');

if (!catError && categoriasScroll) {
  const barraCategorias = document.getElementById('barra-categorias');
  if (barraCategorias) {
    barraCategorias.innerHTML = '';

    // Botón "Todas"
    const btnTodas = document.createElement('button');
    btnTodas.classList.add('categoria-btn', 'activa');
    btnTodas.textContent = 'Toda ohana Shop';
    btnTodas.dataset.id = 'todos';
    barraCategorias.appendChild(btnTodas);

    // Botones de cada categoría
    categoriasScroll.forEach(cat => {
      const btn = document.createElement('button');
      btn.classList.add('categoria-btn');
      btn.textContent = cat.nombre;
      btn.dataset.id = cat.id;
      barraCategorias.appendChild(btn);
    });

    // Clic en botones de la barra
    barraCategorias.addEventListener('click', (e) => {
      if (e.target.classList.contains('categoria-btn')) {
        document.querySelectorAll('.categoria-btn').forEach(b => b.classList.remove('activa'));
        e.target.classList.add('activa');
        const id = e.target.dataset.id;
        cargarProductos(id === 'todos' ? null : id);
      }
    });
  }
}



  await cargarProductos();
  async function cargarProductos(filtroCategoria = null) {
  let query = supabase
    .from('productos')
    .select('id, nombre, descripcion, piezas, precio_venta, imagen_url, categoria_id');

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

      if (producto.piezas === 0) {
        card.classList.add('agotado');
      }

      card.innerHTML = `
        <div class="image-container">
          <img src="${producto.imagen_url}" alt="${producto.nombre}" />
        </div>
        <p><strong>${producto.nombre}</strong></p>
        <p><strong>$${producto.precio_venta}</strong></p>
        <p><small>${producto.piezas} piezas</small></p>
        ${producto.piezas === 0 ? `<div class="etiqueta-agotado">Agotado</div>` : ''}
      `;

      card.addEventListener('click', () => {
        mostrarModalProducto(producto);
      });

      productsContainer.appendChild(card);
    });
  }
}


  



  function mostrarModalProducto(producto) {
    modalImg.src = producto.imagen_url;
    modalNombre.textContent = producto.nombre;
    modalDescripcion.textContent = producto.descripcion;
    modalPrecio.textContent = producto.precio_venta;
    modalStock.textContent = producto.piezas;
    modalCantidad.value = 1;

    if (usuario) {
      btnAgregarCarrito.disabled = false;
      mensajeSesion.classList.add('oculto');
    } else {
      btnAgregarCarrito.disabled = true;
      mensajeSesion.classList.remove('oculto');
    }

    modal.classList.remove('oculto');
  }

  cerrarModal.addEventListener('click', () => {
    modal.classList.add('oculto');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('oculto');
    }
  });

  // Menú lateral
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));
});
