// ============================================================
// Panel de administración (protegido) — Bienestar Integral
// Requiere haber iniciado sesión con un usuario de Supabase Auth.
// Todas las acciones (leer todo, aprobar, rechazar, eliminar)
// están además protegidas del lado del servidor por las políticas
// de Row Level Security (RLS) de la tabla "testimonios": un
// visitante sin sesión no puede ejecutarlas aunque llame a la
// API directamente. Ver supabase/schema.sql.
// ============================================================
(function () {
  "use strict";

  if (!window.sb) {
    document.getElementById("loginMsg").textContent =
      "Falta configurar Supabase en js/supabase-config.js.";
    return;
  }

  const loginBox = document.getElementById("loginBox");
  const panelBox = document.getElementById("panelBox");
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMsg");
  const loginBtn = document.getElementById("loginBtn");
  const adminEmailEl = document.getElementById("adminEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  const pendientesList = document.getElementById("pendientesList");
  const pendientesVacio = document.getElementById("pendientesVacio");
  const aprobadosList = document.getElementById("aprobadosList");
  const aprobadosVacio = document.getElementById("aprobadosVacio");

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function estrellasTexto(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  async function mostrarPanel(session) {
    loginBox.hidden = true;
    panelBox.hidden = false;
    adminEmailEl.textContent = session.user.email;
    await cargarTestimonios();
  }

  function mostrarLogin() {
    loginBox.hidden = false;
    panelBox.hidden = true;
  }

  async function cargarTestimonios() {
    const { data, error } = await window.sb
      .from("testimonios")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const pendientes = data.filter((t) => t.estado === "pendiente");
    const aprobados = data.filter((t) => t.estado === "aprobado");

    pendientesList.innerHTML = "";
    pendientesVacio.hidden = pendientes.length > 0;
    pendientes.forEach((t) => pendientesList.appendChild(tarjetaPendiente(t)));

    aprobadosList.innerHTML = "";
    aprobadosVacio.hidden = aprobados.length > 0;
    aprobados.forEach((t) => aprobadosList.appendChild(tarjetaAprobada(t)));
  }

  function tarjetaPendiente(t) {
    const div = document.createElement("div");
    div.className = "admin-item";
    div.innerHTML = `
      <div class="admin-item-head">
        <strong>${escapeHtml(t.nombre)}</strong>
        <span>${estrellasTexto(t.estrellas)}</span>
      </div>
      <p>${escapeHtml(t.texto)}</p>
      <div class="admin-item-meta">${new Date(t.fecha).toLocaleString("es-AR")} · Pendiente de aprobación</div>
      <div class="admin-item-actions">
        <button class="btn btn-primary" data-action="aprobar" data-id="${t.id}">✓ Aprobar</button>
        <button class="btn btn-outline" data-action="rechazar" data-id="${t.id}">✕ Rechazar</button>
      </div>
    `;
    return div;
  }

  function tarjetaAprobada(t) {
    const div = document.createElement("div");
    div.className = "admin-item";
    div.innerHTML = `
      <div class="admin-item-head">
        <strong>${escapeHtml(t.nombre)}</strong>
        <span>${estrellasTexto(t.estrellas)}</span>
      </div>
      <p>${escapeHtml(t.texto)}</p>
      <div class="admin-item-meta">${new Date(t.fecha).toLocaleString("es-AR")} · Publicado</div>
      <div class="admin-item-actions">
        <button class="btn btn-outline" data-action="eliminar" data-id="${t.id}">Eliminar</button>
      </div>
    `;
    return div;
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "eliminar" && !confirm("¿Eliminar este testimonio publicado? Esta acción no se puede deshacer.")) {
      return;
    }

    btn.disabled = true;
    let error;

    if (action === "aprobar") {
      ({ error } = await window.sb.from("testimonios").update({ estado: "aprobado" }).eq("id", id));
    } else if (action === "rechazar") {
      ({ error } = await window.sb.from("testimonios").update({ estado: "rechazado" }).eq("id", id));
    } else if (action === "eliminar") {
      ({ error } = await window.sb.from("testimonios").delete().eq("id", id));
    }

    if (error) {
      alert("No se pudo completar la acción: " + error.message);
      btn.disabled = false;
      return;
    }

    await cargarTestimonios();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginMsg.textContent = "";
    loginBtn.disabled = true;
    loginBtn.textContent = "Ingresando...";

    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPass").value;

    const { data, error } = await window.sb.auth.signInWithPassword({ email, password: pass });

    loginBtn.disabled = false;
    loginBtn.textContent = "Ingresar";

    if (error) {
      loginMsg.textContent = "Email o contraseña incorrectos.";
      loginMsg.className = "testi-msg error";
      return;
    }
    await mostrarPanel(data.session);
  });

  logoutBtn.addEventListener("click", async () => {
    await window.sb.auth.signOut();
    mostrarLogin();
  });

  // Al cargar la página, revisamos si ya hay una sesión activa
  (async () => {
    const { data } = await window.sb.auth.getSession();
    if (data.session) {
      await mostrarPanel(data.session);
    }
  })();
})();
