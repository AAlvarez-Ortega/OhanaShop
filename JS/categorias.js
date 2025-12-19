const supabase = window.supabase.createClient(
  'https://qybynnifyuvbuacanlaa.supabase.co',
  'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
);

document.addEventListener('DOMContentLoaded', () => {
  const buscarInput = document.getElementById('buscar-categoria');
  const mensaje = document.getElementById('mensaje');
  const lista = document.getElementById('lista-categorias');

  const modal = document.getElementById('modal-categoria');
  const cerrarModal = document.getElementById('cerrar-modal');
  const modalNombre = document.getElementById('modal-nombre');
  const btnEditar = document.getElementById('btn-editar');
  const btnEliminar = document.getElementById('btn-eliminar');

  const modalAgregar = document.getElementById('modal-agregar');
  const abrirAgregar = document.getElementById('abrir-agregar');
  const cerrarAgregar = document.getElementById('cerrar-agregar');
  const inputNueva = document.getElementById('nombre-nueva');
  const btnAgregar = document.getElementById('btn-agregar');

  let categoriasGlobal = [];
  let idSeleccionado = null;

  // 🔍 Buscar categoría por texto
  buscarInput.addEventListener('input', () => {
    const texto = buscarInput.value.toLowerCase();
    const filtradas = categoriasGlobal.filter(c => c.nombre.toLowerCase().includes(texto));
    renderizarCategorias(filtradas);
  });

  // ➕ Abrir modal de agregar
  abrirAgregar.addEventListener('click', () => {
    inputNueva.value = '';
    modalAgregar.classList.remove('oculto');
  });

  cerrarAgregar.addEventListener('click', () => {
    modalAgregar.classList.add('oculto');
  });

  modalAgregar.addEventListener('click', (e) => {
    if (e.target === modalAgregar) {
      modalAgregar.classList.add('oculto');
    }
  });

  btnAgregar.addEventListener('click', async () => {
    const nombre = inputNueva.value.trim();
    if (!nombre) return;

    const { error } = await supabase.from('categorias').insert([{ nombre }]);
    if (error) {
      alert("❌ Error al guardar");
    } else {
      modalAgregar.classList.add('oculto');
      cargarCategorias();
    }
  });

  // 📝 Modal edición
  btnEditar.addEventListener('click', async () => {
    const nuevoNombre = modalNombre.value.trim();
    if (!nuevoNombre) return;
    const { error } = await supabase.from('categorias').update({ nombre: nuevoNombre }).eq('id', idSeleccionado);
    if (error) {
      alert('❌ Error al actualizar');
    } else {
      modal.classList.add('oculto');
      cargarCategorias();
    }
  });

  btnEliminar.addEventListener('click', async () => {
    const confirmar = confirm('¿Estás seguro de eliminar esta categoría?');
    if (!confirmar) return;
    const { error } = await supabase.from('categorias').delete().eq('id', idSeleccionado);
    if (error) {
      alert('❌ Error al eliminar');
    } else {
      modal.classList.add('oculto');
      cargarCategorias();
    }
  });

  cerrarModal.addEventListener('click', () => modal.classList.add('oculto'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('oculto');
  });

  // 🧩 Renderizar categorías
  function renderizarCategorias(listaFiltrada) {
    lista.innerHTML = '';
    listaFiltrada.forEach(cat => {
      const li = document.createElement('li');
      li.textContent = cat.nombre;
      li.addEventListener('click', () => {
        modal.classList.remove('oculto');
        modalNombre.value = cat.nombre;
        idSeleccionado = cat.id;
      });
      lista.appendChild(li);
    });
  }

  // 🚀 Cargar categorías
  async function cargarCategorias() {
    const { data, error } = await supabase.from('categorias').select('*').order('nombre', { ascending: true });
    if (error) {
      mensaje.textContent = "❌ Error al cargar categorías";
      return;
    }
    categoriasGlobal = data;
    renderizarCategorias(data);
  }

  cargarCategorias();
});
