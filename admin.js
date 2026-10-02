const CONFIG = window.ITSQMET_CONFIG || {};

const CAREERS = [
  ["ENF-TS", "Enfermería"], ["MEC-TS", "Mecánica Automotriz"], ["MOT-TS", "Mecánica de Motos"],
  ["DIM-TS", "Diseño Multimedia"], ["MKT-TS", "Marketing Digital y Comercio Electrónico"],
  ["MKT-TSU", "Marketing Digital y Comercio Electrónico TSU"], ["VEN-TS", "Ventas"],
  ["DSW-TS", "Desarrollo de Software"], ["DSC-TSU", "Desarrollo de Software y Ciberseguridad"],
  ["RYT-TS", "Redes y Telecomunicaciones"], ["RYT-TSU", "Redes y Telecomunicaciones TSU"],
  ["EST-TS", "Estética Integral"], ["EDB-TS", "Educación Básica"], ["EDI-TS", "Educación Inicial"],
  ["EDI-TSU", "Educación Inicial TSU"], ["PED-TSU", "Pedagogía"], ["PAL-TS", "Procesamiento de Alimentos"],
  ["ADM-TS", "Administración"], ["AEI-TSU", "Administración de Empresas e inteligencia de negocios"],
  ["ATH-TSU", "Administración del Talento Humano"], ["CON-TS", "Contabilidad"],
  ["CTB-TSU", "Contabilidad y Tributación TSU"], ["GTH-TS", "Gestión del Talento Humano"],
  ["SPR-TS", "Seguridad y Prevención de Riesgos Laborales"], ["REF-TS", "Rehabilitación Física"],
  ["SCO-TS", "Seguridad Ciudadana y Orden Público"], ["GAS-TS", "Gastronomía"]
];

let adminKey = "";
let adminRows = [];

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

async function api(path, options = {}) {
  const base = String(CONFIG.apiBaseUrl || "").replace(/\/$/, "");
  if (!base) throw new Error("La conexión institucional todavía está en configuración.");
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  let payload = {};
  try { payload = await response.json(); } catch { /* sin cuerpo JSON */ }
  if (!response.ok) throw new Error(payload.message || `Error ${response.status}`);
  return payload;
}

function renderCareers() {
  document.querySelector("#filter-career").innerHTML += CAREERS.map(([code, name]) => `<option value="${code}">${esc(name)}</option>`).join("");
}

async function loadAdmin() {
  const data = await api(`/api/admin/responses?period=${encodeURIComponent(CONFIG.periodCode || "2026-2027")}`, { headers: { Authorization: `Bearer ${adminKey}` } });
  adminRows = data.rows || [];
  document.querySelector("#admin-auth").classList.add("hidden");
  document.querySelector("#admin-dashboard").classList.remove("hidden");
  renderAdmin();
}

function filteredAdminRows() {
  const career = document.querySelector("#filter-career").value;
  const program = document.querySelector("#filter-program").value;
  const query = document.querySelector("#admin-search").value.trim().toLowerCase();
  return adminRows.filter(row => (!career || row.carrera_codigo === career) && (!program || row.programa === program) && (!query || `${row.nombres} ${row.cedula}`.toLowerCase().includes(query)));
}

function pct(n, total) { return total ? `${Math.round((n / total) * 100)}%` : "0%"; }
function countBy(rows, key) { return rows.reduce((acc, r) => { const v = r[key] || "Sin dato"; acc[v] = (acc[v] || 0) + 1; return acc; }, {}); }

function renderBars(target, counts, limit = 7) {
  const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, limit);
  const max = Math.max(...entries.map(([,n]) => n), 1);
  target.innerHTML = entries.length ? entries.map(([label, n]) => `<div class="bar-row"><span class="bar-label" title="${esc(label)}">${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(n/max)*100}%"></div></div><span class="bar-value">${n}</span></div>`).join("") : `<div class="empty-state">Sin datos para los filtros seleccionados.</div>`;
}

function renderAdmin() {
  const rows = filteredAdminRows();
  document.querySelector("#metric-responses").textContent = rows.length;
  document.querySelector("#metric-fourth").textContent = pct(rows.filter(r => /Maestría|Doctorado/.test(r.nivel_academico || "")).length, rows.length);
  document.querySelector("#metric-interest").textContent = pct(rows.filter(r => ["Corto plazo", "Mediano plazo"].includes(r.interes_formacion)).length, rows.length);
  document.querySelector("#metric-training").textContent = pct(rows.filter(r => r.capacitacion_12m === "Sí").length, rows.length);
  renderBars(document.querySelector("#training-chart"), countBy(rows, "necesidad_prioritaria"), 6);
  renderBars(document.querySelector("#education-chart"), countBy(rows, "nivel_academico"), 7);
  document.querySelector("#responses-body").innerHTML = rows.length ? rows.map(r => `<tr><td><strong>${esc(r.nombres)}</strong><br><small>${esc(r.cedula)}</small></td><td>${esc(r.carrera_nombre)}</td><td><span class="tag">${esc(r.programa)}</span></td><td>${esc(r.necesidad_prioritaria || "—")}</td><td>${esc(r.nivel_academico || "—")}</td><td>${esc(r.interes_formacion || "—")}</td><td>${esc(new Date(r.submitted_at).toLocaleDateString("es-EC"))}</td></tr>`).join("") : `<tr><td colspan="7"><div class="empty-state">Sin respuestas para los filtros seleccionados.</div></td></tr>`;
}

function exportCsv() {
  const rows = filteredAdminRows();
  if (!rows.length) return showToast("No hay datos para exportar.");
  const cols = ["cedula","nombres","correo_institucional","correo_personal","celular","carrera_nombre","programa","dedicacion","sede","asignatura_compleja","necesidad_prioritaria","nivel_necesidad","nivel_academico","interes_formacion","nivel_deseado","area_formacion","submitted_at"];
  const csv = "\ufeff" + [cols.join(";"), ...rows.map(row => cols.map(c => `"${String(row[c] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ITSQMET_respuestas_${CONFIG.periodCode || "periodo"}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function bindAdmin() {
  document.querySelector("#admin-login").addEventListener("submit", async event => {
    event.preventDefault();
    adminKey = document.querySelector("#admin-key").value.trim();
    const status = document.querySelector("#admin-login-status");
    status.textContent = "Verificando...";
    try { await loadAdmin(); status.textContent = ""; }
    catch (error) { status.textContent = error.message; }
  });
  document.querySelector("#refresh-admin").addEventListener("click", async () => { try { await loadAdmin(); showToast("Datos actualizados."); } catch (error) { showToast(error.message); } });
  ["filter-career", "filter-program", "admin-search"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", renderAdmin));
  document.querySelector("#export-csv").addEventListener("click", exportCsv);
  document.querySelector("#print-report").addEventListener("click", () => window.print());
}

document.addEventListener("DOMContentLoaded", () => {
  renderCareers();
  bindAdmin();
});
