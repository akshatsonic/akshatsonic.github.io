import type React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { AuthError, loadPost, previewUrl, savePost, uploadImage } from './github';
import { emptyPost, Post } from './post';
import { C, s } from './ui';

type Sel = { start: number; end: number };
const draftKey = (f: string | null) => `unsaved:${f ?? 'new'}`;

export default function Editor({ file, onBack, onAuth }: { file: string | null; onBack: () => void; onAuth: () => void }) {
  const [p, setP] = useState<Post | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [msg, setMsg] = useState('');
  const [sel, setSel] = useState<Sel>({ start: 0, end: 0 });
  const [tags, setTags] = useState('');
  const body = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    (async () => {
      try {
        const base = file ? await loadPost(file) : emptyPost();
        const local = await AsyncStorage.getItem(draftKey(file));
        const next = local ? { ...base, ...JSON.parse(local) } : base;
        setP(next); setTags(next.tags.join(', ')); setDirty(!!local);
        if (local) setMsg('Restored unsaved changes');
      } catch (e: any) { e instanceof AuthError ? onAuth() : (setMsg(e.message), setP(emptyPost())); }
    })();
  }, [file, onAuth]);

  if (!p) return <View style={[s.fill, { justifyContent: 'center' }]}><ActivityIndicator color={C.muted} /></View>;

  const edit = (patch: Partial<Post>) => {
    const next = { ...p, ...patch };
    setP(next); setDirty(true); setMsg('');
    AsyncStorage.setItem(draftKey(p.file), JSON.stringify({ title: next.title, body: next.body, description: next.description, tags: next.tags, draft: next.draft })).catch(() => {});
  };

  const apply = (text: string, cursor: Sel) => { edit({ body: text }); setSel(cursor); setTimeout(() => body.current?.focus(), 0); };
  const wrap = (a: string, b: string, ph: string) => {
    const mid = p.body.slice(sel.start, sel.end) || ph;
    apply(p.body.slice(0, sel.start) + a + mid + b + p.body.slice(sel.end), { start: sel.start + a.length, end: sel.start + a.length + mid.length });
  };
  const prefix = (pre: string) => {
    const ls = p.body.lastIndexOf('\n', sel.start - 1) + 1;
    const le = p.body.indexOf('\n', sel.end); const e = le < 0 ? p.body.length : le;
    const out = p.body.slice(ls, e).split('\n').map((l) => (l.startsWith(pre) ? l.slice(pre.length) : pre + l)).join('\n');
    apply(p.body.slice(0, ls) + out + p.body.slice(e), { start: ls + out.length, end: ls + out.length });
  };
  const link = () => {
    const mid = p.body.slice(sel.start, sel.end) || 'text';
    const at = sel.start + mid.length + 3;
    apply(p.body.slice(0, sel.start) + `[${mid}](https://)` + p.body.slice(sel.end), { start: at, end: at + 8 });
  };
  const image = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.8 });
    const a = r.assets?.[0];
    if (r.canceled || !a?.base64) return;
    setBusy(true); setMsg('Uploading image…');
    try {
      const url = await uploadImage(a.fileName || 'image.jpg', a.base64);
      const t = `![](${url})`;
      apply(p.body.slice(0, sel.start) + t + p.body.slice(sel.end), { start: sel.start + t.length, end: sel.start + t.length });
      setMsg('Image added');
    } catch (e: any) { e instanceof AuthError ? onAuth() : setMsg(e.message); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true); setMsg(p.draft ? 'Saving…' : 'Publishing…');
    try {
      const saved = await savePost({ ...p, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) });
      await AsyncStorage.removeItem(draftKey(p.file)); await AsyncStorage.removeItem(draftKey(null));
      setP(saved); setDirty(false);
      setMsg(saved.draft ? 'Saved to GitHub' : 'Published. Live in a minute or two.');
    } catch (e: any) { e instanceof AuthError ? onAuth() : setMsg(e.message); } finally { setBusy(false); }
  };
  const confirmSave = () => (p.draft ? save() : Alert.alert('Publish this post?', 'It is committed to master and goes live when the site rebuilds.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Publish', onPress: save }]));
  const back = () => (dirty ? Alert.alert('Leave this post?', 'Unsaved changes stay on this phone and will be restored next time.', [{ text: 'Stay', style: 'cancel' }, { text: 'Leave', onPress: onBack }]) : onBack());

  const words = (p.body.trim().match(/\S+/g) || []).length;
  const tools: [string, () => void][] = [['H', () => prefix('## ')], ['B', () => wrap('**', '**', 'bold')], ['i', () => wrap('*', '*', 'italic')], ['Link', link], ['Image', image], ['❝', () => prefix('> ')], ['•', () => prefix('- ')], ['</>', () => wrap('`', '`', 'code')]];

  return (
    <KeyboardAvoidingView style={[s.fill, { paddingTop: 44 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.row, { paddingHorizontal: 12, paddingBottom: 8, gap: 8 }]}>
        <Pressable onPress={back} hitSlop={12}><Text style={s.body}>‹ Posts</Text></Pressable>
        <Text style={[s.muted, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>{busy ? msg : dirty ? 'Unsaved' : msg || 'Saved'}</Text>
        <Pressable onPress={() => setPreview(!preview)} hitSlop={8}><Text style={s.body}>{preview ? 'Edit' : 'Preview'}</Text></Pressable>
        <Pressable onPress={() => setSheet(true)} hitSlop={8}><Text style={s.body}>Details</Text></Pressable>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: preview ? C.ground : C.surface }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        {preview ? (
          <>
            <Text style={{ fontSize: 30, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', marginBottom: 12 }}>{p.title}</Text>
            <Markdown>{previewUrl(p.body)}</Markdown>
          </>
        ) : (
          <>
            <TextInput value={p.title} onChangeText={(t) => edit({ title: t })} placeholder="Title" placeholderTextColor="#b4b2ad" multiline
              style={{ fontSize: 30, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', color: C.text, marginBottom: 12, padding: 0 }} />
            <TextInput ref={body} value={p.body} onChangeText={(t) => edit({ body: t })} onSelectionChange={(e) => setSel(e.nativeEvent.selection)} selection={sel}
              placeholder="Start writing…" placeholderTextColor="#b4b2ad" multiline scrollEnabled={false} textAlignVertical="top"
              style={{ fontSize: 17, lineHeight: 28, color: C.text, minHeight: 360, padding: 0 }} />
          </>
        )}
      </ScrollView>

      {!preview && (
        <View style={{ backgroundColor: C.surface, borderTopWidth: 1, borderColor: C.border }}>
          <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 6, gap: 4 }}>
            {tools.map(([l, f]) => <Pressable key={l} onPress={f} disabled={busy} style={[s.btn, { height: 40, minWidth: 44, paddingHorizontal: 12, backgroundColor: C.ground }]}><Text style={s.btnText}>{l}</Text></Pressable>)}
          </ScrollView>
          <Text style={[s.muted, { paddingHorizontal: 16, paddingBottom: 6 }]}>{words.toLocaleString()} words · {Math.max(words ? 1 : 0, Math.round(words / 230))} min read</Text>
        </View>
      )}

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.3)' }} onPress={() => setSheet(false)} />
        <View style={{ backgroundColor: C.ground, padding: 20, gap: 14, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={s.h1}>Details</Text>
          <View><Text style={s.label}>Description</Text><TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]} multiline value={p.description} onChangeText={(t) => edit({ description: t })} placeholder="One line shown in the post list and link previews" /></View>
          <View><Text style={s.label}>Tags</Text><TextInput style={s.input} value={tags} autoCapitalize="none" onChangeText={(t) => { setTags(t); setDirty(true); }} placeholder="databases, jvm" /></View>
          <View style={[s.row, { justifyContent: 'space-between', backgroundColor: C.surface, borderRadius: 8, padding: 12 }]}>
            <View style={{ flex: 1 }}><Text style={s.label}>Draft</Text><Text style={s.muted}>Off = live on the site after saving</Text></View>
            <Switch value={p.draft} onValueChange={(v) => edit({ draft: v })} trackColor={{ true: C.accent }} />
          </View>
          <Pressable style={[s.btn, s.btnPri]} disabled={busy} onPress={() => { setSheet(false); confirmSave(); }}>
            <Text style={[s.btnText, s.btnPriText]}>{p.draft ? 'Save draft' : 'Publish'}</Text>
          </Pressable>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
