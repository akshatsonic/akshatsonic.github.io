import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, TextInput, View } from 'react-native';
import { AuthError, listPosts, Row } from './github';
import { C, s } from './ui';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const date = (f: string) => { const m = f.match(/^(\d{4})(\d{2})(\d{2})/); return m ? `${MON[+m[2] - 1]} ${+m[3]}, ${m[1]}` : ''; };

export default function List({ user, onOpen, onNew, onSignOut }: { user: string; onOpen: (f: string) => void; onNew: () => void; onSignOut: () => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [spin, setSpin] = useState(false);

  const load = useCallback(async () => {
    setErr(''); setSpin(true);
    try { setRows(await listPosts()); } catch (e: any) { if (e instanceof AuthError) return onSignOut(); setErr(e.message); setRows((r) => r ?? []); }
    setSpin(false);
  }, [onSignOut]);
  useEffect(() => { load(); }, [load]);

  const shown = (rows || []).filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <View style={[s.fill, { paddingTop: 48 }]}>
      <View style={[s.row, s.pad, { justifyContent: 'space-between' }]}>
        <View><Text style={s.h1}>Posts</Text><Text style={s.muted}>@{user}</Text></View>
        <Pressable onPress={onSignOut} hitSlop={12}><Text style={s.muted}>Sign out</Text></Pressable>
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <TextInput style={[s.input, { backgroundColor: C.raised }]} value={q} onChangeText={setQ} placeholder="Search posts" />
      </View>
      {!!err && <Text style={{ color: C.neg, paddingHorizontal: 16 }}>{err}</Text>}
      {rows === null ? <ActivityIndicator style={{ marginTop: 32 }} color={C.muted} /> : (
        <FlatList
          data={shown} keyExtractor={(r) => r.file} contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 96 }}
          refreshControl={<RefreshControl refreshing={spin} onRefresh={load} />}
          ListEmptyComponent={<Text style={[s.muted, { padding: 16 }]}>No posts.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => onOpen(item.file)} style={({ pressed }) => ({ padding: 12, borderRadius: 8, backgroundColor: pressed ? C.raised : 'transparent' })}>
              <Text style={s.body} numberOfLines={1}>{item.title}</Text>
              <Text style={s.muted}>{date(item.file)}{item.draft ? <Text style={{ color: C.hue }}>  ·  Draft</Text> : null}</Text>
            </Pressable>
          )}
        />
      )}
      <Pressable onPress={onNew} style={[s.btn, s.btnPri, { position: 'absolute', right: 16, bottom: 24, height: 52, paddingHorizontal: 24 }]}>
        <Text style={[s.btnText, s.btnPriText]}>New post</Text>
      </Pressable>
    </View>
  );
}
