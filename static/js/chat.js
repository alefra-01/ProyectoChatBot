// Referencias a los elementos del HTML
const formulario = document.forms["EnvioPost"];
const campoMensaje = document.getElementById("mensaje");
const apartadoChat = document.getElementById("ApartadoChat");
const botonEnviar = formulario.querySelector("button[type='submit']");
const avisoSinTokens = document.getElementById("NoTokensConexion");

function pintarMensaje(autor, texto) {
    const fila = document.createElement("div");
    fila.classList.add("mensaje");

    const burbuja = document.createElement("div");
    burbuja.classList.add("burbuja");
    burbuja.textContent = texto;

    if (autor === "Tu") {

        fila.classList.add("mensaje--tu");
        fila.appendChild(burbuja);
    } else if (autor === "Sistema") {

        fila.classList.add("mensaje--sistema");
        fila.appendChild(burbuja);
    } else {

        fila.classList.add("mensaje--raski");
        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        avatar.textContent = "R";
        fila.appendChild(avatar);
        fila.appendChild(burbuja);
    }

    apartadoChat.appendChild(fila);
    // Baja el scroll hasta el ultimo mensaje
    apartadoChat.scrollTop = apartadoChat.scrollHeight;
}

// Intercepta el envio del formulario
formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const mensaje = campoMensaje.value.trim();

    if (mensaje === "") {
        return;
    }
    if (mensaje.length > 1000) {
        pintarMensaje("Sistema", "El mensaje es demasiado largo (max. 1000 caracteres).");
        return;
    }

    pintarMensaje("Tu", mensaje);
    campoMensaje.value = "";

    try {
        const respuestaHttp = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ mensaje: mensaje })
        });

        const datos = await respuestaHttp.json();

        if (datos.sin_tokens) {
            mostrarSinTokens();
        } else if (datos.error) {
            pintarMensaje("Sistema", datos.error);
        } else {
            pintarMensaje("Raskolnikov", datos.respuesta);
        }
    } catch (error) {
        mostrarSinTokens();
    }
});

function mostrarSinTokens() {
    avisoSinTokens.hidden = false;
    if (botonEnviar) botonEnviar.hidden = true;
}
