export default async function scaner(BrowserBarcodeReader, createClient) {
  const supabase = createClient(
    'https://qybynnifyuvbuacanlaa.supabase.co',
    'sb_publishable_K_PvlrO6Wgzz7baowzePTw_LV8OnThe'
  );

  const codeInput = document.getElementById('codigo');
  const video = document.getElementById('scanner');
  const btnAceptar = document.getElementById('btn-aceptar');
  const btnFlash = document.getElementById('btn-flash');

  const codeReader = new BrowserBarcodeReader();

  let videoTrack = null;
  let torchOn = false;

  // Para evitar que el botón "parpadee"
  let torchChecked = false;
  let torchSupported = false;

  const setFlashUI = (supported) => {
    if (!btnFlash) return;

    // ✅ Nunca ocultamos el botón (así no aparece/desaparece)
    btnFlash.classList.toggle('is-disabled', !supported);
    btnFlash.classList.toggle('is-on', torchOn);

    btnFlash.setAttribute(
      'aria-label',
      !supported ? 'Flash no disponible' : (torchOn ? 'Apagar flash' : 'Encender flash')
    );
  };

  const initTorchSupportOnce = () => {
    if (torchChecked) return;

    const stream = video?.srcObject;
    const track = stream?.getVideoTracks?.()?.[0] || null;

    if (!track) return; // aún no hay stream

    videoTrack = track;

    const caps = videoTrack.getCapabilities?.();
    torchSupported = !!caps?.torch;

    torchChecked = true;
    setFlashUI(torchSupported);
  };

  const setTorch = async (on) => {
    if (!videoTrack) return false;
    try {
      await videoTrack.applyConstraints({ advanced: [{ torch: !!on }] });
      return true;
    } catch (e) {
      console.warn('No se pudo cambiar torch:', e);
      return false;
    }
  };

  // Estado inicial del botón: visible pero deshabilitado (evita parpadeo)
  if (btnFlash) setFlashUI(false);

  try {
    const devices = await codeReader.getVideoInputDevices();

    if (!devices.length) {
      alert("No se encontró ninguna cámara.");
      return;
    }

    // Buscar cámara trasera por nombre
    let backCamera = devices.find(d => /back|rear|environment/i.test(d.label));
    if (!backCamera) backCamera = devices[devices.length - 1];

    const constraints = {
      video: {
        deviceId: backCamera.deviceId,
        facingMode: { ideal: "environment" }
      }
    };

    await codeReader.decodeFromConstraints(constraints, video, async (result, err) => {
      // ✅ Cuando ya existe el stream, detectamos torch 1 sola vez
      initTorchSupportOnce();

      if (result) {
        codeInput.value = result.getText();

        // Apagar flash al terminar, si estaba encendido
        if (torchOn) {
          await setTorch(false);
          torchOn = false;
          setFlashUI(torchSupported);
        }

        codeReader.reset(); // detener escaneo tras éxito
      }
    });

  } catch (err) {
    console.error("Error al iniciar el escáner:", err);
    alert("Error al iniciar el escáner: " + err.message);
  }

  // 🔦 Flash toggle
  if (btnFlash) {
    btnFlash.addEventListener('click', async () => {
      // Si aún no tenemos el track (timing), intentamos inicializar
      initTorchSupportOnce();

      if (!torchSupported) {
        alert("Tu dispositivo/navegador no permite activar el flash desde la web.");
        setFlashUI(false);
        return;
      }

      torchOn = !torchOn;
      const ok = await setTorch(torchOn);

      if (!ok) {
        torchOn = false;
        alert("No se pudo activar el flash. (Puede no estar soportado en este navegador)");
      }

      setFlashUI(torchSupported);
    });
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

