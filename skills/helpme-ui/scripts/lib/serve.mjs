// Minimal static server on 127.0.0.1 for capturing local files. Refuses traversal,
// dot paths (except .helpme) and symlinks that leave the root.
import { createServer } from 'node:http';
import { realpathSync, statSync, createReadStream } from 'node:fs';
import { join, resolve, sep, extname } from 'node:path';

// content type → extensions
const TYPES = Object.fromEntries([
  ['text/html; charset=utf-8', 'html htm'], ['text/css', 'css'], ['text/javascript', 'js mjs'],
  ['application/json', 'json'], ['text/plain; charset=utf-8', 'txt'], ['image/svg+xml', 'svg'],
  ['image/png', 'png'], ['image/jpeg', 'jpg jpeg'], ['image/gif', 'gif'], ['image/webp', 'webp'],
  ['image/x-icon', 'ico'], ['font/woff2', 'woff2'], ['font/woff', 'woff'], ['font/ttf', 'ttf'], ['font/otf', 'otf'],
].flatMap(([type, exts]) => exts.split(' ').map((e) => ['.' + e, type])));

const inside = (root, p) => p === root || p.startsWith(root + sep);

// Returns { status, file? } for a request path. Exported for tests.
export function resolveRequest(rootDir, urlPath) {
  const root = realpathSync(rootDir);
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split(/[?#]/)[0]); } catch { return { status: 400 }; }
  if (decoded.includes('\0')) return { status: 400 };
  const parts = decoded.split(/[\\/]+/).filter(Boolean);
  if (parts.includes('..')) return { status: 403 };
  if (parts.some((p) => p.startsWith('.') && p !== '.helpme')) return { status: 404 };
  let target = resolve(root, ...parts);
  if (!inside(root, target)) return { status: 403 };
  let real;
  try { real = realpathSync(target); } catch { return { status: 404 }; }
  if (!inside(root, real)) return { status: 403 };
  let st = statSync(real);
  if (st.isDirectory()) {
    real = join(real, 'index.html');
    try { st = statSync(real); } catch { return { status: 404 }; }
  }
  return st.isFile() ? { status: 200, file: real } : { status: 404 };
}

export function serve(rootDir) {
  const server = createServer((req, res) => {
    const r = resolveRequest(rootDir, req.url || '/');
    if (r.status !== 200) { res.writeHead(r.status, { 'content-type': 'text/plain' }); res.end(String(r.status)); return; }
    res.writeHead(200, { 'content-type': TYPES[extname(r.file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    createReadStream(r.file).pipe(res);
  });
  return new Promise((ok, fail) => {
    server.once('error', fail);
    const host = '127.0.0.1'; // loopback only, any free port
    server.listen({ host, port: 0 }, () => ok({
      url: `http://${host}:${server.address().port}`,
      close: () => new Promise((done) => { server.close(done); server.closeAllConnections(); }),
    }));
  });
}
