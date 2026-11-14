import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import http from 'node:http';
import { serve, resolveRequest } from '../skills/helpme-ui/scripts/lib/serve.mjs';
import { tmp } from './helpers.mjs';

function setup() {
  const outside = tmp('helpme-out-');
  writeFileSync(join(outside, 'outside.txt'), 'not yours');
  const root = tmp('helpme-root-');
  writeFileSync(join(root, 'index.html'), '<p>hi</p>');
  mkdirSync(join(root, '.git'));
  writeFileSync(join(root, '.git', 'config'), 'x');
  writeFileSync(join(root, '.private'), 'x');
  mkdirSync(join(root, '.helpme', 'board'), { recursive: true });
  writeFileSync(join(root, '.helpme', 'board', 'index.html'), '<p>board</p>');
  symlinkSync(join(outside, 'outside.txt'), join(root, 'link.txt'));
  return root;
}

// Raw request so the client does not normalise ../ away first.
const get = (base, path) => new Promise((ok, fail) => {
  const u = new URL(base);
  http.get({ host: u.hostname, port: u.port, path }, (res) => { res.resume(); ok(res.statusCode); }).on('error', fail);
});

test('resolveRequest refuses traversal, dot paths and escaping symlinks', () => {
  const root = setup();
  assert.equal(resolveRequest(root, '/').status, 200);
  assert.equal(resolveRequest(root, '/../etc/passwd').status, 403);
  assert.equal(resolveRequest(root, '/%2e%2e/%2e%2e/etc/passwd').status, 403);
  assert.equal(resolveRequest(root, '/..%2foutside.txt').status, 403);
  assert.equal(resolveRequest(root, '/.git/config').status, 404);
  assert.equal(resolveRequest(root, '/.private').status, 404);
  assert.equal(resolveRequest(root, '/link.txt').status, 403);
  assert.equal(resolveRequest(root, '/.helpme/board/').status, 200);
});

test('server listens on 127.0.0.1 and applies the same rules', async () => {
  const root = setup();
  const s = await serve(root);
  try {
    assert.match(s.url, /^http:\/\/127\.0\.0\.1:\d+$/);
    assert.equal(await get(s.url, '/index.html'), 200);
    assert.equal(await get(s.url, '/../../etc/passwd'), 403);
    assert.equal(await get(s.url, '/.git/config'), 404);
    assert.equal(await get(s.url, '/link.txt'), 403);
    assert.equal(await get(s.url, '/.helpme/board/index.html'), 200);
  } finally { await s.close(); }
});
