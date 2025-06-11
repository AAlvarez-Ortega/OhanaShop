import { supabase, obtenerUsuarioActivo, cerrarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');
  const loginText = document.querySelector('.login-text');

  const user = await obtenerUsuarioActivo();
  renderFloatingMenu(user);

  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderFloatingMenu(user);
  });

  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
      floatingMenu.classList.remove('show');
    }
  });

  function renderFloatingMenu(user) {
    if (user) {
      loginText.textContent = 'Sesión iniciada';
      userIcon.innerHTML = user.foto
        ? `<img src="${user.foto}" alt="user" />`
        : '👤';

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
      loginText.textContent = 'Inicio de sesión';
      userIcon.innerHTML = '👤';
      floatingMenu.innerHTML = `
        <div class="avatar">👤</div>
        <hr />
        <div class="info"><strong>No has iniciado sesión</strong></div>
        <div class="logout-row">
          <button class="logout-btn" id="login-btn">🔓</button>
        </div>
      `;
      document.getElementById('login-btn').addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }

  // ================= PRODUCTO =====================
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

  const botonDeshabilitado = !user;
  infoDiv.innerHTML = `
    <h2>${producto.nombre}</h2>
    <p>${producto.descripcion}</p>
    <p><strong>Precio:</strong> $${producto.precio_venta}</p>
    <p><strong>Stock:</strong> ${producto.piezas} piezas</p>
    <div style="margin: 10px 0;">
      <label for="cantidad">Pz:</label>
      <input type="number" id="cantidad" min="1" value="1" style="width: 60px; margin-left: 8px;" />
    </div>
    <button id="btn-carrito" ${botonDeshabilitado ? 'disabled' : ''} style="padding: 10px 16px; background-color: #7a003c; color: white; border: none; border-radius: 10px; cursor: pointer;">
      Añadir al carrito
    </button>
    ${botonDeshabilitado ? `<p style="color: #900; margin-top: 10px;">Inicia sesión para agregar al carrito</p>` : ''}
  `;
});
