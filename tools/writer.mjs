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
    if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(PAGE); }

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

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Writer</title>
<style>
:root{--bg:#121212;--s:#1c1c1c;--s2:#2a2a2a;--ink:#fafafa;--mut:#b3b3b3}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Georgia,serif}
header{display:flex;flex-wrap:wrap;gap:10px;padding:12px 16px;background:var(--s);align-items:center}
input,select,textarea,button{font:inherit;color:inherit;background:var(--s2);border:0;padding:8px 10px}
button{cursor:pointer;background:var(--ink);color:var(--bg);padding:8px 16px}button.g{background:var(--s2);color:var(--ink)}
header input.t{flex:1 1 280px;font-size:1.1rem}header input.d{flex:2 1 320px}header input.g{flex:1 1 160px}
label{display:flex;gap:6px;align-items:center;color:var(--mut)}
main{display:grid;grid-template-columns:1fr 1fr;height:calc(100vh - 124px)}
@media(max-width:800px){main{grid-template-columns:1fr;height:auto}#ed{height:60vh}}
#ed{width:100%;height:100%;resize:none;padding:20px;font:16px/1.7 ui-monospace,Menlo,monospace;background:var(--bg)}
#pv{overflow:auto;padding:20px 28px;background:#161616}#pv img{max-width:100%}#pv pre{background:var(--s);padding:12px;overflow:auto}
#msg{padding:8px 16px;color:var(--mut);min-height:36px}#msg.err{color:#ff8a80}
</style></head><body>
<header>
<select id="pick"><option value="">New post</option></select>
<input class="t" id="title" placeholder="Title">
<input class="d" id="desc" placeholder="One-line description">
<input class="g" id="tags" placeholder="tags, comma separated">
<label><input type="checkbox" id="draft" checked> Draft</label>
<button class="g" id="save">Save</button><button id="pub">Publish</button>
</header>
<div id="msg">Paste or drop images into the editor. Save writes the file; Publish commits and pushes.</div>
<main><textarea id="ed" placeholder="Write in Markdown…"></textarea><div id="pv"></div></main>
<script src="https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js"></script>
<script>
const $=(i)=>document.getElementById(i);let file=null,pubDate=null;
const say=(t,e)=>{$('msg').textContent=t;$('msg').className=e?'err':''};
const render=()=>{$('pv').innerHTML=window.marked?marked.parse($('ed').value):''};
$('ed').addEventListener('input',render);
async function api(p,o){const r=await fetch(p,o);const j=await r.json();if(!r.ok)throw new Error(j.error||'failed');return j}
async function list(){const l=await api('/api/posts');$('pick').innerHTML='<option value="">New post</option>'+l.map(p=>'<option value="'+p.file+'">'+(p.draft?'[draft] ':'')+p.title.replace(/</g,'&lt;')+'</option>').join('');if(file)$('pick').value=file}
$('pick').onchange=async()=>{const f=$('pick').value;if(!f){file=null;pubDate=null;['title','desc','tags','ed'].forEach(i=>$(i).value='');$('draft').checked=true;return render()}
 const p=await api('/api/post?file='+encodeURIComponent(f));file=p.file;pubDate=p.pubDate;$('title').value=p.title||'';$('desc').value=p.description||'';$('tags').value=(p.tags||[]).join(', ');$('draft').checked=!!p.draft;$('ed').value=p.body||'';render()};
async function save(){const body={file,pubDate,title:$('title').value,description:$('desc').value,tags:$('tags').value.split(',').map(s=>s.trim()).filter(Boolean),draft:$('draft').checked,body:$('ed').value};
 const r=await api('/api/save',{method:'POST',body:JSON.stringify(body)});file=r.file;pubDate=r.pubDate;await list();say('Saved '+file);return r}
$('save').onclick=()=>save().catch(e=>say(e.message,1));
$('pub').onclick=async()=>{try{await save();say('Publishing…');await api('/api/publish',{method:'POST',body:JSON.stringify({file})});say('Published. The site rebuilds in a minute or two.')}catch(e){say(e.message,1)}};
async function upload(f){const r=await api('/api/image?name='+encodeURIComponent(f.name||'pasted.png'),{method:'POST',body:f});const t='![]('+r.url+')';const e=$('ed'),s=e.selectionStart;e.value=e.value.slice(0,s)+t+e.value.slice(e.selectionEnd);render();say('Image added')}
$('ed').addEventListener('paste',e=>{const f=[...e.clipboardData.files].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();upload(f).catch(x=>say(x.message,1))}});
$('ed').addEventListener('drop',e=>{const f=[...e.dataTransfer.files].find(x=>x.type.startsWith('image/'));if(f){e.preventDefault();upload(f).catch(x=>say(x.message,1))}});
window.addEventListener('load',()=>{list();render()});
</script></body></html>`;
