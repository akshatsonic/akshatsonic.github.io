// Local writing app for the blog. Run: npm run write  ->  http://localhost:4400
// Writes Markdown into src/content/blog, saves pasted images into public/blog-images,
// and can commit + push to publish. Bound to 127.0.0.1 only; no dependencies.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS = path.join(ROOT, 'src/content/blog');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES = path.join(PUBLIC, 'blog-images');
const PORT = Number(process.env.PORT) || 4400;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
const stamp = (d) => d.toISOString().slice(0, 16).replace(/[-:T]/g, '');
const prettyDate = (d) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`;
const safeName = (f) => { const b = path.basename(String(f || '')); return /^[\w.-]+\.md$/.test(b) ? b : null; };
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function parse(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split('\n')) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (v.startsWith('[')) { try { v = JSON.parse(v); } catch { v = []; } }
    else if (v === 'true' || v === 'false') v = v === 'true';
    else v = v.replace(/^(['"])([\s\S]*)\1$/, '$2');
    meta[k[1]] = v;
  }
  return { meta, body: m[2].replace(/^\n+/, '') };
}

function build(p) {
  const lines = ['---', `title: ${JSON.stringify(p.title)}`, `description: ${JSON.stringify(p.description || '')}`, `pubDate: ${JSON.stringify(p.pubDate)}`];
  if (p.tags?.length) lines.push(`tags: ${JSON.stringify(p.tags)}`);
  if (p.heroImage) lines.push(`heroImage: ${JSON.stringify(p.heroImage)}`);
  if (p.draft) lines.push('draft: true');
  lines.push('---', '', p.body.trim(), '');
  return lines.join('\n');
}

const readBody = (req) => new Promise((res, rej) => { const c = []; req.on('data', (d) => c.push(d)); req.on('end', () => res(Buffer.concat(c))); req.on('error', rej); });
const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'writer.html'))); }

    if (req.method === 'GET' && url.pathname === '/api/posts') {
      const list = fs.readdirSync(POSTS).filter((f) => f.endsWith('.md')).sort().reverse().map((f) => {
        const { meta } = parse(fs.readFileSync(path.join(POSTS, f), 'utf8'));
        return { file: f, title: meta.title || f, draft: !!meta.draft };
      });
      return json(res, 200, list);
    }

    if (req.method === 'GET' && url.pathname === '/api/post') {
      const f = safeName(url.searchParams.get('file'));
      if (!f) return json(res, 400, { error: 'bad file' });
      const { meta, body } = parse(fs.readFileSync(path.join(POSTS, f), 'utf8'));
      return json(res, 200, { file: f, ...meta, body });
    }

    if (req.method === 'POST' && url.pathname === '/api/save') {
      const p = JSON.parse((await readBody(req)).toString());
      if (!p.title?.trim()) return json(res, 400, { error: 'Title is required' });
      let f = safeName(p.file);
      if (!f) f = `${stamp(new Date())}-${slugify(p.title)}.md`;
      p.pubDate = p.pubDate || prettyDate(new Date());
      fs.writeFileSync(path.join(POSTS, f), build(p));
      return json(res, 200, { file: f, pubDate: p.pubDate });
    }

    if (req.method === 'POST' && url.pathname === '/api/image') {
      const name = path.basename(url.searchParams.get('name') || 'image.png').replace(/[^\w.-]/g, '-');
      const ext = path.extname(name).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) return json(res, 400, { error: 'image types only' });
      fs.mkdirSync(IMAGES, { recursive: true });
      const out = `${Date.now()}-${name}`;
      fs.writeFileSync(path.join(IMAGES, out), await readBody(req));
      return json(res, 200, { url: `/blog-images/${out}` });
    }

    if (req.method === 'POST' && url.pathname === '/api/publish') {
      const { file } = JSON.parse((await readBody(req)).toString());
      const f = safeName(file);
      if (!f) return json(res, 400, { error: 'Save the post first' });
      const { meta } = parse(fs.readFileSync(path.join(POSTS, f), 'utf8'));
      if (meta.draft) return json(res, 400, { error: 'Untick "Draft" and save before publishing' });
      git('add', `src/content/blog/${f}`, 'public/blog-images');
      git('commit', '-m', `Post: ${meta.title}`, '--', `src/content/blog/${f}`, 'public/blog-images');
      const out = git('push', 'origin', 'master');
      return json(res, 200, { ok: true, out });
    }

    // preview: serve images from /public (read-only, inside public only)
    if (req.method === 'GET') {
      const p = path.normalize(path.join(PUBLIC, decodeURIComponent(url.pathname)));
      if (p.startsWith(PUBLIC + path.sep) && fs.existsSync(p) && fs.statSync(p).isFile()) { res.writeHead(200); return fs.createReadStream(p).pipe(res); }
    }
    res.writeHead(404); res.end('not found');
  } catch (e) {
    json(res, 500, { error: String(e.stderr || e.message || e).trim() });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`Writer running at http://localhost:${PORT}`));
