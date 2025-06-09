window.addEventListener('DOMContentLoaded', async () => {
  const supabase = window.supabase.createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5YnlubmlmeXV2YnVhY2FubGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTM1NzkxMCwiZXhwIjoyMDY0OTMzOTEwfQ.DEHEYiO2nLoG8lmjrVGAztOSeeIi2C8EL9_4IVoXUjk'
  );

  const codeInput = document.getElementById('codigo');
  const video = document.getElementById('scanner');
  const btnAceptar = document.getElementById('btn-aceptar');
  const codeReader = new ZXing.BrowserBarcodeReader();

  try {
    const devices = await codeReader.getVideoInputDevices();

    if (!devices.length) {
      alert("No se encontró ninguna cámara.");
      return;
    }

    const selectedDeviceId = devices[0].deviceId;

    codeReader.decodeFromVideoDevice(selectedDeviceId, video, (result, err) => {
      if (result) {
        codeInput.value = result.getText();
        codeReader.reset(); // Detener escaneo después de éxito
      }
    });
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

    // Guardar el código en localStorage
    localStorage.setItem('codigo_barras', codigo);

    // Consultar si el producto existe
    const { data, error } = await supabase
      .from('productos')
      .select('id')
      .eq('id', codigo)
      .single();

    if (data) {
      // Producto encontrado → redirigir a vista producto existente
      window.location.href = 'productoexistente.html';
    } else {
      // Producto no encontrado → redirigir a nuevo producto
      window.location.href = 'nuevoproducto.html';
    }
  });
});

