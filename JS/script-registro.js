function validarFormulario() {
  const pass = document.getElementById("password").value;
  const confirmPass = document.getElementById("confirm-password").value;

  if (pass !== confirmPass) {
    alert("Las contraseñas no coinciden.");
    return false;
  }

  alert("¡Registro exitoso!");
  return true;
}
