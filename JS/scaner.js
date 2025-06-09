window.addEventListener('DOMContentLoaded', async () => {
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

  btnAceptar.addEventListener('click', () => {
    const codigo = codeInput.value.trim();
    if (codigo) {
      // Guardar el código en localStorage y redirigir
      localStorage.setItem('codigo_barras', codigo);
      window.location.href ='nuevoproducto.html';
    } else {
      alert("Por favor escanea o escribe un código primero.");
    }
  });
});
