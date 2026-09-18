// ============================================================
// Sistema de testimonios (público) — Bienestar Integral
// - Carga y muestra únicamente testimonios con estado "aprobado"
// - Permite dejar un nuevo testimonio, que queda "pendiente"
//   hasta que sea revisado desde el panel de administración
// ============================================================
(function () {
  "use strict";

  // Escapa cualquier texto antes de insertarlo como HTML,
  // para que un testimonio nunca pueda inyectar HTML/JS.
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function starsMarkup(n) {
    let out = "";
    for (let i = 1; i <= 5; i++) {
      out += `<span class="star-ico ${i <= n ? "filled" : ""}">★</span>`;
    }
    return `<div class="stars-display" aria-label="${n} de 5 estrellas">${out}</div>`;
  }

  const testiGrid = document.getElementById("testimonios");
  const testiVacio = document.getElementById("testimoniosVacio");

  async function cargarTestimonios() {
    if (!testiGrid) return;

    if (!window.sb) {
      // Supabase todavía no está configurado: mostramos el estado vacío
      // en lugar de dejar la sección rota.
      if (testiVacio) testiVacio.hidden = false;
      return;
    }

    const { data, error } = await window.sb
      .from("testimonios")
      .select("nombre, texto, estrellas, fecha")
      .eq("estado", "aprobado")
      .order("fecha", { ascending: false })
      .limit(30);

    if (error) {
      console.error("No se pudieron cargar los testimonios:", error.message);
      if (testiVacio) testiVacio.hidden = false;
      return;
    }

    if (!data || data.length === 0) {
      if (testiVacio) testiVacio.hidden = false;
      return;
    }

    if (testiVacio) testiVacio.hidden = true;
    testiGrid.innerHTML = "";
    data.forEach((t) => {
      const card = document.createElement("div");
      card.className = "testi-card";
      const fecha = t.fecha
        ? new Date(t.fecha).toLocaleDateString("es-AR", { year: "numeric", month: "long" })
        : "";
      card.innerHTML = `
        ${starsMarkup(t.estrellas)}
        <p class="txt">"${escapeHtml(t.texto)}"</p>
        <div class="who"><span>${escapeHtml(t.nombre)}</span>${fecha ? `<span>${fecha}</span>` : ""}</div>
      `;
      testiGrid.appendChild(card);
    });
  }

  cargarTestimonios();

  // ---------- Modal ----------
  const modal = document.getElementById("testiModal");
  const abrirBtn = document.getElementById("abrirFormTestimonio");
  const cerrarBtn = document.getElementById("testiModalClose");
  const form = document.getElementById("testiForm");

  if (!modal || !abrirBtn || !cerrarBtn || !form) return;

  const msg = document.getElementById("testiMsg");
  const submitBtn = document.getElementById("testiSubmitBtn");

  function abrirModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function cerrarModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  abrirBtn.addEventListener("click", abrirModal);
  cerrarBtn.addEventListener("click", cerrarModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) cerrarModal();
  });

  // ---------- Estrellas interactivas ----------
  const starButtons = Array.from(document.querySelectorAll("#starInput .star"));
  let calificacion = 0;

  function pintarEstrellas(valor) {
    starButtons.forEach((b) => {
      b.classList.toggle("selected", parseInt(b.dataset.value, 10) <= valor);
    });
  }

  starButtons.forEach((b) => {
    b.addEventListener("click", () => {
      calificacion = parseInt(b.dataset.value, 10);
      pintarEstrellas(calificacion);
      const err = document.getElementById("errEstrellas");
      if (err) err.textContent = "";
    });
    b.addEventListener("mouseenter", () => pintarEstrellas(parseInt(b.dataset.value, 10)));
    b.addEventListener("mouseleave", () => pintarEstrellas(calificacion));
  });

  // Limpiar errores en vivo a medida que la persona completa los campos
  const nombreInput = document.getElementById("testiNombre");
  const textoInput = document.getElementById("testiTexto");
  if (nombreInput) {
    nombreInput.addEventListener("input", () => {
      const err = document.getElementById("errNombre");
      if (err && nombreInput.value.trim()) err.textContent = "";
    });
  }
  if (textoInput) {
    textoInput.addEventListener("input", () => {
      const err = document.getElementById("errTexto");
      if (err && textoInput.value.trim()) err.textContent = "";
    });
  }

  // ---------- Envío del formulario ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (msg) {
      msg.textContent = "";
      msg.className = "testi-msg";
    }

    const nombreEl = document.getElementById("testiNombre");
    const textoEl = document.getElementById("testiTexto");
    const webEl = document.getElementById("testiWeb"); // campo trampa (honeypot)

    const nombre = nombreEl.value.trim();
    const texto = textoEl.value.trim();
    const web = webEl ? webEl.value : "";

    const errNombre = document.getElementById("errNombre");
    const errTexto = document.getElementById("errTexto");
    const errEstrellas = document.getElementById("errEstrellas");
    if (errNombre) errNombre.textContent = "";
    if (errTexto) errTexto.textContent = "";
    if (errEstrellas) errEstrellas.textContent = "";

    let valido = true;
    if (!nombre) {
      if (errNombre) errNombre.textContent = "Contanos tu nombre.";
      valido = false;
    }
    if (!texto) {
      if (errTexto) errTexto.textContent = "Contanos cómo fue tu experiencia.";
      valido = false;
    }
    if (!calificacion) {
      if (errEstrellas) errEstrellas.textContent = "Elegí una calificación.";
      valido = false;
    }
    if (!valido) return;

    // Si el campo trampa viene completo, es casi seguro un bot:
    // mostramos la confirmación normal pero no guardamos nada.
    if (web) {
      mostrarConfirmacion();
      return;
    }

    if (!window.sb) {
      if (msg) {
        msg.textContent = "No se pudo conectar con el servidor. Intentá nuevamente más tarde.";
        msg.classList.add("error");
      }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    const { error } = await window.sb.from("testimonios").insert({
      nombre: nombre.slice(0, 80),
      texto: texto.slice(0, 600),
      estrellas: calificacion,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar testimonio";

    if (error) {
      console.error(error);
      if (msg) {
        msg.textContent = "Ocurrió un error al enviar tu testimonio. Por favor, intentá de nuevo.";
        msg.classList.add("error");
      }
      return;
    }

    mostrarConfirmacion();
  });

  function mostrarConfirmacion() {
    if (msg) {
      msg.textContent = "Gracias por compartir tu experiencia. Tu testimonio será revisado antes de publicarse.";
      msg.classList.add("ok");
    }
    form.reset();
    calificacion = 0;
    pintarEstrellas(0);
    setTimeout(cerrarModal, 2800);
  }
})();
