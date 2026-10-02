const CONFIG = window.ITSQMET_CONFIG || {};

const CAREERS = [
  ["ENF-TS", "Enfermería", "Técnico Superior"],
  ["MEC-TS", "Mecánica Automotriz", "Tecnología Superior"],
  ["MOT-TS", "Mecánica de Motos", "Tecnología Superior"],
  ["DIM-TS", "Diseño Multimedia", "Tecnología Superior"],
  ["MKT-TS", "Marketing Digital y Comercio Electrónico", "Tecnología Superior"],
  ["MKT-TSU", "Marketing Digital y Comercio Electrónico TSU", "Tecnología Universitaria"],
  ["VEN-TS", "Ventas", "Tecnología Superior"],
  ["DSW-TS", "Desarrollo de Software", "Tecnología Superior"],
  ["DSC-TSU", "Desarrollo de Software y Ciberseguridad", "Tecnología Universitaria"],
  ["RYT-TS", "Redes y Telecomunicaciones", "Tecnología Superior"],
  ["RYT-TSU", "Redes y Telecomunicaciones TSU", "Tecnología Universitaria"],
  ["EST-TS", "Estética Integral", "Tecnología Superior"],
  ["EDB-TS", "Educación Básica", "Tecnología Superior"],
  ["EDI-TS", "Educación Inicial", "Tecnología Superior"],
  ["EDI-TSU", "Educación Inicial TSU", "Tecnología Universitaria"],
  ["PED-TSU", "Pedagogía", "Tecnología Universitaria"],
  ["PAL-TS", "Procesamiento de Alimentos", "Tecnología Superior"],
  ["ADM-TS", "Administración", "Tecnología Superior"],
  ["AEI-TSU", "Administración de Empresas e inteligencia de negocios", "Tecnología Universitaria"],
  ["ATH-TSU", "Administración del Talento Humano", "Tecnología Universitaria"],
  ["CON-TS", "Contabilidad", "Tecnología Superior"],
  ["CTB-TSU", "Contabilidad y Tributación TSU", "Tecnología Universitaria"],
  ["GTH-TS", "Gestión del Talento Humano", "Tecnología Superior"],
  ["SPR-TS", "Seguridad y Prevención de Riesgos Laborales", "Tecnología Superior"],
  ["REF-TS", "Rehabilitación Física", "Tecnología Superior"],
  ["SCO-TS", "Seguridad Ciudadana y Orden Público", "Tecnología Superior"],
  ["GAS-TS", "Gastronomía", "Tecnología Superior"]
].map(([code, name, program]) => ({ code, name, program }));

// Las listas oficiales de asignaturas podrán cargarse por carrera sin cambiar el formulario.
const SUBJECTS = {};

const OPTIONS = {
  areasCapacitadas: [
    "Metodologías de enseñanza", "Evaluación del aprendizaje", "Planificación curricular",
    "Inteligencia artificial", "Herramientas digitales", "Educación inclusiva / DUA",
    "Investigación y redacción académica", "Actualización técnica disciplinar"
  ],
  metodologias: [
    "Aprendizaje basado en proyectos", "Aprendizaje basado en problemas", "Aula invertida",
    "Estudio de casos", "Aprendizaje colaborativo", "Simulación / práctica", "Gamificación", "Clase magistral"
  ],
  herramientas: [
    "Moodle", "Microsoft Teams", "Zoom", "Canva", "Kahoot", "Mentimeter",
    "Herramientas de IA generativa", "Software especializado de la carrera"
  ],
  dificultadesEstudiantes: [
    "Falta de conocimientos previos", "Baja motivación", "Dificultad para comprender contenidos",
    "Dificultad para aplicar teoría en la práctica", "Problemas de trabajo en equipo",
    "Lectura y comprensión", "Dificultades con herramientas tecnológicas", "Gestión del tiempo", "Baja participación"
  ],
  necesidades: [
    "Planificación y diseño curricular", "Metodologías activas", "Evaluación del aprendizaje",
    "Rúbricas e instrumentos de evaluación", "Aprendizaje basado en proyectos", "IA aplicada a la docencia",
    "Herramientas digitales", "Diseño de recursos educativos", "Educación inclusiva", "Diseño Universal para el Aprendizaje (DUA)",
    "Manejo y motivación del grupo", "Comunicación y habilidades socioemocionales", "Innovación educativa",
    "Actualización técnica de la profesión", "Integración entre teoría y práctica", "Ética y buenas prácticas docentes"
  ],
};

const FORMATION_AREAS = [
  "Educación y pedagogía", "Administración y gestión", "Talento humano", "Contabilidad y tributación", "Finanzas",
  "Marketing y ventas", "Software", "Inteligencia artificial", "Ciberseguridad", "Redes y telecomunicaciones",
  "Multimedia y diseño", "Mecánica automotriz", "Mecánica de motos", "Salud y enfermería", "Rehabilitación física",
  "Estética", "Seguridad y prevención de riesgos", "Seguridad ciudadana", "Alimentos", "Gastronomía", "Investigación", "Otra"
];

let currentStep = 1;
const form = document.querySelector("#teacher-form");

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

function careerByCode(code) { return CAREERS.find(c => c.code === code); }

function renderCareers() {
  const select = document.querySelector("#career-select");
  const groups = ["Técnico Superior", "Tecnología Superior", "Tecnología Universitaria"];
  groups.forEach(program => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = program;
    CAREERS.filter(c => c.program === program).forEach(c => {
      const option = document.createElement("option");
      option.value = c.code;
      option.textContent = c.name;
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });

  const other = document.querySelector("#other-careers");
  other.innerHTML = CAREERS.map(c => `<label data-career="${c.code}"><input type="checkbox" name="otrasCarreras" value="${c.code}"><span>${esc(c.name)}</span></label>`).join("");

}

function renderOptions() {
  Object.entries(OPTIONS).forEach(([group, list]) => {
    const container = document.querySelector(`[data-checkbox-group="${group}"]`);
    if (!container) return;
    container.innerHTML = list.map(item => `<label><input type="checkbox" name="${group}" value="${esc(item)}"><span>${esc(item)}</span></label>`).join("");
  });
  document.querySelector("#formation-area").innerHTML += FORMATION_AREAS.map(a => `<option>${esc(a)}</option>`).join("");
}

function updateCareerContext() {
  const career = careerByCode(document.querySelector("#career-select").value);
  document.querySelector("#program-label").textContent = career ? career.program : "";
  document.querySelectorAll("#other-careers [data-career]").forEach(label => {
    const same = label.dataset.career === career?.code;
    label.classList.toggle("hidden", same);
    if (same) label.querySelector("input").checked = false;
  });
  const list = document.querySelector("#subject-list");
  list.innerHTML = (SUBJECTS[career?.code] || []).map(subject => `<option value="${esc(subject)}"></option>`).join("");
}

function bindConditionals() {
  form.addEventListener("change", event => {
    const { name, value } = event.target;
    if (name === "otrasCarrerasSiNo") document.querySelector("#other-careers-wrap").classList.toggle("hidden", value !== "Sí");
    if (name === "capacitacion12m") document.querySelector("#training-history").classList.toggle("hidden", value !== "Sí");
    if (name === "cursaFormacion") document.querySelector("#current-study").classList.toggle("hidden", value !== "Sí");
    if (name === "interesFormacion") document.querySelector("#future-study").classList.toggle("hidden", value === "No por el momento");
    if (name === "carreraPrincipal") updateCareerContext();
    if (name === "necesidades") enforceMaxNeeds(event.target);
  });
}

function enforceMaxNeeds(changed) {
  const checked = [...form.querySelectorAll('input[name="necesidades"]:checked')];
  if (checked.length > 3) {
    changed.checked = false;
    showToast("Puede seleccionar un máximo de 3 necesidades.");
  }
  const actual = [...form.querySelectorAll('input[name="necesidades"]:checked')];
  document.querySelector("#needs-count").textContent = actual.length;
  const select = document.querySelector("#priority-select");
  const current = select.value;
  select.innerHTML = `<option value="">Seleccione la principal...</option>` + actual.map(i => `<option>${esc(i.value)}</option>`).join("");
  if (actual.some(i => i.value === current)) select.value = current;
}

function ecuadorCedulaValid(value) {
  if (!/^\d{10}$/.test(value) || /^([0-9])\1{9}$/.test(value)) return false;
  const province = Number(value.slice(0, 2));
  if (province < 1 || province > 24 || Number(value[2]) >= 6) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(value[i]) * (i % 2 === 0 ? 2 : 1);
    if (n > 9) n -= 9;
    sum += n;
  }
  return (10 - (sum % 10)) % 10 === Number(value[9]);
}

function validateStep(step) {
  const panel = document.querySelector(`[data-step="${step}"]`);
  panel.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
  const required = [...panel.querySelectorAll("[required]")].filter(el => !el.closest(".hidden"));
  for (const field of required) {
    if (field.type === "radio") {
      if (!panel.querySelector(`input[name="${CSS.escape(field.name)}"]:checked`)) {
        showToast("Complete todas las preguntas obligatorias.");
        field.closest("fieldset")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      continue;
    }
    if (field.type === "checkbox" && !field.checked) {
      showToast("Debe aceptar la declaración para continuar.");
      return false;
    }
    if (!field.value.trim()) {
      field.classList.add("invalid"); field.focus(); showToast("Complete los campos obligatorios."); return false;
    }
    if (field.type === "email" && !field.validity.valid) {
      field.classList.add("invalid"); field.focus(); showToast("Revise el correo electrónico ingresado."); return false;
    }
  }

  if (step === 1) {
    const cedula = form.elements.cedula.value.trim();
    if (!ecuadorCedulaValid(cedula)) {
      form.elements.cedula.classList.add("invalid"); form.elements.cedula.focus(); showToast("Ingrese una cédula ecuatoriana válida."); return false;
    }
    if (!/^09\d{8}$/.test(form.elements.celular.value.trim())) {
      form.elements.celular.classList.add("invalid"); form.elements.celular.focus(); showToast("Ingrese un celular ecuatoriano válido de 10 dígitos."); return false;
    }
  }
  if (step === 3 && form.querySelectorAll('input[name="necesidades"]:checked').length === 0) {
    showToast("Seleccione al menos una necesidad de capacitación."); return false;
  }
  if (step === 3) {
    for (const [name, label] of [["metodologias", "metodología"], ["herramientas", "herramienta tecnológica"], ["dificultadesEstudiantes", "dificultad de los estudiantes"]]) {
      if (form.querySelectorAll(`input[name="${name}"]:checked`).length === 0) {
        showToast(`Seleccione al menos una opción en ${label}.`); return false;
      }
    }
  }
  if (step === 4 && getRadio("cursaFormacion") === "Sí") {
    for (const name of ["nivelCursa", "etapaFormacion", "programaActual", "institucionActual"]) {
      if (!form.elements[name].value.trim()) { form.elements[name].focus(); showToast("Complete los datos de la formación que cursa actualmente."); return false; }
    }
  }
  if (step === 4 && getRadio("interesFormacion") !== "No por el momento") {
    for (const name of ["nivelDeseado", "tipoFormacion", "areaFormacion", "relacionFormacion", "inicioPrevisto", "modalidadFormacion", "barreraFormacion", "apoyoFormacion"]) {
      if (!form.elements[name].value.trim()) { form.elements[name].focus(); showToast("Complete todos los datos de su interés de formación."); return false; }
    }
  }
  return true;
}

function setStep(step) {
  currentStep = Math.min(5, Math.max(1, step));
  document.querySelectorAll(".form-step").forEach(el => el.classList.toggle("active", Number(el.dataset.step) === currentStep));
  document.querySelectorAll("[data-step-indicator]").forEach(el => {
    const n = Number(el.dataset.stepIndicator);
    el.classList.toggle("active", n === currentStep);
    el.classList.toggle("done", n < currentStep);
  });
  const pct = currentStep * 20;
  document.querySelector("#progress-percent").textContent = `${pct}%`;
  document.querySelector("#progress-bar").style.width = `${pct}%`;
  document.querySelector("#back-btn").classList.toggle("hidden", currentStep === 1);
  document.querySelector("#next-btn").classList.toggle("hidden", currentStep === 5);
  document.querySelector("#submit-btn").classList.toggle("hidden", currentStep !== 5);
  if (currentStep === 5) renderReview();
  document.querySelector(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getMulti(name) { return [...form.querySelectorAll(`input[name="${CSS.escape(name)}"]:checked`)].map(el => el.value); }
function getRadio(name) { return form.querySelector(`input[name="${CSS.escape(name)}"]:checked`)?.value || ""; }

function serializeForm() {
  const fd = new FormData(form);
  const career = careerByCode(fd.get("carreraPrincipal"));
  return {
    periodCode: CONFIG.periodCode || "2026-2027",
    website: fd.get("website") || "",
    docente: {
      cedula: String(fd.get("cedula") || "").trim(),
      nombres: String(fd.get("nombres") || "").trim(),
      apellidos: String(fd.get("apellidos") || "").trim(),
      correoInstitucional: String(fd.get("correoInstitucional") || "").trim().toLowerCase(),
      correoPersonal: String(fd.get("correoPersonal") || "").trim().toLowerCase(),
      celular: String(fd.get("celular") || "").trim()
    },
    perfil: {
      carreraPrincipal: career?.code || "",
      carreraPrincipalNombre: career?.name || "",
      programa: career?.program || "",
      otrasCarreras: getRadio("otrasCarrerasSiNo") === "Sí" ? getMulti("otrasCarreras") : [],
      dedicacion: fd.get("dedicacion") || "",
      sede: fd.get("sede") || "",
      modalidad: fd.get("modalidad") || "",
      asignaturaCompleja: fd.get("asignaturaCompleja") || "",
      causaAsignatura: getRadio("causaAsignatura"),
      refuerzoAsignatura: getRadio("refuerzoAsignatura")
    },
    capacitacion: {
      capacitacion12m: getRadio("capacitacion12m"),
      areasCapacitadas: getRadio("capacitacion12m") === "Sí" ? getMulti("areasCapacitadas") : [],
      aplicaCapacitacion: getRadio("capacitacion12m") === "Sí" ? (fd.get("aplicaCapacitacion") || "") : "",
      metodologias: getMulti("metodologias"),
      herramientas: getMulti("herramientas"),
      dificultadesEstudiantes: getMulti("dificultadesEstudiantes"),
      necesidades: getMulti("necesidades"),
      necesidadPrioritaria: fd.get("necesidadPrioritaria") || "",
      nivelNecesidad: fd.get("nivelNecesidad") || ""
    },
    formacion: {
      nivelAcademico: fd.get("nivelAcademico") || "",
      afinidadTitulo: fd.get("afinidadTitulo") || "",
      cursaFormacion: getRadio("cursaFormacion"),
      nivelCursa: getRadio("cursaFormacion") === "Sí" ? (fd.get("nivelCursa") || "") : "",
      etapaFormacion: getRadio("cursaFormacion") === "Sí" ? (fd.get("etapaFormacion") || "") : "",
      programaActual: getRadio("cursaFormacion") === "Sí" ? (fd.get("programaActual") || "") : "",
      institucionActual: getRadio("cursaFormacion") === "Sí" ? (fd.get("institucionActual") || "") : "",
      interesFormacion: getRadio("interesFormacion"),
      nivelDeseado: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("nivelDeseado") || "") : "",
      tipoFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("tipoFormacion") || "") : "",
      areaFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("areaFormacion") || "") : "",
      relacionFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("relacionFormacion") || "") : "",
      inicioPrevisto: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("inicioPrevisto") || "") : "",
      modalidadFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("modalidadFormacion") || "") : "",
      barreraFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("barreraFormacion") || "") : "",
      apoyoFormacion: getRadio("interesFormacion") !== "No por el momento" ? (fd.get("apoyoFormacion") || "") : ""
    }
  };
}

function renderReview() {
  const d = serializeForm();
  const items = [
    ["Identificación", [["Docente", `${d.docente.nombres} ${d.docente.apellidos}`.trim()], ["Cédula", d.docente.cedula], ["Carrera principal", d.perfil.carreraPrincipalNombre], ["Programa", d.perfil.programa], ["Dedicación", d.perfil.dedicacion], ["Sede", d.perfil.sede], ["Modalidad", d.perfil.modalidad]]],
    ["Capacitación", [["Capacitación últimos 12 meses", d.capacitacion.capacitacion12m], ["Prioridad", d.capacitacion.necesidadPrioritaria], ["Nivel de necesidad", d.capacitacion.nivelNecesidad], ["Necesidades seleccionadas", d.capacitacion.necesidades.join(", ")]]],
    ["Formación", [["Nivel actual", d.formacion.nivelAcademico], ["Actualmente cursa un título académico", d.formacion.cursaFormacion], ["Interés en obtener otro título", d.formacion.interesFormacion], ["Nivel deseado", d.formacion.nivelDeseado || "No aplica"], ["Área de interés", d.formacion.areaFormacion || "No aplica"], ["Condición institucional", d.formacion.apoyoFormacion || "No aplica"]]]
  ];
  document.querySelector("#review-panel").innerHTML = items.map(([title, rows]) => `<section class="review-section"><h3>${esc(title)}</h3><div class="review-grid">${rows.map(([label, value]) => `<div class="review-item"><span>${esc(label)}</span><strong>${esc(value || "—")}</strong></div>`).join("")}</div></section>`).join("");
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

async function submitTeacher(event) {
  event.preventDefault();
  if (!validateStep(5)) return;
  const button = document.querySelector("#submit-btn");
  const status = document.querySelector("#submit-status");
  button.disabled = true; button.textContent = "Enviando...";
  status.className = "status-box hidden";
  try {
    const result = await api("/api/submissions", { method: "POST", body: JSON.stringify(serializeForm()) });
    status.textContent = result.message || "Formulario registrado correctamente.";
    status.className = "status-box success";
    button.textContent = "Enviado";
    showToast("Respuesta registrada correctamente.");
    localStorage.removeItem("itsqmet-form-draft");
  } catch (error) {
    status.textContent = error.message;
    status.className = "status-box error";
    button.disabled = false; button.textContent = "Enviar formulario";
  }
}

function bindNavigation() {
  document.querySelector("#next-btn").addEventListener("click", () => { if (validateStep(currentStep)) setStep(currentStep + 1); });
  document.querySelector("#back-btn").addEventListener("click", () => setStep(currentStep - 1));
  form.addEventListener("submit", submitTeacher);
}

function bindDraft() {
  let timer;
  form.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const draft = {};
      new FormData(form).forEach((value, key) => { if (key !== "website") { if (draft[key]) draft[key] = [].concat(draft[key], value); else draft[key] = value; } });
      localStorage.setItem("itsqmet-form-draft", JSON.stringify(draft));
    }, 500);
  });
}

function restoreDraft() {
  let draft;
  try { draft = JSON.parse(localStorage.getItem("itsqmet-form-draft") || "null"); } catch { return; }
  if (!draft || typeof draft !== "object") return;
  Object.entries(draft).forEach(([name, raw]) => {
    const values = Array.isArray(raw) ? raw.map(String) : [String(raw)];
    const fields = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
    fields.forEach(field => {
      if (field.type === "checkbox" || field.type === "radio") field.checked = values.includes(field.value);
      else if (values.length) field.value = values[0];
    });
  });
  updateCareerContext();
  const checkedNeed = form.querySelector('input[name="necesidades"]:checked');
  if (checkedNeed) enforceMaxNeeds(checkedNeed);
  const other = getRadio("otrasCarrerasSiNo");
  document.querySelector("#other-careers-wrap").classList.toggle("hidden", other !== "Sí");
  document.querySelector("#training-history").classList.toggle("hidden", getRadio("capacitacion12m") !== "Sí");
  document.querySelector("#current-study").classList.toggle("hidden", getRadio("cursaFormacion") !== "Sí");
  const interest = getRadio("interesFormacion");
  document.querySelector("#future-study").classList.toggle("hidden", !interest || interest === "No por el momento");
}

function init() {
  renderCareers();
  renderOptions();
  restoreDraft();
  bindConditionals();
  bindNavigation();
  bindDraft();
  document.querySelector("#career-select").addEventListener("change", updateCareerContext);
  setStep(1);
}

document.addEventListener("DOMContentLoaded", init);
