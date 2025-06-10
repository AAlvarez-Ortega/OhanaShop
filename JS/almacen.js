import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

const select = document.getElementById('filtro-categorias');
const lista = document.getElementById('lista-productos');
const buscador = document.getElementById('buscar-nombre');
const botonLector = document.getElementById('abrir-lector');
const modalLector = document.getElementById('modal-lector');
const cerrarLector = document.getElementById('cerrar-lector');

let todosLosProductos = [];

// Cargar categorías
const { data: categorias } = await supabase.from('categorias').select('*');
categorias.forEach(cat => {
  const option = document.createElement('option');
  option.value = cat.id;
  option.textContent = cat.nombre;
  select.appendChild(option);
});

function mostrarProductos(productos) {
  lista.innerHTML = '';

  if (!productos.length) {
    lista.innerHTML = 'No hay productos que coincidan.';
    return;
  }

  productos.forEach(prod => {
    const div = document.createElement('div');
    div.className = 'producto';
    div.innerHTML = `
      <div class="producto-info">
        <strong>${prod.nombre}</strong>
        <div class="producto-imagen">
          <img src="${prod.imagen_url}" alt="img" />
        </div>
        <div class="producto-piezas">${prod.piezas} pz en existencia</div>
      </div>
      <div class="producto-precio">$${prod.precio_venta}</div>
    `;

    div.addEventListener('click', () => {
      localStorage.setItem('codigo_barras', prod.id);
      window.location.href = 'productoexistente.html';
    });

    lista.appendChild(div);
  });
}

async function cargarProductos() {
  lista.innerHTML = 'Cargando...';
  const { data: productos, error } = await supabase.from('productos').select('*');
  if (error) {
    lista.innerHTML = 'Error al cargar productos.';
    return;
  }
  todosLosProductos = productos;
  aplicarFiltros();
}

function aplicarFiltros() {
  const categoria = select.value;
  const texto = buscador.value.trim().toLowerCase();

  let filtrados = [...todosLosProductos];

  if (categoria !== 'todas') {
    filtrados = filtrados.filter(p => p.categoria_id == categoria);
  }

  if (texto !== '') {
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes(texto) || p.id.toLowerCase().includes(texto)
    );
  }

  mostrarProductos(filtrados);
}

// Eventos de filtros
select.addEventListener('change', aplicarFiltros);
buscador.addEventListener('input', aplicarFiltros);

// Abrir lector
botonLector.addEventListener('click', () => {
  modalLector.classList.remove('oculto');
  const qr = new Html5Qrcode("lector");
  qr.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
    buscador.value = decodedText;
    aplicarFiltros();
    qr.stop();
    modalLector.classList.add('oculto');
  });
});

// Cerrar lector
cerrarLector.addEventListener('click', () => {
  modalLector.classList.add('oculto');
  Html5Qrcode.getCameras().then(cameras => {
    if (cameras.length) Html5Qrcode.stop();
  });
});

// Cargar al iniciar
cargarProductos();
