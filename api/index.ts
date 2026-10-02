import { timingSafeEqual } from "node:crypto";
import { attachDatabasePool } from "@neon/functions";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

const ALLOWED_ORIGINS = new Set([
  "https://jeffer91.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000"
]);

const CAREER_CODES = new Set([
  "ENF-TS","MEC-TS","MOT-TS","DIM-TS","MKT-TS","MKT-TSU","VEN-TS","DSW-TS","DSC-TSU",
  "RYT-TS","RYT-TSU","EST-TS","EDB-TS","EDI-TS","EDI-TSU","PED-TSU","PAL-TS","ADM-TS",
  "AEI-TSU","ATH-TSU","CON-TS","CTB-TSU","GTH-TS","SPR-TS","REF-TS","SCO-TS","GAS-TS"
]);

const rateBuckets = new Map<string, { start: number; count: number }>();

function cors(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "";
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": allowed } : {}),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(request: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(request), "Content-Type": "application/json; charset=utf-8" }
  });
}

function text(v: unknown, max = 500) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function list(v: unknown, max = 30) {
  return Array.isArray(v) ? [...new Set(v.map(x => text(x, 180)).filter(Boolean))].slice(0, max) : [];
}

function cedulaValida(value: string) {
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

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function rateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("cf-connecting-ip") || "unknown";
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.start > 60_000) {
    rateBuckets.set(key, { start: now, count: 1 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 10;
}

function requireFields(obj: Record<string, unknown>, names: string[]) {
  return names.every(name => text(obj?.[name]).length > 0);
}

async function createSubmission(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(request, { message: "Origen no autorizado." }, 403);
  if (rateLimited(request)) return json(request, { message: "Demasiados intentos. Espere un minuto y vuelva a intentar." }, 429);
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 60_000) return json(request, { message: "Solicitud demasiado grande." }, 413);

  let body: any;
  try { body = await request.json(); }
  catch { return json(request, { message: "Solicitud inválida." }, 400); }

  if (text(body.website)) return json(request, { message: "Formulario registrado correctamente." }, 201);
  const docente = body.docente || {};
  const perfil = body.perfil || {};
  const cap = body.capacitacion || {};
  const form = body.formacion || {};
  const periodCode = text(body.periodCode, 40);

  if (!requireFields(docente, ["cedula","nombres","apellidos","correoInstitucional","correoPersonal","celular"]) ||
      !requireFields(perfil, ["carreraPrincipal","programa","dedicacion","sede","asignaturaCompleja","causaAsignatura","refuerzoAsignatura"]) ||
      !requireFields(cap, ["capacitacion12m","necesidadPrioritaria","nivelNecesidad"]) ||
      !requireFields(form, ["nivelAcademico","afinidadTitulo","cursaFormacion","interesFormacion"]) || !periodCode) {
    return json(request, { message: "Faltan respuestas obligatorias." }, 400);
  }
  if (!cedulaValida(text(docente.cedula)) || !/^09\d{8}$/.test(text(docente.celular))) return json(request, { message: "Revise la cédula y el celular." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(text(docente.correoInstitucional)) || !/^\S+@\S+\.\S+$/.test(text(docente.correoPersonal))) return json(request, { message: "Revise los correos electrónicos." }, 400);
  if (!CAREER_CODES.has(text(perfil.carreraPrincipal))) return json(request, { message: "La carrera seleccionada no es válida." }, 400);

  const otrasCarreras = list(perfil.otrasCarreras, 10).filter(code => CAREER_CODES.has(code) && code !== perfil.carreraPrincipal);
  const needs = list(cap.necesidades, 3);
  if (!needs.length || needs.length > 3 || !needs.includes(text(cap.necesidadPrioritaria))) return json(request, { message: "Revise las necesidades de capacitación seleccionadas." }, 400);
  for (const group of [cap.metodologias, cap.herramientas, cap.dificultadesEstudiantes]) {
    if (!list(group).length) return json(request, { message: "Complete las preguntas obligatorias de capacitación." }, 400);
  }
  if (text(form.cursaFormacion) === "Sí" && !requireFields(form, ["nivelCursa","etapaFormacion","programaActual","institucionActual"])) return json(request, { message: "Complete la información de la formación que cursa actualmente." }, 400);
  if (text(form.interesFormacion) !== "No por el momento" && !requireFields(form, ["nivelDeseado","tipoFormacion","areaFormacion","relacionFormacion","inicioPrevisto","modalidadFormacion","barreraFormacion","apoyoFormacion"])) return json(request, { message: "Complete la información de formación futura." }, 400);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const period = await client.query("SELECT id FROM periodos WHERE codigo=$1 AND activo=true", [periodCode]);
    if (!period.rowCount) throw Object.assign(new Error("El período de la encuesta no está habilitado."), { status: 400 });
    const career = await client.query("SELECT programa FROM carreras WHERE codigo=$1 AND activa=true", [text(perfil.carreraPrincipal)]);
    if (!career.rowCount || career.rows[0].programa !== text(perfil.programa)) throw Object.assign(new Error("La carrera y el programa no coinciden."), { status: 400 });

    const teacher = await client.query(
      `INSERT INTO docentes (cedula,nombres,apellidos,correo_institucional,correo_personal,celular)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (cedula) DO UPDATE SET nombres=EXCLUDED.nombres, apellidos=EXCLUDED.apellidos, correo_institucional=EXCLUDED.correo_institucional,
         correo_personal=EXCLUDED.correo_personal, celular=EXCLUDED.celular, actualizado_en=now()
       RETURNING id`,
      [text(docente.cedula), text(docente.nombres, 120), text(docente.apellidos, 120), text(docente.correoInstitucional, 254).toLowerCase(), text(docente.correoPersonal, 254).toLowerCase(), text(docente.celular, 15)]
    );
    const survey = await client.query(
      `INSERT INTO encuestas (docente_id,periodo_id,carrera_principal_codigo,programa,dedicacion,sede,modalidad,asignatura_compleja,causa_asignatura,refuerzo_asignatura)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [teacher.rows[0].id, period.rows[0].id, text(perfil.carreraPrincipal), text(perfil.programa), text(perfil.dedicacion), text(perfil.sede), text(perfil.asignaturaCompleja, 250), text(perfil.causaAsignatura), text(perfil.refuerzoAsignatura)]
    );
    const surveyId = survey.rows[0].id;

    for (const code of otrasCarreras) await client.query("INSERT INTO docente_carreras (encuesta_id,carrera_codigo) VALUES ($1,$2)", [surveyId, code]);
    await client.query(
      "INSERT INTO capacitacion_respuestas (encuesta_id,capacitacion_12m,aplica_capacitacion,necesidad_prioritaria,nivel_necesidad) VALUES ($1,$2,$3,$4,$5)",
      [surveyId, text(cap.capacitacion12m), text(cap.aplicaCapacitacion) || null, text(cap.necesidadPrioritaria), text(cap.nivelNecesidad)]
    );
    const selections: Array<[string, unknown]> = [
      ["areas_capacitadas", cap.areasCapacitadas], ["metodologias", cap.metodologias], ["herramientas", cap.herramientas],
      ["dificultades_estudiantes", cap.dificultadesEstudiantes], ["necesidades", cap.necesidades]
    ];
    for (const [category, values] of selections) for (const value of list(values)) {
      await client.query("INSERT INTO capacitacion_selecciones (encuesta_id,categoria,valor) VALUES ($1,$2,$3)", [surveyId, category, value]);
    }
    await client.query(
      `INSERT INTO formacion_respuestas
       (encuesta_id,nivel_academico,afinidad_titulo,cursa_formacion,nivel_cursa,etapa_formacion,programa_actual,institucion_actual,interes_formacion,nivel_deseado,tipo_formacion,area_formacion,relacion_formacion,inicio_previsto,modalidad_formacion,barrera_formacion,apoyo_formacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [surveyId, text(form.nivelAcademico), text(form.afinidadTitulo), text(form.cursaFormacion), text(form.nivelCursa)||null, text(form.etapaFormacion)||null,
       text(form.programaActual,250)||null, text(form.institucionActual,250)||null, text(form.interesFormacion), text(form.nivelDeseado)||null,
       text(form.tipoFormacion)||null, text(form.areaFormacion)||null, text(form.relacionFormacion)||null, text(form.inicioPrevisto)||null,
       text(form.modalidadFormacion)||null, text(form.barreraFormacion)||null, text(form.apoyoFormacion)||null]
    );
    await client.query("COMMIT");
    return json(request, { ok: true, id: surveyId, message: "Formulario registrado correctamente." }, 201);
  } catch (error: any) {
    await client.query("ROLLBACK");
    if (error?.code === "23505" && String(error?.constraint || "").includes("docente_id")) return json(request, { message: "Ya existe una respuesta de esta cédula para el período actual." }, 409);
    console.error("submission_error", error?.code || error?.message);
    return json(request, { message: error?.status ? error.message : "No fue posible registrar el formulario. Intente nuevamente." }, error?.status || 500);
  } finally { client.release(); }
}

async function adminResponses(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const supplied = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  const expected = process.env.ADMIN_KEY || "";
  if (!expected || !supplied || !constantTimeEqual(supplied, expected)) return json(request, { message: "Clave administrativa incorrecta." }, 401);
  const url = new URL(request.url);
  const period = text(url.searchParams.get("period") || "2026-2027", 40);
  const result = await pool.query(
    `SELECT e.id, d.cedula, d.nombres, d.apellidos, d.correo_institucional, d.correo_personal, d.celular,
            e.carrera_principal_codigo AS carrera_codigo, c.nombre AS carrera_nombre, e.programa, e.dedicacion, e.sede,
            e.asignatura_compleja, e.causa_asignatura, e.refuerzo_asignatura,
            cr.capacitacion_12m, cr.necesidad_prioritaria, cr.nivel_necesidad,
            fr.nivel_academico, fr.afinidad_titulo, fr.cursa_formacion, fr.interes_formacion,
            fr.nivel_deseado, fr.tipo_formacion, fr.area_formacion, fr.inicio_previsto, fr.modalidad_formacion,
            fr.barrera_formacion, fr.apoyo_formacion, e.enviado_en AS submitted_at
       FROM encuestas e
       JOIN docentes d ON d.id=e.docente_id
       JOIN periodos p ON p.id=e.periodo_id
       JOIN carreras c ON c.codigo=e.carrera_principal_codigo
       JOIN capacitacion_respuestas cr ON cr.encuesta_id=e.id
       JOIN formacion_respuestas fr ON fr.encuesta_id=e.id
      WHERE p.codigo=$1 ORDER BY e.enviado_en DESC LIMIT 5000`, [period]
  );
  return json(request, { rows: result.rows, count: result.rowCount });
}

async function catalog(request: Request) {
  const [careers, subjects] = await Promise.all([
    pool.query("SELECT codigo, nombre, programa FROM carreras WHERE activa=true ORDER BY programa,nombre"),
    pool.query("SELECT carrera_codigo, nombre FROM asignaturas WHERE activa=true ORDER BY carrera_codigo,nombre")
  ]);
  return json(request, { careers: careers.rows, subjects: subjects.rows });
}

export default {
  async fetch(request: Request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request) });
    const { pathname } = new URL(request.url);
    if (request.method === "GET" && (pathname === "/" || pathname === "/api/health")) return json(request, { ok: true, service: "ITSQMET Docentes API" });
    if (request.method === "GET" && pathname === "/api/catalog") return catalog(request);
    if (request.method === "POST" && pathname === "/api/submissions") return createSubmission(request);
    if (request.method === "GET" && pathname === "/api/admin/responses") return adminResponses(request);
    return json(request, { message: "Ruta no encontrada." }, 404);
  }
};
