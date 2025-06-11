const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

const img = document.getElementById('producto-img');
const nombre = document.getElementById('producto-nombre');
const desc = document.getElementById('producto-desc');
const precio = document.getElementById('producto-precio');
const btnAgregar = document.getElementById('btn-agregar');
const userIcon = document.getElementById('user-icon');
const floatingMenu = document.getElementById('floating-user-menu');
const loginText = document.querySelector('.login-text');

let user = null;
let userInfo = null;

// 🔹 Siempre se ejecuta al cargar la página
window.addEventListener('DOMContentLoaded', async () => {
  await cargarProducto(); // 🟢 Cargar producto aunque no haya sesión
  await verificarSesion(); // 🟢 Revisar sesión después
});

// 🔹 Cargar producto del localStorage y luego desde Supabase
async function cargarProducto() {
  const id = localStorage.getItem('producto_id');
  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
  if (error || !data) {
    alert("Error al cargar el producto");
    window.location.href = 'index.html';
    return;
  }

  // Mostrar datos
  img.src = data.imagen_url;
  nombre.textContent = data.nombre;
  desc.textContent = data.descripcion;
  precio.textContent = data.precio_venta;
}

// 🔹 Verificar sesión y cargar usuario (opcional)
async function verificarSesion() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (session?.user) {
    user = session.user;
    btnAgregar.disabled = false;
    await cargarUserData(user.id);
  } else {
    btnAgregar.disabled = true;
  }
}

// 🔹 Evento del botón Agregar
btnAgregar.addEventListener('click', () => {
  if (!user) {
    alert("Debes iniciar sesión para agregar al carrito");
    return;
  }

  const cantidad = document.getElementById('cantidad').value;
  if (!cantidad || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  alert(`Se agregaron ${cantidad} piezas al carrito (funcionalidad pendiente)`);
});

// 🔹 Cargar información del usuario si hay sesión
async function cargarUserData(userId) {
  const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
  if (error || !data) return;

  userInfo = data;

  if (userInfo.foto) {
    userIcon.innerHTML = `<img src="${userInfo.foto}" alt="user" style="width:100%; height:100%; border-radius:50%;" />`;
  }

  if (loginText) loginText.textContent = 'Sesión iniciada';
}

// 🔹 Icono usuario y menú flotante
userIcon.addEventListener('click', () => {
  floatingMenu.classList.toggle('show');
  renderFloatingMenu();
});

document.addEventListener('click', (e) => {
  if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
    floatingMenu.classList.remove('show');
  }
});

function renderFloatingMenu() {
  if (user && userInfo) {
    floatingMenu.innerHTML = `
      <div class="avatar"><img src="${userInfo.foto}" alt="avatar" /></div>
      <hr />
      <div class="info">
        <strong>${userInfo.nombre}</strong>
        <span>${user.email}</span>
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
