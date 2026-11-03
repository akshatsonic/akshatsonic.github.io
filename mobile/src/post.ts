// Frontmatter helpers. Keys the app does not edit (updatedDate, readTime, ...) are kept verbatim.
export type Post = {
  file: string | null;
  sha: string | null;
  title: string;
  description: string;
  tags: string[];
  draft: boolean;
  pubDate: string;
  body: string;
  extra: string[]; // untouched frontmatter lines
};

const MANAGED = ['title', 'description', 'pubDate', 'tags', 'draft'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const prettyDate = (d = new Date()) => `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')} ${d.getFullYear()}`;
export const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';
export const stamp = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;
};

export const emptyPost = (): Post => ({ file: null, sha: null, title: '', description: '', tags: [], draft: true, pubDate: '', body: '', extra: [] });

const unquote = (v: string) => v.trim().replace(/^(['"])([\s\S]*)\1$/, '$2');

export function parsePost(raw: string, file: string, sha: string): Post {
  const p = { ...emptyPost(), file, sha };
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { ...p, body: raw };
  p.body = m[2].replace(/^\n+/, '');
  for (const line of m[1].split('\n')) {
    const k = line.match(/^(\w+):\s*(.*)$/);
    if (!k || !MANAGED.includes(k[1])) { if (line.trim()) p.extra.push(line); continue; }
    const v = k[2].trim();
    if (k[1] === 'tags') { try { p.tags = JSON.parse(v); } catch { p.tags = []; } }
    else if (k[1] === 'draft') p.draft = v === 'true';
    else (p as any)[k[1]] = unquote(v);
  }
  return p;
}

export function buildPost(p: Post): string {
  const lines = ['---', `title: ${JSON.stringify(p.title)}`, `description: ${JSON.stringify(p.description)}`, `pubDate: ${JSON.stringify(p.pubDate)}`];
  if (p.tags.length) lines.push(`tags: ${JSON.stringify(p.tags)}`);
  lines.push(...p.extra);
  if (p.draft) lines.push('draft: true');
  lines.push('---', '', p.body.trim(), '');
  return lines.join('\n');
}
