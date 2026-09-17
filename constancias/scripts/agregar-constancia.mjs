// Agrega una constancia a data.json y genera su código QR en /qrcodes.
// Uso: npm run agregar
import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import QRCode from "qrcode";

const DATA_PATH = path.resolve("data.json");
const QR_DIR = path.resolve("qrcodes");

// Cola de líneas robusta ante pegado rápido de varias respuestas a la vez
// (rl.question() de node:readline/promises puede perder líneas si llegan
// todas antes de registrar la siguiente pregunta; esto lo evita).
function crearLector(rl) {
  const pendientes = [];
  const esperando = [];
  rl.on("line", (linea) => {
    if (esperando.length) esperando.shift()(linea);
    else pendientes.push(linea);
  });
  return function siguienteLinea() {
    if (pendientes.length) return Promise.resolve(pendientes.shift());
    return new Promise((resolve) => esperando.push(resolve));
  };
}

async function pregunta(rl, siguienteLinea, texto) {
  output.write(texto);
  return siguienteLinea();
}

function iniciales(nombre) {
  const partes = (nombre || "AC").trim().split(/\s+/).filter(Boolean);
  const letras = partes.map((p) => p[0]).join("").toUpperCase();
  return (letras || "AC").slice(0, 4);
}

function siguienteFolio(data) {
  const anio = new Date().getFullYear();
  const seq = String(data.records.length + 1).padStart(4, "0");
  return `${iniciales(data.institucion)}-${anio}-${seq}`;
}

async function main() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data.records)) data.records = [];

  const rl = readline.createInterface({ input, terminal: false });
  const siguienteLinea = crearLector(rl);

  console.log(`\nInstitución actual: ${data.institucion || "(sin definir)"}`);
  const cambiarInst = await pregunta(rl, siguienteLinea, "¿Cambiar el nombre de la institución? (Enter para dejarlo igual): ");
  if (cambiarInst.trim()) data.institucion = cambiarInst.trim();

  const nombre = await pregunta(rl, siguienteLinea, "\nNombre de la persona: ");
  const curso = await pregunta(rl, siguienteLinea, "\nCurso: ");
  const horas = await pregunta(rl, siguienteLinea, "\nHoras: ");
  const fecha = await pregunta(rl, siguienteLinea, "\nFecha de emisión (AAAA-MM-DD): ");
  const dominio = await pregunta(
    rl,
    siguienteLinea,
    "\nURL de esta página de verificación (ej. https://josafatacosta.github.io/Tramas/constancias): "
  );

  rl.close();

  if (!nombre.trim() || !curso.trim() || !horas.trim() || !fecha.trim()) {
    console.error("\nTodos los campos son obligatorios. No se guardó nada.");
    process.exit(1);
  }

  const folio = siguienteFolio(data);
  data.records.push({
    folio,
    nombre: nombre.trim(),
    curso: curso.trim(),
    horas: Number(horas) || horas.trim(),
    fecha: fecha.trim(),
  });

  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");

  await fs.mkdir(QR_DIR, { recursive: true });
  const url = dominio.trim()
    ? `${dominio.trim().replace(/\/$/, "")}/?folio=${encodeURIComponent(folio)}`
    : `?folio=${encodeURIComponent(folio)}`;
  const qrPath = path.join(QR_DIR, `${folio}.png`);
  await QRCode.toFile(qrPath, url, { width: 512, margin: 1 });

  console.log(`\nListo.`);
  console.log(`Folio generado: ${folio}`);
  console.log(`data.json actualizado.`);
  console.log(`QR guardado en: ${path.relative(process.cwd(), qrPath)}`);
  console.log(`El QR apunta a: ${url}`);
  console.log(`\nSiguiente paso: git add -A && git commit -m "Agrega constancia ${folio}" && git push`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
