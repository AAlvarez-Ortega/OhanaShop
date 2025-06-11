// auth.js

const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

const userIcon = document.getElementById('user-icon');
const floatingMenu = document.getElementById('floating-user-menu');
const loginText = document.querySelector('.login-text');

let currentUser = null;
let currentUserInfo = null;

if (userIcon) {
  userIcon.addEventListener('click', () => {
    if (floatingMenu) {
      floatingMenu.classList.toggle('show');
      renderFloatingMenu();
    }
  });
}

document.addEventListener('click', (e) => {
  if (floatingMenu && !floatingMenu.contains(e.target) && !userIcon.contains(e.target)) {
    floatingMenu.classList.remove('show');
  }
});

function renderFloatingMenu() {
  if (!floatingMenu) return;

  if (currentUser && currentUserInfo) {
    floatingMenu.innerHTML = `
      <div class="avatar">
        ${currentUserInfo.foto ? `<img src="${currentUserInfo.foto}" alt="avatar" />` : '👤'}
      </div>
      <hr />
      <div class="info">
        <strong>${currentUserInfo.nombre}</strong>
        <span>${currentUserInfo.email}</span>
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

// Función pública para inicializar desde el HTML
async function initAuth(options = {}) {
  const { mostrarTextoSesion = true } = options;

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    currentUser = session.user;

    const { data, error } = await supabase.from('usuarios').select('*').eq('id', currentUser.id).single();
    if (!error && data) {
      currentUserInfo = data;

      if (userIcon && data.foto) {
        userIcon.innerHTML = `<img src="${data.foto}" alt="user" style="width:100%; height:100%; border-radius:50%;" />`;
      }

      if (mostrarTextoSesion && loginText) {
        loginText.textContent = 'Sesión iniciada';
      }
    }
  } else {
    if (loginText) loginText.textContent = 'Inicio de sesión';
  }
}

// Variables exportables si es necesario desde otros scripts
// currentUser: datos básicos de sesión (supabase)
// currentUserInfo: datos de la tabla 'usuarios'
