window.addEventListener('DOMContentLoaded', async () => {
  const codeInput = document.getElementById('codigo');
  const video = document.getElementById('scanner');
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

  document.getElementById('btn-aceptar').addEventListener('click', () => {
    const codigo = codeInput.value.trim();
    if (codigo) {
      alert(`Código capturado: ${codigo}`);
    } else {
      alert("Escanea o escribe un código.");
    }
  });
});
