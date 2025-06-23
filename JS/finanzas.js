// JS/finanzas.js
import { supabase } from './auth.js';

function formatSecond(dateStr) {
  const d = new Date(dateStr);
  const pad = n => n < 10 ? '0'+n : n;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} `
       + `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const resumenEl     = document.getElementById('resumen-ventas');
  const horarioEl     = document.getElementById('ventas-horario');
  const fechaInicioEl = document.getElementById('fecha-inicio');
  const fechaFinEl    = document.getElementById('fecha-fin');
  const btnFiltrar    = document.getElementById('btn-filtrar');
  const btnLimpiar    = document.getElementById('btn-limpiar');

  async function renderResumen(fi, ff) {
    let q = supabase.from('ventas')
      .select('piezas_vendidas, total_venta, inversion, utilidad');
    if (fi) q = q.gte('fecha_venta', fi);
    if (ff) q = q.lte('fecha_venta', ff + 'T23:59:59');
    const { data, error } = await q;
    if (error) {
      resumenEl.innerHTML = '<p>Error cargando resumen.</p>';
      return;
    }
    const sum = data.reduce((a,v)=>({
      piezas:    a.piezas    + v.piezas_vendidas,
      ventas:    a.ventas    + parseFloat(v.total_venta),
      inversion: a.inversion + parseFloat(v.inversion),
      utilidad:  a.utilidad  + parseFloat(v.utilidad)
    }), { piezas:0, ventas:0, inversion:0, utilidad:0 });
    resumenEl.innerHTML = `
      <p><strong>Total piezas vendidas:</strong> ${sum.piezas}</p>
      <p><strong>Total ventas:</strong> $${sum.ventas.toFixed(2)}</p>
      <p><strong>Total inversión:</strong> $${sum.inversion.toFixed(2)}</p>
      <p><strong>Total utilidad:</strong> $${sum.utilidad.toFixed(2)}</p>
    `;
  }

  async function renderHistorial(fi, ff) {
    let q = supabase.from('ventas')
      .select('*')
      .order('fecha_venta', { ascending: true });
    if (fi) q = q.gte('fecha_venta', fi);
    if (ff) q = q.lte('fecha_venta', ff + 'T23:59:59');
    const { data: ventas, error } = await q;
    if (error) {
      horarioEl.innerHTML = '<p>Error cargando historial.</p>';
      return;
    }
    const groups = {};
    ventas.forEach(v => {
      const key = formatSecond(v.fecha_venta);
      (groups[key] = groups[key]||[]).push(v);
    });
    horarioEl.innerHTML = '';
    for (const [ts, list] of Object.entries(groups)) {
      const card = document.createElement('div');
      card.className = 'venta-hora-card';
      let html = `<h3>${ts}</h3><ul>`;
      list.forEach(v => {
        html += `<li>
          ${v.nombre_producto} —
          ${v.piezas_vendidas} pz —
          Total: $${v.total_venta.toFixed(2)} —
          Utilidad: $${v.utilidad.toFixed(2)}
        </li>`;
      });
      card.innerHTML = html + '</ul>';
      horarioEl.appendChild(card);
    }
  }

  // Filtrar
  btnFiltrar.addEventListener('click', async () => {
    const fi = fechaInicioEl.value;
    const ff = fechaFinEl.value;
    await renderResumen(fi, ff);
    await renderHistorial(fi, ff);
  });

  // Limpiar selección
  btnLimpiar.addEventListener('click', async () => {
    fechaInicioEl.value = '';
    fechaFinEl.value    = '';
    await renderResumen();
    await renderHistorial();
  });

  // Al inicio sin filtro
  await renderResumen();
  await renderHistorial();
});
