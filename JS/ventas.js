import { supabase } from './auth.js';
import { BrowserMultiFormatReader } from "https://cdn.jsdelivr.net/npm/@zxing/browser@latest/+esm";

const codeReader = new BrowserMultiFormatReader();

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

const videoElement = document.getElementById('preview-cam');
const btnEscaner = document.getElementById('btn-escaner');
const cerrarEscaner = document.getElementById('cerrar-escaner');

let productos = [];
let carrito = [];
let productoActual = null;

let videoInputDevice = null;

// Escáner
btnEscaner.addEventListener('click', () => {
  modalEscaner.classList.remove('oculto');
  iniciarZXing();
});

cerrarEscaner.addEventListener('click', () => {
  detenerZXing();
  modalEscaner.classList.add('oculto');
});

document.getElementById('buscar-por-codigo').addEventListener('click', () => {
  const codigo = document.getElementById('codigo-barras-input').value.trim();
  const encontrado = productos.find(p => p.id === codigo);
  if (encontrado) {
    mostrarModal(encontrado);
    detenerZXing();
    modalEscaner.classList.add('oculto');
  }
});

// Modal producto
btnAgregar.addEventListener('click', () => {
  const cantidad = parseInt(modalCantidad.value);
  if (!cantidad || cantidad < 1 || cantidad > productoActual.piezas) return;
  carrito.push({ ...productoActual, cantidad });
  renderCarrito();
  modalProducto.classList.add('oculto');
});

btnVender.addEventListener('click', async () => {
  for (let item of carrito) {
    const nuevoStock = item.piezas - item.cantidad;
    await supabase.from('productos').update({ piezas: nuevoStock }).eq('id', item.id);
  }
  carrito = [];
  renderCarrito();
  await cargarProductos();
});

document.getElementById('cerrar-modal').addEventListener('click', () => {
  modalProducto.classList.add('oculto');
});

filtroCategorias.addEventListener('change', renderProductos);
buscarNombre.addEventListener('input', renderProductos);

async function iniciarZXing() {
  const devices = await codeReader.listVideoInputDevices();
  if (devices.length > 0) {
    videoInputDevice = devices[0];
    await codeReader.decodeFromVideoDevice(videoInputDevice.deviceId, videoElement, (result, err) => {
      if (result) {
        procesarCodigo(result.getText());
        detenerZXing();
      }
    });
  } else {
    alert("No se detectó cámara.");
  }
}

function detenerZXing() {
  codeReader.reset();
}

function procesarCodigo(codigo) {
  const producto = productos.find(p => p.id === codigo);
  if (producto) {
    mostrarModal(producto);
    if (navigator.vibrate) navigator.vibrate(100);
  } else {
    alert('Producto no encontrado: ' + codigo);
  }
}

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

// Inicialización
await cargarCategorias();
await cargarProductos();
