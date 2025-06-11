import { supabase, obtenerUsuarioActivo, cerrarSesion } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userIcon = document.getElementById('user-icon');
  const floatingMenu = document.getElementById('floating-user-menu');
  const loginText = document.querySelector('.login-text');

  // 1. Obtener usuario logueado
  const userData = await obtenerUsuarioActivo();

  // 2. Mostrar ícono o imagen
  if (userData && userData.foto) {
    loginText.textContent = 'Sesión iniciada';
    userIcon.innerHTML = `<img src="${userData.foto}" alt="user" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    userIcon.style.cursor = 'pointer';
  } else {
    userIcon.innerHTML = '👤';
    userIcon.style.cursor = 'text';
  }

  // 3. Mostrar menú al hacer clic en el ícono
  userIcon.addEventListener('click', () => {
    floatingMenu.classList.toggle('show');
    renderFloatingMenu(userData);
  });

  // 4. Cerrar menú al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
      floatingMenu.classList.remove('show');
    }
  });

  // 5. Renderizar menú flotante según sesión
  function renderFloatingMenu(userData) {
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

  // ================= CARGAR PRODUCTO ===================
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
