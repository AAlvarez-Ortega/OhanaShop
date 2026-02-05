export default async function scaner(BrowserBarcodeReader, createClient) {

  const supabase = createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
  );

  const codeInput = document.getElementById('codigo');
  const video = document.getElementById('scanner');
  const btnAceptar = document.getElementById('btn-aceptar');

  const codeReader = new BrowserBarcodeReader();

  try {

    const devices = await codeReader.getVideoInputDevices();

    if (!devices.length) {
      alert("No se encontró ninguna cámara.");
      return;
    }

    // 🔥 Buscar cámara trasera por nombre
    let backCamera = devices.find(device =>
      /back|rear|environment/i.test(device.label)
    );

    // Si no la encuentra → fallback a la última (suele ser trasera)
    if (!backCamera) {
      backCamera = devices[devices.length - 1];
    }

    // 🧠 Intentar forzar facingMode
    const constraints = {
      video: {
        deviceId: backCamera.deviceId,
        facingMode: { ideal: "environment" }
      }
    };

    await codeReader.decodeFromConstraints(
      constraints,
      video,
      (result, err) => {
        if (result) {
          codeInput.value = result.getText();
          codeReader.reset();
        }
      }
    );

  } catch (err) {
    console.error("Error al iniciar el escáner:", err);
    alert("Error al iniciar el escáner: " + err.message);
  }

  btnAceptar.addEventListener('click', async () => {

    const codigo = codeInput.value.trim();

    if (!codigo) {
      alert("Por favor escanea o escribe un código primero.");
      return;
    }

    localStorage.setItem('codigo_barras', codigo);

    const { data } = await supabase
      .from('productos')
      .select('id')
      .eq('id', codigo)
      .single();

    if (data) {
      window.location.href = 'productoexistente.html';
    } else {
      window.location.href = 'nuevoproducto.html';
    }

  });
}
