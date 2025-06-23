// JS/ventas.js
import { supabase } from './auth.js';
import { BrowserMultiFormatReader } from "https://cdn.jsdelivr.net/npm/@zxing/browser@latest/+esm";

const codeReader         = new BrowserMultiFormatReader();

const listaProductos     = document.getElementById('lista-productos');
const filtroCategorias   = document.getElementById('filtro-categorias');
const buscarNombre       = document.getElementById('buscar-nombre');
const modalProducto      = document.getElementById('modal-producto');
const modalEscaner       = document.getElementById('modal-escaner');

const modalImg           = document.getElementById('modal-img');
const modalNombre        = document.getElementById('modal-nombre');
const modalStock         = document.getElementById('modal-stock');
const modalPrecio        = document.getElementById('modal-precio');
const modalCantidad      = document.getElementById('modal-cantidad');
const btnAgregar         = document.getElementById('btn-agregar');
const btnEscaner         = document.getElementById('btn-escaner');
const cerrarEscaner      = document.getElementById('cerrar-escaner');
const btnCapturar        = document.getElementById('btn-capturar');
const btnBuscarPorCodigo = document.getElementById('buscar-por-codigo');
const inputCodigo        = document.getElementById('codigo-barras-input');
const btnVender          = document.getElementById('btn-vender');
const cerrarModal        = document.getElementById('cerrar-modal');

const listaVenta         = document.getElementById('lista-venta');
const totalVenta         = document.getElementById('total-venta');

let productos = [];
let carrito   = [];
let productoActual = null;
let videoInputDevice = null;

// Detiene el escáner
function detenerZXing() {
  codeReader.reset();
}

// Procesa un código de barras detectado
function procesarCodigo(codigo) {
  const producto = productos.find(p => p.id === codigo);
  if (producto) {
    mostrarModal(producto);
    if (navigator.vibrate) navigator.vibrate(100);
  } else {
    alert('Producto no encontrado: ' + codigo);
  }
}

// Muestra el modal de detalle de producto
function mostrarModal(p) {
  productoActual = p;
  modalImg.src     = p.imagen_url;
  modalNombre.textContent = p.nombre;
  modalStock.textContent  = `Stock: ${p.piezas}`;
  modalPrecio.textContent = `Precio: $${p.precio_venta}`;
  modalCantidad.value     = 1;
  modalProducto.classList.remove('oculto');
}

// Agregar producto al carrito desde el modal
btnAgregar.addEventListener('click', () => {
  const cantidad = parseInt(modalCantidad.value, 10);
  if (!cantidad || cantidad < 1 || cantidad > productoActual.piezas) return;
  carrito.push({ ...productoActual, cantidad });
  renderCarrito();
  modalProducto.classList.add('oculto');
});

// Abrir modal de escáner
btnEscaner.addEventListener('click', () => {
  modalEscaner.classList.remove('oculto');
  iniciarZXing();
});

// Capturar imagen y escanear
btnCapturar.addEventListener('click', async () => {
  await detenerZXing();
  const result = await codeReader.decodeOnceFromVideoDevice(videoInputDevice.deviceId, videoElement);
  procesarCodigo(result.getText());
  modalEscaner.classList.add('oculto');
});

// Buscar por código manualmente
btnBuscarPorCodigo.addEventListener('click', () => {
  const codigo = inputCodigo.value.trim();
  const encontrado = productos.find(p => p.id === codigo);
  if (encontrado) {
    mostrarModal(encontrado);
    detenerZXing();
    modalEscaner.classList.add('oculto');
  } else {
    alert('Producto no encontrado: ' + codigo);
  }
});

// Cerrar modal escáner
cerrarEscaner.addEventListener('click', () => {
  detenerZXing();
  modalEscaner.classList.add('oculto');
});

// Vender: registrar en ventas y actualizar stock
btnVender.addEventListener('click', async () => {
  if (!carrito.length) return alert('No hay productos para vender');
  for (let item of carrito) {
    // 1) Registrar venta
    const { error: errVenta } = await supabase
      .from('ventas')
      .insert({
        producto_id:     item.id,
        nombre_producto: item.nombre,
        precio_compra:   item.precio_compra,
        precio_venta:    item.precio_venta,
        piezas_vendidas: item.cantidad
      });
    if (errVenta) console.error('Error al registrar venta:', errVenta);

    // 2) Actualizar stock
    const nuevoStock = item.piezas - item.cantidad;
    const { error: errStock } = await supabase
      .from('productos')
      .update({ piezas: nuevoStock })
      .eq('id', item.id);
    if (errStock) console.error('Error al actualizar stock:', errStock);
  }
  carrito = [];
  renderCarrito();
  await cargarProductos();
  alert('Venta registrada correctamente');
});

// Cerrar modal producto
cerrarModal.addEventListener('click', () => {
  modalProducto.classList.add('oculto');
});

// Renderizar carrito
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

// Iniciar escáner ZXing
async function iniciarZXing() {
  const devices = await codeReader.listVideoInputDevices();
  if (devices.length) {
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

// Cargar categorías al filtro
async function cargarCategorias() {
  const { data: cats } = await supabase.from('categorias').select('*');
  filtroCategorias.innerHTML = `<option value="todas">Todas</option>`;
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value       = cat.id;
    opt.textContent = cat.nombre;
    filtroCategorias.appendChild(opt);
  });
}

// Cargar productos desde la base
async function cargarProductos() {
  const { data } = await supabase.from('productos').select('*');
  productos = data;
  renderProductos();
}

// Renderizar tarjetas de productos con indicador de “agotado”
function renderProductos() {
  const filtro = filtroCategorias.value;
  const texto  = buscarNombre.value.toLowerCase();

  const filtrados = productos.filter(p => {
    const coincideCat   = filtro === 'todas' || p.categoria_id == filtro;
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    return coincideCat && coincideTexto;
  });

  listaProductos.innerHTML = '';
  filtrados.forEach(p => {
    const card = document.createElement('div');
    // 👉 Si no hay piezas, marca como 'agotado'
    card.className = `producto-card${p.piezas === 0 ? ' agotado' : ''}`;
    card.innerHTML = `<img src="${p.imagen_url}" /><p>${p.nombre}</p>`;
    card.addEventListener('click', () => mostrarModal(p));
    listaProductos.appendChild(card);
  });
}

// Filtrar al cambiar select o escribir
filtroCategorias.addEventListener('change', renderProductos);
buscarNombre.addEventListener('input', renderProductos);

// Inicializar
await cargarCategorias();
await cargarProductos();
