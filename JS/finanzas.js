// JS/finanzas.js
import { supabase } from './auth.js';

const resumenEl = document.getElementById('resumen-ventas');
const horarioEl = document.getElementById('ventas-horario');

/**
 * Formatea un timestamp a “YYYY-MM-DD HH:MM:SS”
 * para agrupar ventas que ocurren en el mismo segundo.
 */
function formatSecond(dateStr) {
  const d = new Date(dateStr);
  const pad = n => n < 10 ? '0' + n : n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Consulta la vista resumen_ventas y muestra los totales.
 */
async function renderResumen() {
  const { data, error } = await supabase
    .from('resumen_ventas')
    .select('*')
    .single();
  if (error) {
    console.error('Error cargando resumen_ventas:', error);
    resumenEl.innerHTML = `<p>Error cargando resumen.</p>`;
    return;
  }
  resumenEl.innerHTML = `
    <p><strong>Total piezas vendidas:</strong> ${data.total_piezas_vendidas}</p>
    <p><strong>Total ventas:</strong> $${data.total_ventas}</p>
    <p><strong>Total inversión:</strong> $${data.total_inversion}</p>
    <p><strong>Total utilidad:</strong> $${data.total_utilidad}</p>
  `;
}

/**
 * Consulta todas las ventas, las agrupa por segundo exacto,
 * y renderiza una tarjeta para cada grupo.
 */
async function renderHistorial() {
  const { data: ventas, error } = await supabase
    .from('ventas')
    .select('*')
    .order('fecha_venta', { ascending: true });
  if (error) {
    console.error('Error cargando ventas:', error);
    horarioEl.innerHTML = `<p>Error cargando historial de ventas.</p>`;
    return;
  }

  // Agrupar ventas por segundo
  const groups = {};
  ventas.forEach(v => {
    const key = formatSecond(v.fecha_venta);
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  });

  // Limpiar y renderizar grupos
  horarioEl.innerHTML = '';
  Object.entries(groups).forEach(([timestamp, ventasSeg]) => {
    const card = document.createElement('div');
    card.className = 'venta-hora-card';
    let html = `<h3>${timestamp}</h3><ul>`;
    ventasSeg.forEach(v => {
      html += `
        <li>
          ${v.nombre_producto} —
          ${v.piezas_vendidas} pz —
          Total: $${v.total_venta.toFixed(2)} —
          Utilidad: $${v.utilidad.toFixed(2)}
        </li>
      `;
    });
    html += `</ul>`;
    card.innerHTML = html;
    horarioEl.appendChild(card);
  });
}

// Al cargar la página, invocar renderizado
document.addEventListener('DOMContentLoaded', async () => {
  await renderResumen();
  await renderHistorial();
});
