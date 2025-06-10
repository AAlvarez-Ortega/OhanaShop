import { BrowserBarcodeReader } from "https://cdn.jsdelivr.net/npm/@zxing/library@latest/+esm";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// Inicializar cliente Supabase
const supabase = createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
);

// Elementos del DOM
const video = document.getElementById('scanner');
const codigoInput = document.getElementById('codigo');
const btnAceptar = document.getElementById('btn-aceptar');
const resultado = document.getElementById('resultado');
const nombreEl = document.getElementById('nombre');
const descripcionEl = document.getElementById('descripcion');
const precioEl = document.getElementById('precio_venta');
const piezasEl = document.getElementById('piezas');
const cantidadInput = document.getElementById('cantidad_vender');
const btnVender = document.getElementById('btn-vender');

// Inicializar lector de códigos de barras
const codeReader = new BrowserBarcodeReader();

// Función para iniciar el escáner
async function iniciarEscaner() {
  try {
    const devices = await codeReader.getVideoInputDevices();
    if (devices.length) {
      const selectedDeviceId = devices[0].deviceId;
      codeReader.decodeFromVideoDevice(selectedDeviceId, video, (result) => {
        if (result) {
          codigoInput.value = result.getText();
          codeReader.reset();
        }
      });
    } else {
      alert("No se encontró cámara");
    }
  } catch (error) {
    alert("Error escáner: " + error.message);
  }
}

// Función para buscar y mostrar el producto
async function buscarProducto(codigo) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', codigo)
    .single();

  if (error || !data) {
    alert("Producto no encontrado");
    resultado.style.display = 'none';
    return;
  }

  // Mostrar datos en la tarjeta
  nombreEl.textContent = data.nombre;
  descripcionEl.textContent = data.descripcion;
  precioEl.textContent = data.precio_venta;
  piezasEl.textContent = data.piezas;
  resultado.dataset.id = data.id;
  resultado.dataset.piezas = data.piezas;
  resultado.style.display = 'block';
  document.getElementById('imagen_producto').src = data.imagen_url;

}

// Función para procesar la venta
async function venderProducto() {
  const id = resultado.dataset.id;
  const piezasDisponibles = parseInt(resultado.dataset.piezas);
  const cantidad = parseInt(cantidadInput.value);

  if (isNaN(cantidad) || cantidad <= 0) {
    alert("Ingresa una cantidad válida");
    return;
  }

  if (cantidad > piezasDisponibles) {
    alert("No hay suficientes piezas en existencia");
    return;
  }

  const nuevasPiezas = piezasDisponibles - cantidad;

  const { error } = await supabase
    .from('productos')
    .update({ piezas: nuevasPiezas })
    .eq('id', id);

  if (error) {
    alert("Error al vender: " + error.message);
  } else {
    alert("Venta registrada con éxito.");
    await buscarProducto(id); // Actualizar datos
  }
}

// Eventos
btnAceptar.addEventListener('click', () => {
  const codigo = codigoInput.value.trim();
  if (codigo) buscarProducto(codigo);
});

btnVender.addEventListener('click', venderProducto);

// Arrancar escáner

iniciarEscaner();