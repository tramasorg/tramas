// Regenera el código QR de todas las constancias listadas en data.json.
// Uso: npm run regenerar -- https://tramasorg.github.io/tramas/constancias
import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

const DATA_PATH = path.resolve("data.json");
const QR_DIR = path.resolve("qrcodes");
const BASE_POR_DEFECTO = "https://tramasorg.github.io/tramas/constancias";

async function main() {
  const base = (process.argv[2] || BASE_POR_DEFECTO).replace(/\/$/, "");
  const data = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  const records = Array.isArray(data.records) ? data.records : [];

  if (!records.length) {
    console.error("data.json no tiene constancias registradas.");
    process.exit(1);
  }

  await fs.mkdir(QR_DIR, { recursive: true });

  for (const rec of records) {
    const url = `${base}/?folio=${encodeURIComponent(rec.folio)}`;
    const qrPath = path.join(QR_DIR, `${rec.folio}.png`);
    await QRCode.toFile(qrPath, url, { width: 512, margin: 1 });
    console.log(`${rec.folio}  ->  ${url}`);
  }

  console.log(`\n${records.length} códigos QR regenerados en ${path.relative(process.cwd(), QR_DIR)}/`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
