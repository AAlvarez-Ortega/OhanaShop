
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

const select           = document.getElementById('filtro-categorias');
const lista            = document.getElementById('lista-productos');
const buscador         = document.getElementById('buscar-nombre');
const totalProductos   = document.getElementById('total-productos');
const totalPiezas      = document.getElementById('total-piezas');

// Referencias al modal
const modal         = document.getElementById('modal-producto');
const cerrarModal   = document.getElementById('cerrar-modal');
const modalImg      = document.getElementById('modal-img');
const modalNombre   = document.getElementById('modal-nombre');
const modalCodigo   = document.getElementById('modal-codigo');
const modalPrecio   = document.getElementById('modal-precio');
const modalPiezas   = document.getElementById('modal-piezas');
const btnAgregarStock = document.getElementById('btn-agregar-stock');

let todosLosProductos = [];

/** ———— Funciones del modal ———— **/
function openModal(prod) {
  modalImg.src             = prod.imagen_url;
  modalNombre.textContent  = prod.nombre;
  modalCodigo.textContent  = `Código de barras: ${prod.id}`;
  modalPrecio.innerHTML    = `Precio compra: $${prod.precio_compra}<br>Precio venta: $${prod.precio_venta}`;
  modalPiezas.textContent  = `Piezas: ${prod.piezas}`;
  btnAgregarStock.onclick = () => {
        localStorage.setItem('codigo_barras', prod.id);
        window.location.href = 'productoexistente.html';
      };

  modal.classList.remove('oculto');
}

function closeModal() {
  modal.classList.add('oculto');
}

// Cerrar modal al hacer clic en la “X”
cerrarModal.addEventListener('click', closeModal);
// Cerrar modal al hacer clic fuera del contenido
modal.addEventListener('click', e => {
  if (e.target === modal) closeModal();
});

/** ———— Carga de datos ———— **/
async function cargarResumen() {
  const { data, error } = await supabase
    .from('Almacen')
    .select('*')
    .single();
  if (!error && data) {
    totalProductos.textContent = `Productos: ${data.total_productos}`;
    totalPiezas.textContent    = `Piezas totales: ${data.total_piezas}`;
  }
}

async function cargarCategorias() {
  const { data: categorias, error } = await supabase
    .from('categorias')
    .select('*');
  if (!error && categorias) {
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value   = cat.id;
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  }
}

async function cargarProductos() {
  lista.innerHTML = 'Cargando...';
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*');
  if (error) {
    lista.innerHTML = 'Error al cargar productos.';
    return;
  }
  todosLosProductos = productos;
  aplicarFiltros();
}

/** ———— Filtrado y renderizado ———— **/
function aplicarFiltros() {
  const categoria = select.value;
  const texto     = buscador.value.trim().toLowerCase();

  let filtrados = [...todosLosProductos];
  if (categoria !== 'todas') {
    filtrados = filtrados.filter(p => p.categoria_id == categoria);
  }
  if (texto !== '') {
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes(texto) ||
      p.id.toLowerCase().includes(texto)
    );
  }
  mostrarProductos(filtrados);
}

function mostrarProductos(productos) {
  lista.innerHTML = '';

  if (!productos.length) {
    lista.innerHTML = 'No hay productos que coincidan.';
    return;
  }

  productos.forEach(prod => {
    const div = document.createElement('div');
    div.className = `producto tarjeta-mosaico${prod.piezas === 0 ? ' agotado' : ''}`;
    div.innerHTML = `
      <div class="producto-imagen">
        <img src="${prod.imagen_url}" alt="${prod.nombre}" />
      </div>
    `;

    // Al hacer clic en la tarjeta, abrimos el modal
    div.addEventListener('click', () => openModal(prod));
    lista.appendChild(div);
  });
}

/** ———— Eventos de UI ———— **/
select.addEventListener('change', aplicarFiltros);
buscador.addEventListener('input', aplicarFiltros);

/** ———— Inicialización ———— **/
await cargarResumen();
await cargarCategorias();
cargarProductos();
