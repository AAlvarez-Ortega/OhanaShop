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

let user = null;
let userInfo = null;


// Obtener sesión actual
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    user = session.user;
    cargarUserData(user.id);
  } else {
    btnAgregar.disabled = true;
  }
});

// Cargar datos del producto desde localStorage
const id = localStorage.getItem('producto_id');

if (!id) window.location.href = 'index.html';

supabase.from('productos').select('*').eq('id', id).single().then(({ data, error }) => {
  if (!error && data) {
    img.src = data.imagen_url;
    nombre.textContent = data.nombre;
    desc.textContent = data.descripcion;
    precio.textContent = data.precio_venta;
  } else {
    alert("Error al cargar el producto");
    window.location.href = 'index.html';
  }
});

btnAgregar.addEventListener('click', () => {
  if (!user) {
    alert("Debes iniciar sesión para agregar al carrito");
    return;
  }
  const cantidad = document.getElementById('cantidad').value;
  if (!cantidad || cantidad <= 0) return alert("Ingresa una cantidad válida");
  alert(`Se agregaron ${cantidad} piezas al carrito (funcionalidad pendiente)`);
});

userIcon.addEventListener('click', () => {
  floatingMenu.classList.toggle('show');
  renderFloatingMenu();
});

document.addEventListener('click', (e) => {
  if (!floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
    floatingMenu.classList.remove('show');
  }
});

function cargarUserData(userId) {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
            user = session.user;
            cargarUserData(user.id);
            document.querySelector('.login-text').textContent = 'Sesión iniciada';
        } else {
            btnAgregar.disabled = true;
        }
    });

}


function renderFloatingMenu() {
  if (userInfo && userInfo.email) {
    floatingMenu.innerHTML = `
      <div class="avatar"><img src="${userInfo.foto}" alt="avatar" /></div>
      <hr />
      <div class="info">
        <strong>${userInfo.nombre}</strong>
        <span>${userInfo.email}</span>
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
