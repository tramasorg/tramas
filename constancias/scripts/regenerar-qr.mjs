// Regenera el código QR de todas las constancias listadas en data.json.
// Uso: npm run regenerar -- https://tramasorg.github.io/tramas/constancias
//
// Los archivos se pueden renombrar a mano para identificarlos más fácil
// (p. ej. "BelenTEAV-2026-0001.png"). Este script respeta esos nombres: si ya
// existe un PNG que contiene el folio, lo sobrescribe en su sitio en vez de
// crear un duplicado con el nombre del folio.
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

const DATA_PATH = path.resolve("data.json");
const QR_DIR = path.resolve("qrcodes");
const BASE_POR_DEFECTO = "https://tramasorg.github.io/tramas/constancias";

// Busca un PNG existente cuyo nombre contenga el folio.
function archivoExistente(archivos, folio) {
  const f = folio.toLowerCase();
  const coincidencias = archivos.filter(
    (a) => a.toLowerCase().endsWith(".png") && a.toLowerCase().includes(f)
  );
  if (coincidencias.length > 1) {
    throw new Error(
      `Hay ${coincidencias.length} archivos para el folio ${folio}: ` +
        `${coincidencias.join(", ")}. Deja solo uno y vuelve a correr el script.`
    );
  }
  return coincidencias[0] || null;
}

async function main() {
  const base = (process.argv[2] || BASE_POR_DEFECTO).replace(/\/$/, "");
  const data = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  const records = Array.isArray(data.records) ? data.records : [];

  if (!records.length) {
    console.error("data.json no tiene constancias registradas.");
    process.exit(1);
  }

  await fs.mkdir(QR_DIR, { recursive: true });
  const archivos = await fs.readdir(QR_DIR);

  for (const rec of records) {
    const url = `${base}/?folio=${encodeURIComponent(rec.folio)}`;
    const existente = archivoExistente(archivos, rec.folio);
    const nombre = existente || `${rec.folio}.png`;
    await QRCode.toFile(path.join(QR_DIR, nombre), url, { width: 512, margin: 1 });
    console.log(`${rec.folio}  ->  ${nombre}${existente ? "" : "  (nuevo)"}`);
  }

  console.log(`\n${records.length} códigos QR regenerados en ${path.relative(process.cwd(), QR_DIR)}/`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
