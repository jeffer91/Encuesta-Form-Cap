const CONFIG = window.ITSQMET_CONFIG || {};

const CAREERS = [
  ["ENF-TS", "Enfermería", "Técnico Superior"], ["MEC-TS", "Mecánica Automotriz", "Tecnología Superior"], ["MOT-TS", "Mecánica de Motos", "Tecnología Superior"],
  ["DIM-TS", "Diseño Multimedia", "Tecnología Superior"], ["MKT-TS", "Marketing Digital y Comercio Electrónico", "Tecnología Superior"], ["MKT-TSU", "Marketing Digital y Comercio Electrónico TSU", "Tecnología Universitaria"],
  ["VEN-TS", "Ventas", "Tecnología Superior"], ["DSW-TS", "Desarrollo de Software", "Tecnología Superior"], ["DSC-TSU", "Desarrollo de Software y Ciberseguridad", "Tecnología Universitaria"],
  ["RYT-TS", "Redes y Telecomunicaciones", "Tecnología Superior"], ["RYT-TSU", "Redes y Telecomunicaciones TSU", "Tecnología Universitaria"], ["EST-TS", "Estética Integral", "Tecnología Superior"],
  ["EDB-TS", "Educación Básica", "Tecnología Superior"], ["EDI-TS", "Educación Inicial", "Tecnología Superior"], ["EDI-TSU", "Educación Inicial TSU", "Tecnología Universitaria"],
  ["PED-TSU", "Pedagogía", "Tecnología Universitaria"], ["PAL-TS", "Procesamiento de Alimentos", "Tecnología Superior"], ["ADM-TS", "Administración", "Tecnología Superior"],
  ["AEI-TSU", "Administración de Empresas e inteligencia de negocios", "Tecnología Universitaria"], ["ATH-TSU", "Administración del Talento Humano", "Tecnología Universitaria"], ["CON-TS", "Contabilidad", "Tecnología Superior"],
  ["CTB-TSU", "Contabilidad y Tributación TSU", "Tecnología Universitaria"], ["GTH-TS", "Gestión del Talento Humano", "Tecnología Superior"], ["SPR-TS", "Seguridad y Prevención de Riesgos Laborales", "Tecnología Superior"],
  ["REF-TS", "Rehabilitación Física", "Tecnología Superior"], ["SCO-TS", "Seguridad Ciudadana y Orden Público", "Tecnología Superior"], ["GAS-TS", "Gastronomía", "Tecnología Superior"]
];

const TRAINING_OPTIONS = {
  areasCapacitadas: ["Metodologías de enseñanza","Evaluación del aprendizaje","Planificación curricular","Inteligencia artificial","Herramientas digitales","Educación inclusiva / DUA","Investigación y redacción académica","Actualización técnica disciplinar"],
  metodologias: ["Aprendizaje basado en proyectos","Aprendizaje basado en problemas","Aula invertida","Estudio de casos","Aprendizaje colaborativo","Simulación / práctica","Gamificación","Clase magistral"],
  herramientas: ["Moodle","Microsoft Teams","Zoom","Canva","Kahoot","Mentimeter","Herramientas de IA generativa","Software especializado de la carrera"],
  dificultadesEstudiantes: ["Falta de conocimientos previos","Baja motivación","Dificultad para comprender contenidos","Dificultad para aplicar teoría en la práctica","Problemas de trabajo en equipo","Lectura y comprensión","Dificultades con herramientas tecnológicas","Gestión del tiempo","Baja participación"],
  necesidades: ["Planificación y diseño curricular","Metodologías activas","Evaluación del aprendizaje","Rúbricas e instrumentos de evaluación","Aprendizaje basado en proyectos","IA aplicada a la docencia","Herramientas digitales","Diseño de recursos educativos","Educación inclusiva","Diseño Universal para el Aprendizaje (DUA)","Manejo y motivación del grupo","Comunicación y habilidades socioemocionales","Innovación educativa","Actualización técnica de la profesión","Integración entre teoría y práctica","Ética y buenas prácticas docentes"]
};

const FORMATION_AREAS = ["Educación y pedagogía","Administración y gestión","Talento humano","Contabilidad y tributación","Finanzas","Marketing y ventas","Software","Inteligencia artificial","Ciberseguridad","Redes y telecomunicaciones","Multimedia y diseño","Mecánica automotriz","Mecánica de motos","Salud y enfermería","Rehabilitación física","Estética","Seguridad y prevención de riesgos","Seguridad ciudadana","Alimentos","Gastronomía","Investigación","Otra"];

let adminKey = "";
let adminRows = [];
let editingId = "";
let deletingId = "";

function esc(value = "") { return String(value).replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch])); }
function showToast(message) { const toast = document.querySelector("#toast"); toast.textContent = message; toast.classList.add("show"); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800); }

async function api(path, options = {}) {
  const base = String(CONFIG.apiBaseUrl || "").replace(/\/$/, "");
  if (!base) throw new Error("La conexión institucional todavía está en configuración.");
  const response = await fetch(`${base}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  let payload = {}; try { payload = await response.json(); } catch { /* sin cuerpo JSON */ }
  if (!response.ok) throw new Error(payload.message || `Error ${response.status}`);
  return payload;
}
const authHeaders = () => ({ Authorization: `Bearer ${adminKey}` });

function renderCareers() { document.querySelector("#filter-career").innerHTML += CAREERS.map(([code, name]) => `<option value="${code}">${esc(name)}</option>`).join(""); }
async function loadAdmin() { const data = await api(`/api/admin/responses?period=${encodeURIComponent(CONFIG.periodCode || "2026-2027")}`, { headers: authHeaders() }); adminRows = data.rows || []; document.querySelector("#admin-auth").classList.add("hidden"); document.querySelector("#admin-dashboard").classList.remove("hidden"); renderAdmin(); }

function filteredContextRows() {
  const career = document.querySelector("#filter-career").value;
  const program = document.querySelector("#filter-program").value;
  const campus = document.querySelector("#filter-campus").value;
  return adminRows.filter(row => (!career || row.carrera_codigo === career) && (!program || row.programa === program) && (!campus || row.sede === campus));
}
function filteredAdminRows() {
  const query = document.querySelector("#admin-search").value.trim().toLowerCase();
  return filteredContextRows().filter(row => !query || `${row.nombres || ""} ${row.apellidos || ""} ${row.cedula || ""}`.toLowerCase().includes(query));
}
function pct(n, total) { return total ? `${Math.round((n / total) * 100)}%` : "0%"; }
function countBy(rows, key) { return rows.reduce((acc, r) => { const v = r[key] || "Sin dato"; acc[v] = (acc[v] || 0) + 1; return acc; }, {}); }
function countSelections(rows, key) { return rows.reduce((acc, row) => { (Array.isArray(row[key]) ? row[key] : []).forEach(value => { if (value) acc[value] = (acc[value] || 0) + 1; }); return acc; }, {}); }
function sortedCounts(counts) { return Object.entries(counts).sort((a,b) => b[1] - a[1] || a[0].localeCompare(b[0], "es")); }
function topValue(rows, key) { return sortedCounts(countBy(rows, key)).find(([label]) => label !== "Sin dato")?.[0] || "—"; }
function renderBars(target, counts, limit = 7) { const entries = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, limit), max = Math.max(...entries.map(([,n]) => n), 1); target.innerHTML = entries.length ? entries.map(([label, n]) => `<div class="bar-row"><span class="bar-label" title="${esc(label)}">${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(n/max)*100}%"></div></div><span class="bar-value">${n}</span></div>`).join("") : `<div class="empty-state">Sin datos para los filtros seleccionados.</div>`; }

function renderStatList(target, counts, total, limit = 0) {
  let entries = sortedCounts(counts).filter(([label, value]) => label !== "Sin dato" && value > 0);
  if (limit) entries = entries.slice(0, limit);
  target.innerHTML = entries.length ? `<div class="stat-list">${entries.map(([label, value]) => {
    const percentage = total ? Math.round((value / total) * 100) : 0;
    return `<div class="stat-list-row"><div class="stat-list-label"><span title="${esc(label)}">${esc(label)}</span><small>${value} docente${value === 1 ? "" : "s"}</small></div><div class="stat-list-meter"><span style="width:${percentage}%"></span></div><strong>${percentage}%</strong></div>`;
  }).join("")}</div>` : `<div class="empty-state compact">Sin datos para los filtros seleccionados.</div>`;
}

function renderStatistics(rows) {
  const total = rows.length;
  const activeCareers = new Set(rows.map(row => row.carrera_codigo).filter(Boolean)).size;
  document.querySelector("#statistics-total").textContent = total;
  document.querySelector("#statistics-careers").textContent = activeCareers;
  const careerSelect = document.querySelector("#filter-career"), programSelect = document.querySelector("#filter-program"), campusSelect = document.querySelector("#filter-campus");
  const context = [careerSelect.selectedOptions[0]?.textContent || "Todas las carreras", programSelect.value || "Todos los programas", campusSelect.value || "Todas las sedes"];
  document.querySelector("#statistics-context").textContent = `${total} respuesta${total === 1 ? "" : "s"} analizada${total === 1 ? "" : "s"} · ${context.join(" · ")}`;

  const careerGroups = new Map();
  rows.forEach(row => { const key = row.carrera_codigo || row.carrera_nombre || "Sin dato"; if (!careerGroups.has(key)) careerGroups.set(key, []); careerGroups.get(key).push(row); });
  const careerRows = [...careerGroups.values()].sort((a,b) => b.length - a.length || String(a[0]?.carrera_nombre || "").localeCompare(String(b[0]?.carrera_nombre || ""), "es"));
  document.querySelector("#career-stats-body").innerHTML = careerRows.length ? careerRows.map(group => {
    const first = group[0] || {}, groupTotal = group.length;
    const trained = group.filter(row => row.capacitacion_12m === "Sí").length;
    const interested = group.filter(row => ["Corto plazo","Mediano plazo"].includes(row.interes_formacion)).length;
    const fourth = group.filter(row => /Maestría|Doctorado/.test(row.nivel_academico || "")).length;
    return `<tr><td><strong>${esc(first.carrera_nombre || "Sin dato")}</strong><small class="cell-sub">${esc(first.programa || "")}</small></td><td><strong class="number-cell">${groupTotal}</strong></td><td>${pct(groupTotal,total)}</td><td>${pct(trained,groupTotal)}</td><td>${pct(interested,groupTotal)}</td><td>${pct(fourth,groupTotal)}</td><td>${esc(topValue(group,"necesidad_prioritaria"))}</td></tr>`;
  }).join("") : `<tr><td colspan="7"><div class="empty-state">Sin datos para los filtros seleccionados.</div></td></tr>`;

  const selectedNeeds = countSelections(rows, "necesidades");
  const priorityNeeds = countBy(rows, "necesidad_prioritaria");
  const needEntries = sortedCounts(selectedNeeds).filter(([,value]) => value > 0);
  document.querySelector("#needs-stats-body").innerHTML = needEntries.length ? needEntries.map(([label, selected]) => {
    const priority = priorityNeeds[label] || 0;
    const high = rows.filter(row => row.necesidad_prioritaria === label && ["Alta","Muy alta"].includes(row.nivel_necesidad)).length;
    return `<tr><td><strong>${esc(label)}</strong></td><td><span class="count-pill">${selected}</span></td><td>${priority}</td><td><div class="table-meter"><span style="width:${total ? Math.round((selected/total)*100) : 0}%"></span><b>${pct(selected,total)}</b></div></td><td>${priority ? `${high}/${priority} · ${pct(high,priority)}` : "—"}</td></tr>`;
  }).join("") : `<tr><td colspan="5"><div class="empty-state">Sin necesidades registradas para los filtros seleccionados.</div></td></tr>`;

  renderStatList(document.querySelector("#education-stats"), countBy(rows,"nivel_academico"), total);
  renderStatList(document.querySelector("#interest-stats"), countBy(rows,"interes_formacion"), total);

  const trainingTarget = document.querySelector("#training-stats");
  trainingTarget.innerHTML = `<div class="stat-split"><section><h3>Capacitación últimos 12 meses</h3><div id="training-received-list"></div></section><section><h3>Aplicación de lo aprendido</h3><div id="training-application-list"></div></section></div>`;
  renderStatList(document.querySelector("#training-received-list"), countBy(rows,"capacitacion_12m"), total);
  const trainedRows = rows.filter(row => row.capacitacion_12m === "Sí");
  renderStatList(document.querySelector("#training-application-list"), countBy(trainedRows,"aplica_capacitacion"), trainedRows.length);

  const locationTarget = document.querySelector("#location-stats");
  locationTarget.innerHTML = `<div class="stat-split"><section><h3>Sede principal</h3><div id="campus-stats-list"></div></section><section><h3>Modalidad principal</h3><div id="modality-stats-list"></div></section></div>`;
  renderStatList(document.querySelector("#campus-stats-list"), countBy(rows,"sede"), total);
  renderStatList(document.querySelector("#modality-stats-list"), countBy(rows,"modalidad"), total);

  renderStatList(document.querySelector("#methodology-stats"), countSelections(rows,"metodologias"), total);
  renderStatList(document.querySelector("#tools-stats"), countSelections(rows,"herramientas"), total);
  renderStatList(document.querySelector("#difficulty-stats"), countSelections(rows,"dificultades_estudiantes"), total);
}

function renderAdmin() {
  const rows = filteredContextRows();
  const responseRows = filteredAdminRows();
  document.querySelector("#metric-responses").textContent = rows.length;
  document.querySelector("#responses-tab-count").textContent = rows.length;
  document.querySelector("#metric-fourth").textContent = pct(rows.filter(r => /Maestría|Doctorado/.test(r.nivel_academico || "")).length, rows.length);
  document.querySelector("#metric-interest").textContent = pct(rows.filter(r => ["Corto plazo", "Mediano plazo"].includes(r.interes_formacion)).length, rows.length);
  document.querySelector("#metric-training").textContent = pct(rows.filter(r => r.capacitacion_12m === "Sí").length, rows.length);
  renderBars(document.querySelector("#training-chart"), countBy(rows, "necesidad_prioritaria"), 6); renderBars(document.querySelector("#education-chart"), countBy(rows, "nivel_academico"), 7);
  renderStatistics(rows);
  document.querySelector("#responses-body").innerHTML = responseRows.length ? responseRows.map(r => `<tr><td><strong>${esc(`${r.nombres || ""} ${r.apellidos || ""}`.trim())}</strong><br><small>${esc(r.cedula)}</small></td><td>${esc(r.carrera_nombre)}</td><td><span class="tag">${esc(r.programa)}</span></td><td>${esc(r.necesidad_prioritaria || "—")}</td><td>${esc(r.nivel_academico || "—")}</td><td>${esc(r.interes_formacion || "—")}</td><td>${esc(new Date(r.submitted_at).toLocaleDateString("es-EC"))}</td><td><div class="row-actions"><button class="table-action edit" type="button" data-action="edit" data-id="${esc(r.id)}">✎ <span>Editar</span></button><button class="table-action delete" type="button" data-action="delete" data-id="${esc(r.id)}">⌫ <span>Eliminar</span></button></div></td></tr>`).join("") : `<tr><td colspan="8"><div class="empty-state">Sin respuestas para los filtros seleccionados.</div></td></tr>`;
}

function optionList(items, current = "") { return items.map(item => { const [value, label] = Array.isArray(item) ? item : [item, item]; return `<option value="${esc(value)}" ${value === current ? "selected" : ""}>${esc(label)}</option>`; }).join(""); }
function selectField(name, label, current, items, required = true, attrs = "") { return `<label class="field"><span>${esc(label)}${required ? " <b>*</b>" : ""}</span><select name="${name}" ${required ? "required" : ""} ${attrs}><option value="">Seleccione...</option>${optionList(items, current || "")}</select></label>`; }
function textField(name, label, value, type = "text", required = true, attrs = "") { return `<label class="field"><span>${esc(label)}${required ? " <b>*</b>" : ""}</span><input name="${name}" type="${type}" value="${esc(value || "")}" ${required ? "required" : ""} ${attrs}></label>`; }
function checks(name, items, selected = [], max = 0) { const values = new Set(selected || []); return `<div class="admin-check-grid" ${max ? `data-max-checks="${max}"` : ""}>${items.map(item => `<label><input type="checkbox" name="${name}" value="${esc(item)}" ${values.has(item) ? "checked" : ""}><span>${esc(item)}</span></label>`).join("")}</div>`; }
function editSection(title, subtitle, content) { return `<section class="edit-section"><div class="edit-section-title"><h3>${esc(title)}</h3><p>${esc(subtitle)}</p></div>${content}</section>`; }

function openEdit(row) {
  editingId = row.id;
  document.querySelector("#edit-response-caption").textContent = `${`${row.nombres || ""} ${row.apellidos || ""}`.trim()} · ${row.cedula}`;
  const careerOptions = CAREERS.map(([code, name]) => [code, name]);
  const otherCareerChecks = `<div class="admin-check-grid careers">${CAREERS.map(([code,name]) => `<label><input type="checkbox" name="otrasCarreras" value="${code}" ${row.otras_carreras?.includes(code) ? "checked" : ""} ${row.carrera_codigo === code ? "disabled" : ""}><span>${esc(name)}</span></label>`).join("")}</div>`;
  const identification = editSection("1. Identificación", "Datos del docente y carrera principal.", `<div class="edit-grid three">${textField("cedula","Cédula",row.cedula,"text",true,'inputmode="numeric" maxlength="10"')}${textField("nombres","Nombres",row.nombres)}${textField("apellidos","Apellidos",row.apellidos)}${textField("correoInstitucional","Correo institucional",row.correo_institucional,"email")}${textField("correoPersonal","Correo personal",row.correo_personal,"email")}${textField("celular","Celular",row.celular,"tel",true,'maxlength="10"')}</div><div class="edit-grid two">${selectField("carreraPrincipal","Carrera principal",row.carrera_codigo,careerOptions)}${textField("programa","Programa",row.programa,"text",true,"readonly")}</div><div class="edit-multiselect"><span>Otras carreras</span>${otherCareerChecks}</div>`);
  const profile = editSection("2. Perfil docente", "Sede, modalidad y práctica docente.", `<div class="edit-grid two">${selectField("dedicacion","Tipo de dedicación",row.dedicacion,["Tiempo Completo (TC)","Medio Tiempo (MT)","Tiempo Parcial (TP)"])}${selectField("sede","Sede principal",row.sede,["Matriz","Magdalena","Sur","Manta"])}${selectField("modalidad","Modalidad principal",row.modalidad,["Presencial matutino","Presencial vespertino","En línea","PVC","Intensivo"])}${textField("asignaturaCompleja","Asignatura más compleja",row.asignatura_compleja)}${selectField("causaAsignatura","Principal causa",row.causa_asignatura,["Contenidos técnicos complejos","Actualización profesional","Teoría y práctica","Metodología","Evaluación","Software o equipamiento","Conocimientos previos estudiantes","Otra"])}${selectField("refuerzoAsignatura","¿Necesita fortalecer conocimientos?",row.refuerzo_asignatura,["Sí","Parcialmente","No"])}</div>`);
  const training = editSection("3. Capacitación", "Experiencia, práctica y prioridades.", `<div class="edit-grid two">${selectField("capacitacion12m","Capacitación en últimos 12 meses",row.capacitacion_12m,["Sí","No"])}${selectField("aplicaCapacitacion","Frecuencia de aplicación",row.aplica_capacitacion,["Siempre","Frecuentemente","A veces","Rara vez","Nunca"],false)}</div><div class="edit-multiselect"><span>Áreas en las que se ha capacitado</span>${checks("areasCapacitadas",TRAINING_OPTIONS.areasCapacitadas,row.areas_capacitadas)}</div><div class="edit-multiselect"><span>Metodologías utilizadas <b>*</b></span>${checks("metodologias",TRAINING_OPTIONS.metodologias,row.metodologias)}</div><div class="edit-multiselect"><span>Herramientas tecnológicas <b>*</b></span>${checks("herramientas",TRAINING_OPTIONS.herramientas,row.herramientas)}</div><div class="edit-multiselect"><span>Dificultades de estudiantes <b>*</b></span>${checks("dificultadesEstudiantes",TRAINING_OPTIONS.dificultadesEstudiantes,row.dificultades_estudiantes)}</div><div class="edit-multiselect"><span>Necesidades de fortalecimiento · máximo 3 <b>*</b></span>${checks("necesidades",TRAINING_OPTIONS.necesidades,row.necesidades,3)}</div><div class="edit-grid two">${selectField("necesidadPrioritaria","Necesidad prioritaria",row.necesidad_prioritaria,(row.necesidades || []).length ? row.necesidades : TRAINING_OPTIONS.necesidades)}${selectField("nivelNecesidad","Nivel de necesidad",row.nivel_necesidad,["Muy alta","Alta","Media","Baja","Muy baja"])}</div>`);
  const formation = editSection("4. Formación académica", "Situación actual e interés de formación.", `<div class="edit-grid two">${selectField("nivelAcademico","Nivel académico más alto",row.nivel_academico,["Técnico Superior","Tecnología Superior","Tecnología Universitaria","Licenciatura / Ingeniería","Especialización","Maestría / Maestría Tecnológica","Doctorado / PhD"])}${selectField("afinidadTitulo","Relación del título",row.afinidad_titulo,["Directamente relacionado","Parcialmente relacionado","No relacionado"])}${selectField("cursaFormacion","¿Cursa formación actualmente?",row.cursa_formacion,["Sí","No"])}</div><div id="edit-current-study" class="edit-conditional"><div class="edit-grid two">${selectField("nivelCursa","Nivel que cursa",row.nivel_cursa,["Tecnología Universitaria","Licenciatura / Ingeniería","Especialización","Maestría / Maestría Tecnológica","Doctorado / PhD"],false,'data-required="true"')}${selectField("etapaFormacion","Etapa actual",row.etapa_formacion,["Recién iniciado","Primer tercio","Etapa intermedia","Etapa final","Titulación / tesis"],false,'data-required="true"')}${textField("programaActual","Nombre del programa",row.programa_actual,"text",false,'data-required="true"')}${textField("institucionActual","Institución",row.institucion_actual,"text",false,'data-required="true"')}</div></div><div class="edit-grid two">${selectField("interesFormacion","Interés en formación",row.interes_formacion,["Corto plazo","Mediano plazo","Sin fecha","No por el momento"])}</div><div id="edit-future-study" class="edit-conditional"><div class="edit-grid two">${selectField("nivelDeseado","Nivel que desea alcanzar",row.nivel_deseado,["Tecnología Universitaria","Licenciatura / Ingeniería","Especialización","Maestría / Maestría Tecnológica","Doctorado / PhD"],false,'data-required="true"')}${selectField("tipoFormacion","Tipo de formación",row.tipo_formacion,["Específica de mi área profesional","Educación, pedagogía o docencia","Investigación","Gestión académica / administrativa","Tecnología e innovación","Otra área transversal"],false,'data-required="true"')}${selectField("areaFormacion","Área de interés",row.area_formacion,FORMATION_AREAS,false,'data-required="true"')}${selectField("relacionFormacion","Relación con carrera",row.relacion_formacion,["Directamente relacionada","Preferentemente relacionada","Puede ser transversal"],false,'data-required="true"')}${selectField("inicioPrevisto","Inicio previsto",row.inicio_previsto,["Inmediatamente","Dentro de 6 meses","Entre 6 y 12 meses","Entre 1 y 2 años","En más de 2 años","No definido"],false,'data-required="true"')}${selectField("modalidadFormacion","Modalidad preferida",row.modalidad_formacion,["Presencial","En línea","Híbrida","Indiferente"],false,'data-required="true"')}${selectField("barreraFormacion","Principal dificultad",row.barrera_formacion,["Falta de tiempo","Horario laboral","Responsabilidades familiares","Requisitos de admisión","Falta de programas adecuados","Ubicación / distancia","No identifico dificultades","Otra"],false,'data-required="true"')}${selectField("apoyoFormacion","Apoyo institucional",row.apoyo_formacion,["Flexibilidad de horarios","Asesoría para seleccionar programa","Apoyo en procesos de admisión","Convenios con universidades","Seguimiento académico","No requiero apoyo","Otra"],false,'data-required="true"')}</div></div>`);
  document.querySelector("#edit-response-body").innerHTML = identification + profile + training + formation;
  bindEditFields(); document.querySelector("#edit-status").textContent = ""; document.querySelector("#edit-dialog").showModal();
}

function toggleConditional(selector, show) { const block = document.querySelector(selector); block.classList.toggle("hidden", !show); block.querySelectorAll("[data-required]").forEach(field => { field.required = show; }); }
function syncPriority() { const selected = [...document.querySelectorAll('#edit-response-form input[name="necesidades"]:checked')].map(el => el.value), select = document.querySelector('#edit-response-form [name="necesidadPrioritaria"]'), previous = select.value; select.innerHTML = `<option value="">Seleccione...</option>${optionList(selected, selected.includes(previous) ? previous : "")}`; }
function bindEditFields() {
  const form = document.querySelector("#edit-response-form"), career = form.elements.carreraPrincipal;
  career.addEventListener("change", () => { const selected = CAREERS.find(([code]) => code === career.value); form.elements.programa.value = selected?.[2] || ""; form.querySelectorAll('input[name="otrasCarreras"]').forEach(input => { input.disabled = input.value === career.value; if (input.disabled) input.checked = false; }); });
  form.querySelectorAll('[data-max-checks="3"] input').forEach(input => input.addEventListener("change", event => { const selected = form.querySelectorAll('input[name="necesidades"]:checked'); if (selected.length > 3) { event.target.checked = false; showToast("Puede seleccionar hasta 3 necesidades."); } syncPriority(); }));
  const syncFormation = () => { toggleConditional("#edit-current-study", form.elements.cursaFormacion.value === "Sí"); toggleConditional("#edit-future-study", form.elements.interesFormacion.value !== "No por el momento"); };
  form.elements.cursaFormacion.addEventListener("change", syncFormation); form.elements.interesFormacion.addEventListener("change", syncFormation); syncFormation();
}

function formValue(form, name) { return String(form.elements[name]?.value || "").trim(); }
function checkedValues(form, name) { return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(el => el.value); }
function editorPayload() {
  const form = document.querySelector("#edit-response-form");
  return {
    docente: { cedula: formValue(form,"cedula"), nombres: formValue(form,"nombres"), apellidos: formValue(form,"apellidos"), correoInstitucional: formValue(form,"correoInstitucional"), correoPersonal: formValue(form,"correoPersonal"), celular: formValue(form,"celular") },
    perfil: { carreraPrincipal: formValue(form,"carreraPrincipal"), programa: formValue(form,"programa"), dedicacion: formValue(form,"dedicacion"), sede: formValue(form,"sede"), modalidad: formValue(form,"modalidad"), asignaturaCompleja: formValue(form,"asignaturaCompleja"), causaAsignatura: formValue(form,"causaAsignatura"), refuerzoAsignatura: formValue(form,"refuerzoAsignatura"), otrasCarreras: checkedValues(form,"otrasCarreras") },
    capacitacion: { capacitacion12m: formValue(form,"capacitacion12m"), aplicaCapacitacion: formValue(form,"aplicaCapacitacion"), areasCapacitadas: checkedValues(form,"areasCapacitadas"), metodologias: checkedValues(form,"metodologias"), herramientas: checkedValues(form,"herramientas"), dificultadesEstudiantes: checkedValues(form,"dificultadesEstudiantes"), necesidades: checkedValues(form,"necesidades"), necesidadPrioritaria: formValue(form,"necesidadPrioritaria"), nivelNecesidad: formValue(form,"nivelNecesidad") },
    formacion: { nivelAcademico: formValue(form,"nivelAcademico"), afinidadTitulo: formValue(form,"afinidadTitulo"), cursaFormacion: formValue(form,"cursaFormacion"), nivelCursa: formValue(form,"nivelCursa"), etapaFormacion: formValue(form,"etapaFormacion"), programaActual: formValue(form,"programaActual"), institucionActual: formValue(form,"institucionActual"), interesFormacion: formValue(form,"interesFormacion"), nivelDeseado: formValue(form,"nivelDeseado"), tipoFormacion: formValue(form,"tipoFormacion"), areaFormacion: formValue(form,"areaFormacion"), relacionFormacion: formValue(form,"relacionFormacion"), inicioPrevisto: formValue(form,"inicioPrevisto"), modalidadFormacion: formValue(form,"modalidadFormacion"), barreraFormacion: formValue(form,"barreraFormacion"), apoyoFormacion: formValue(form,"apoyoFormacion") }
  };
}

function exportCsv() {
  const rows = filteredAdminRows(); if (!rows.length) return showToast("No hay datos para exportar.");
  const cols = ["cedula","nombres","apellidos","correo_institucional","correo_personal","celular","carrera_nombre","programa","dedicacion","sede","modalidad","asignatura_compleja","necesidad_prioritaria","nivel_necesidad","nivel_academico","interes_formacion","nivel_deseado","area_formacion","submitted_at"];
  const csv = "\ufeff" + [cols.join(";"), ...rows.map(row => cols.map(c => `"${String(row[c] ?? "").replace(/"/g, '""')}"`).join(";"))].join("\n"), blob = new Blob([csv], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `ITSQMET_respuestas_${CONFIG.periodCode || "periodo"}.csv`; a.click(); URL.revokeObjectURL(a.href);
}

function setAdminView(view) {
  document.querySelectorAll("[data-admin-view]").forEach(button => {
    const active = button.dataset.adminView === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  ["summary","statistics","responses"].forEach(name => document.querySelector(`#admin-view-${name}`).classList.toggle("hidden", name !== view));
}

function bindAdmin() {
  document.querySelector("#admin-login").addEventListener("submit", async event => { event.preventDefault(); adminKey = document.querySelector("#admin-key").value.trim(); const status = document.querySelector("#admin-login-status"); status.textContent = "Verificando..."; try { await loadAdmin(); status.textContent = ""; } catch (error) { status.textContent = error.message; } });
  document.querySelector("#refresh-admin").addEventListener("click", async () => { try { await loadAdmin(); showToast("Datos actualizados."); } catch (error) { showToast(error.message); } });
  ["filter-career", "filter-program", "filter-campus", "admin-search"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", renderAdmin));
  document.querySelectorAll("[data-admin-view]").forEach(button => button.addEventListener("click", () => setAdminView(button.dataset.adminView)));
  document.querySelector("#export-csv").addEventListener("click", exportCsv); document.querySelector("#print-report").addEventListener("click", () => window.print());
  document.querySelector("#responses-body").addEventListener("click", event => { const button = event.target.closest("[data-action]"); if (!button) return; const row = adminRows.find(item => item.id === button.dataset.id); if (!row) return; if (button.dataset.action === "edit") openEdit(row); if (button.dataset.action === "delete") { deletingId = row.id; document.querySelector("#delete-message").innerHTML = `¿Confirma que desea eliminar la respuesta de <strong>${esc(`${row.nombres} ${row.apellidos}`.trim())}</strong>?`; document.querySelector("#delete-dialog").showModal(); } });
  ["#close-edit", "#cancel-edit"].forEach(sel => document.querySelector(sel).addEventListener("click", () => document.querySelector("#edit-dialog").close()));
  document.querySelector("#cancel-delete").addEventListener("click", () => document.querySelector("#delete-dialog").close());
  document.querySelector("#edit-response-form").addEventListener("submit", async event => {
    event.preventDefault(); const status = document.querySelector("#edit-status"), button = document.querySelector("#save-edit"), payload = editorPayload();
    if (!payload.capacitacion.metodologias.length || !payload.capacitacion.herramientas.length || !payload.capacitacion.dificultadesEstudiantes.length || !payload.capacitacion.necesidades.length) { status.textContent = "Complete las selecciones obligatorias de capacitación."; return; }
    button.disabled = true; status.textContent = "Guardando cambios...";
    try { await api(`/api/admin/responses/${encodeURIComponent(editingId)}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload) }); await loadAdmin(); document.querySelector("#edit-dialog").close(); showToast("Respuesta actualizada correctamente."); } catch (error) { status.textContent = error.message; } finally { button.disabled = false; }
  });
  document.querySelector("#confirm-delete").addEventListener("click", async () => { const button = document.querySelector("#confirm-delete"); button.disabled = true; try { await api(`/api/admin/responses/${encodeURIComponent(deletingId)}`, { method: "DELETE", headers: authHeaders() }); await loadAdmin(); document.querySelector("#delete-dialog").close(); showToast("Respuesta eliminada correctamente."); } catch (error) { showToast(error.message); } finally { button.disabled = false; } });
}

document.addEventListener("DOMContentLoaded", () => { renderCareers(); bindAdmin(); });
