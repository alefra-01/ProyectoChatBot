// Referencias a los elementos del HTML
const formulario = document.forms["EnvioPost"];
const campoMensaje = document.getElementById("mensaje");
const apartadoChat = document.getElementById("ApartadoChat");

// Pinta un mensaje en el chat de forma SEGURA, con su burbuja segun el autor.
// Usamos textContent (NO innerHTML): asi, aunque alguien escriba algo como
// "<img src=x onerror=alert(1)>", se mostrara como texto y nunca se ejecutara.
// Esto vale tanto para tu mensaje como para la respuesta del modelo.
function pintarMensaje(autor, texto) {
    const fila = document.createElement("div");
    fila.classList.add("mensaje");

    const burbuja = document.createElement("div");
    burbuja.classList.add("burbuja");
    burbuja.textContent = texto;

    if (autor === "Tu") {
        // Tus mensajes: burbuja oscura a la derecha
        fila.classList.add("mensaje--tu");
        fila.appendChild(burbuja);
    } else if (autor === "Sistema") {
        // Avisos del sistema: nota discreta centrada
        fila.classList.add("mensaje--sistema");
        fila.appendChild(burbuja);
    } else {
        // Raskolnikov: avatar + burbuja clara a la izquierda
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
    evento.preventDefault(); // evita que el navegador recargue la pagina

    const mensaje = campoMensaje.value.trim();

    // Validacion en el cliente (la de verdad esta en el servidor)
    if (mensaje === "") {
        return;
    }
    if (mensaje.length > 1000) {
        pintarMensaje("Sistema", "El mensaje es demasiado largo (max. 1000 caracteres).");
        return;
    }

    // Pinta tu propio mensaje y limpia el campo
    pintarMensaje("Tu", mensaje);
    campoMensaje.value = "";

    try {
        // Manda el mensaje al servidor en segundo plano (AJAX), sin recargar.
        // La cookie de sesion se envia sola al ser el mismo origen.
        const respuestaHttp = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ mensaje: mensaje })
        });

        const datos = await respuestaHttp.json();

        // El servidor puede devolver {"error": "..."} si rechaza el mensaje
        if (datos.error) {
            pintarMensaje("Sistema", datos.error);
        } else {
            pintarMensaje("Raskolnikov", datos.respuesta);
        }
    } catch (error) {
        pintarMensaje("Sistema", "No se pudo contactar con el servidor.");
    }
});
