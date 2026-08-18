/**
 * Entry point untuk cPanel "Setup Node.js App" (Phusion Passenger) — DomaiNesia.
 * Menjalankan Next.js production. Wajib jalankan `npm run build` dulu (menghasilkan folder .next).
 *
 * Di panel Node.js App cPanel:
 *   - Application startup file : server.js
 *   - Application mode         : Production
 * Passenger menyuntikkan PORT lewat process.env.PORT.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(port, () => {
      console.log(`GEMATI Pagerwojo siap di port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Gagal start Next.js:", err);
    process.exit(1);
  });
