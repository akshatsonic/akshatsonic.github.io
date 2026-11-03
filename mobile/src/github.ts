import * as SecureStore from 'expo-secure-store';
import { BRANCH, CLIENT_ID, IMAGES_DIR, OWNER, POSTS_DIR, REPO } from './config';
import { buildPost, parsePost, Post, prettyDate, slugify, stamp } from './post';

const API = 'https://api.github.com';
const KEY = 'gh_token';
let token: string | null = null;

export const getToken = async () => (token ??= await SecureStore.getItemAsync(KEY));
export const setToken = async (t: string | null) => {
  token = t;
  if (t) await SecureStore.setItemAsync(KEY, t);
  else await SecureStore.deleteItemAsync(KEY);
};

export class AuthError extends Error {}

async function gh(path: string, init: RequestInit = {}, accept = 'application/vnd.github+json') {
  const r = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: { Accept: accept, Authorization: `Bearer ${await getToken()}`, 'X-GitHub-Api-Version': '2022-11-28', ...(init.headers || {}) },
  });
  if (r.status === 401) throw new AuthError('Session expired. Sign in again.');
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(r.status === 409 || r.status === 422 ? 'This post changed on GitHub since you opened it. Reopen it and try again.' : j.message || `GitHub error ${r.status}`);
  }
  return r;
}

/* utf8 <-> base64 without TextEncoder */
const toB64 = (s: string) => btoa(encodeURIComponent(s).replace(/%([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
const fromB64 = (b: string) =>
  decodeURIComponent(atob(b.replace(/\n/g, '')).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));

/* device flow: no secret, no redirect */
export type DeviceCode = { device_code: string; user_code: string; verification_uri: string; interval: number; expires_in: number };
const form = (o: Record<string, string>) => ({
  method: 'POST',
  headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
  body: Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
});

export async function startDeviceFlow(): Promise<DeviceCode> {
  const r = await fetch('https://github.com/login/device/code', form({ client_id: CLIENT_ID }));
  const j = await r.json();
  if (!j.device_code) throw new Error(j.error_description || 'Could not start GitHub sign-in');
  return j;
}

export async function pollDeviceFlow(d: DeviceCode, cancelled: () => boolean): Promise<string> {
  let wait = d.interval;
  const end = Date.now() + d.expires_in * 1000;
  while (Date.now() < end && !cancelled()) {
    await new Promise((res) => setTimeout(res, wait * 1000));
    const j = await (await fetch('https://github.com/login/oauth/access_token',
      form({ client_id: CLIENT_ID, device_code: d.device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }))).json();
    if (j.access_token) return j.access_token;
    if (j.error === 'slow_down') wait += 5;
    else if (j.error && j.error !== 'authorization_pending') throw new Error(j.error_description || j.error);
  }
  throw new Error('Sign-in timed out');
}

export const whoami = async (): Promise<string> => (await (await gh('/user')).json()).login;

/* posts */
const repo = `/repos/${OWNER}/${REPO}/contents`;
export type Row = { file: string; title: string; draft: boolean };

export async function listPosts(): Promise<Row[]> {
  const files: { name: string }[] = await (await gh(`${repo}/${POSTS_DIR}?ref=${BRANCH}`)).json();
  const rows = await Promise.all(
    files.filter((f) => /\.mdx?$/.test(f.name)).map(async (f) => {
      const raw = await (await gh(`${repo}/${POSTS_DIR}/${f.name}?ref=${BRANCH}`, {}, 'application/vnd.github.raw+json')).text();
      const p = parsePost(raw, f.name, '');
      return { file: f.name, title: p.title || f.name, draft: p.draft };
    }),
  );
  return rows.sort((a, b) => (a.file < b.file ? 1 : -1));
}

export async function loadPost(file: string): Promise<Post> {
  const j = await (await gh(`${repo}/${POSTS_DIR}/${file}?ref=${BRANCH}`)).json();
  return parsePost(fromB64(j.content), file, j.sha);
}

export async function savePost(p: Post): Promise<Post> {
  if (!p.title.trim()) throw new Error('Title is required');
  const file = p.file || `${stamp()}-${slugify(p.title)}.md`;
  const pubDate = p.pubDate || prettyDate();
  const j = await (await gh(`${repo}/${POSTS_DIR}/${file}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: p.draft ? `Draft: ${p.title}` : `Post: ${p.title}`,
      content: toB64(buildPost({ ...p, pubDate })),
      branch: BRANCH,
      ...(p.sha ? { sha: p.sha } : {}),
    }),
  })).json();
  return { ...p, file, pubDate, sha: j.content.sha };
}

export async function uploadImage(name: string, base64: string): Promise<string> {
  const out = `${Date.now()}-${name.replace(/[^\w.-]/g, '-')}`;
  await gh(`${repo}/${IMAGES_DIR}/${out}`, { method: 'PUT', body: JSON.stringify({ message: `Image: ${out}`, content: base64, branch: BRANCH }) });
  return `/blog-images/${out}`;
}

export const previewUrl = (md: string) =>
  md.replace(/\]\(\/blog-images\//g, `](https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/public/blog-images/`);
