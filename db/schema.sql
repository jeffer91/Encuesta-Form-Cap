CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS periodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carreras (
  codigo text PRIMARY KEY,
  nombre text NOT NULL UNIQUE,
  programa text NOT NULL CHECK (programa IN ('Técnico Superior','Tecnología Superior','Tecnología Universitaria')),
  activa boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS asignaturas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  carrera_codigo text NOT NULL REFERENCES carreras(codigo) ON UPDATE CASCADE ON DELETE RESTRICT,
  nombre text NOT NULL,
  activa boolean NOT NULL DEFAULT true,
  UNIQUE (carrera_codigo, nombre)
);

CREATE TABLE IF NOT EXISTS docentes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cedula char(10) NOT NULL UNIQUE,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  correo_institucional text NOT NULL,
  correo_personal text NOT NULL,
  celular varchar(15) NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE docentes ADD COLUMN IF NOT EXISTS apellidos text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS encuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id bigint NOT NULL REFERENCES docentes(id) ON DELETE RESTRICT,
  periodo_id uuid NOT NULL REFERENCES periodos(id) ON DELETE RESTRICT,
  carrera_principal_codigo text NOT NULL REFERENCES carreras(codigo) ON DELETE RESTRICT,
  programa text NOT NULL,
  dedicacion text NOT NULL,
  sede text NOT NULL,
  asignatura_compleja text NOT NULL,
  causa_asignatura text NOT NULL,
  refuerzo_asignatura text NOT NULL,
  enviado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (docente_id, periodo_id)
);

CREATE TABLE IF NOT EXISTS docente_carreras (
  encuesta_id uuid NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  carrera_codigo text NOT NULL REFERENCES carreras(codigo) ON DELETE RESTRICT,
  PRIMARY KEY (encuesta_id, carrera_codigo)
);

CREATE TABLE IF NOT EXISTS capacitacion_respuestas (
  encuesta_id uuid PRIMARY KEY REFERENCES encuestas(id) ON DELETE CASCADE,
  capacitacion_12m text NOT NULL,
  aplica_capacitacion text,
  necesidad_prioritaria text NOT NULL,
  nivel_necesidad text NOT NULL
);

CREATE TABLE IF NOT EXISTS capacitacion_selecciones (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  encuesta_id uuid NOT NULL REFERENCES encuestas(id) ON DELETE CASCADE,
  categoria text NOT NULL CHECK (categoria IN ('areas_capacitadas','metodologias','herramientas','dificultades_estudiantes','necesidades','recursos','limitaciones')),
  valor text NOT NULL,
  UNIQUE (encuesta_id, categoria, valor)
);

CREATE TABLE IF NOT EXISTS formacion_respuestas (
  encuesta_id uuid PRIMARY KEY REFERENCES encuestas(id) ON DELETE CASCADE,
  nivel_academico text NOT NULL,
  afinidad_titulo text NOT NULL,
  cursa_formacion text NOT NULL,
  nivel_cursa text,
  etapa_formacion text,
  programa_actual text,
  institucion_actual text,
  interes_formacion text NOT NULL,
  nivel_deseado text,
  tipo_formacion text,
  area_formacion text,
  relacion_formacion text,
  inicio_previsto text,
  modalidad_formacion text,
  barrera_formacion text,
  apoyo_formacion text
);

CREATE INDEX IF NOT EXISTS idx_encuestas_periodo ON encuestas(periodo_id);
CREATE INDEX IF NOT EXISTS idx_encuestas_carrera ON encuestas(carrera_principal_codigo);
CREATE INDEX IF NOT EXISTS idx_cap_sel_categoria_valor ON capacitacion_selecciones(categoria, valor);

INSERT INTO periodos (codigo, nombre, activo) VALUES ('2026-2027', 'Período académico 2026–2027', true)
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, activo = EXCLUDED.activo;

INSERT INTO carreras (codigo, nombre, programa) VALUES
('ENF-TS','Enfermería','Técnico Superior'),
('MEC-TS','Mecánica Automotriz','Tecnología Superior'),
('MOT-TS','Mecánica de Motos','Tecnología Superior'),
('DIM-TS','Diseño Multimedia','Tecnología Superior'),
('MKT-TS','Marketing Digital y Comercio Electrónico','Tecnología Superior'),
('MKT-TSU','Marketing Digital y Comercio Electrónico TSU','Tecnología Universitaria'),
('VEN-TS','Ventas','Tecnología Superior'),
('DSW-TS','Desarrollo de Software','Tecnología Superior'),
('DSC-TSU','Desarrollo de Software y Ciberseguridad','Tecnología Universitaria'),
('RYT-TS','Redes y Telecomunicaciones','Tecnología Superior'),
('RYT-TSU','Redes y Telecomunicaciones TSU','Tecnología Universitaria'),
('EST-TS','Estética Integral','Tecnología Superior'),
('EDB-TS','Educación Básica','Tecnología Superior'),
('EDI-TS','Educación Inicial','Tecnología Superior'),
('EDI-TSU','Educación Inicial TSU','Tecnología Universitaria'),
('PED-TSU','Pedagogía','Tecnología Universitaria'),
('PAL-TS','Procesamiento de Alimentos','Tecnología Superior'),
('ADM-TS','Administración','Tecnología Superior'),
('AEI-TSU','Administración de Empresas e inteligencia de negocios','Tecnología Universitaria'),
('ATH-TSU','Administración del Talento Humano','Tecnología Universitaria'),
('CON-TS','Contabilidad','Tecnología Superior'),
('CTB-TSU','Contabilidad y Tributación TSU','Tecnología Universitaria'),
('GTH-TS','Gestión del Talento Humano','Tecnología Superior'),
('SPR-TS','Seguridad y Prevención de Riesgos Laborales','Tecnología Superior'),
('REF-TS','Rehabilitación Física','Tecnología Superior'),
('SCO-TS','Seguridad Ciudadana y Orden Público','Tecnología Superior'),
('GAS-TS','Gastronomía','Tecnología Superior')
ON CONFLICT (codigo) DO UPDATE SET nombre = EXCLUDED.nombre, programa = EXCLUDED.programa, activa = true;
