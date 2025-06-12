import { supabase } from './auth.js';

const listaProductos = document.getElementById('lista-productos');
const filtroCategorias = document.getElementById('filtro-categorias');
const buscarNombre = document.getElementById('buscar-nombre');
const modalProducto = document.getElementById('modal-producto');
const modalEscaner = document.getElementById('modal-escaner');

const modalImg = document.getElementById('modal-img');
const modalNombre = document.getElementById('modal-nombre');
const modalStock = document.getElementById('modal-stock');
const modalPrecio = document.getElementById('modal-precio');
const modalCantidad = document.getElementById('modal-cantidad');
const btnAgregar = document.getElementById('btn-agregar');

const listaVenta = document.getElementById('lista-venta');
const totalVenta = document.getElementById('total-venta');
const btnVender = document.getElementById('btn-vender');


let qrScanner = null; // global
let productos = [];
let carrito = [];
let productoActual = null;

// Cargar datos
await cargarCategorias();
await cargarProductos();

// Escáner
document.getElementById('btn-escaner').addEventListener('click', () => {
  modalEscaner.classList.remove('oculto');
  iniciarEscaner();
});

document.getElementById('cerrar-escaner').addEventListener('click', () => {
  modalEscaner.classList.add('oculto');
  detenerEscaner();
});

document.getElementById('buscar-por-codigo').addEventListener('click', () => {
  const codigo = document.getElementById('codigo-barras-input').value.trim();
  const encontrado = productos.find(p => p.id === codigo);
  if (encontrado) {
    mostrarModal(encontrado);
    detenerEscaner();
    modalEscaner.classList.add('oculto');
  }
});

// Cerrar modal producto
document.getElementById('cerrar-modal').addEventListener('click', () => {
  modalProducto.classList.add('oculto');
});

// Agregar a venta
btnAgregar.addEventListener('click', () => {
  const cantidad = parseInt(modalCantidad.value);
  if (!cantidad || cantidad < 1 || cantidad > productoActual.piezas) return;

  carrito.push({ ...productoActual, cantidad });
  renderCarrito();
  modalProducto.classList.add('oculto');
});

// Ejecutar venta
btnVender.addEventListener('click', async () => {
  for (let item of carrito) {
    const nuevoStock = item.piezas - item.cantidad;
    await supabase.from('productos').update({ piezas: nuevoStock }).eq('id', item.id);
  }
  carrito = [];
  renderCarrito();
  await cargarProductos();
});

// Filtros
filtroCategorias.addEventListener('change', renderProductos);
buscarNombre.addEventListener('input', renderProductos);

// Funciones de escáner
function iniciarEscaner() {
  if (qrScanner) {
    qrScanner.clear(); // limpiar anterior si existe
  }

  qrScanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: { width: 300, height: 150 },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.CODE_128
    ],
    rememberLastUsedCamera: true,
    supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
  });

  qrScanner.render(onScanSuccess, onScanFailure);
}

function onScanSuccess(decodedText) {
  const producto = productos.find(p => p.id === decodedText);
  if (producto) {
    detenerEscaner();
    document.getElementById('modal-escaner').classList.add('oculto');
    mostrarModal(producto);
    // 🔊 Opcional: sonido o vibración
    // new Audio("beep.mp3").play(); 
    if (navigator.vibrate) navigator.vibrate(100);
  }
}

function onScanFailure(error) {
  // Silencioso o mostrar log si deseas
}

function detenerEscaner() {
  if (qrScanner?.clear) qrScanner.clear();
}

// Renderizar
function mostrarModal(p) {
  productoActual = p;
  modalImg.src = p.imagen_url;
  modalNombre.textContent = p.nombre;
  modalStock.textContent = `Stock: ${p.piezas}`;
  modalPrecio.textContent = `Precio: $${p.precio_venta}`;
  modalCantidad.value = 1;
  modalProducto.classList.remove('oculto');
}

function renderCarrito() {
  listaVenta.innerHTML = '';
  let total = 0;
  carrito.forEach(p => {
    total += p.precio_venta * p.cantidad;
    const div = document.createElement('div');
    div.className = 'producto-venta';
    div.textContent = `${p.nombre} - ${p.cantidad} pz`;
    listaVenta.appendChild(div);
  });
  totalVenta.textContent = `$${total.toFixed(2)}`;
}

async function cargarCategorias() {
  const { data } = await supabase.from('categorias').select('*');
  filtroCategorias.innerHTML = `<option value="todas">Todas</option>`;
  data.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.nombre;
    filtroCategorias.appendChild(opt);
  });
}

async function cargarProductos() {
  const { data } = await supabase.from('productos').select('*');
  productos = data;
  renderProductos();
}

function renderProductos() {
  const filtro = filtroCategorias.value;
  const texto = buscarNombre.value.toLowerCase();

  const filtrados = productos.filter(p => {
    const coincideCategoria = filtro === 'todas' || p.categoria_id == filtro;
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    return coincideCategoria && coincideTexto;
  });

  listaProductos.innerHTML = '';
  filtrados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `<img src="${p.imagen_url}" /><p>${p.nombre}</p>`;
    card.addEventListener('click', () => mostrarModal(p));
    listaProductos.appendChild(card);
  });
}
