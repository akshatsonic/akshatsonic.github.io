import { StyleSheet } from 'react-native';

export const C = { ground: '#f4f3f1', surface: '#ffffff', raised: '#eae9e6', border: '#e3e1dd', text: '#0a0a0a', muted: '#6b6b6b', accent: '#141414', hue: '#1d5fbf', neg: '#c4242a' };

export const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: C.ground },
  pad: { padding: 16 },
  h1: { fontSize: 24, fontWeight: '600', color: C.text },
  body: { fontSize: 15, color: C.text },
  muted: { fontSize: 13, color: C.muted },
  btn: { height: 44, borderRadius: 8, backgroundColor: C.raised, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnPri: { backgroundColor: C.accent },
  btnText: { fontSize: 15, fontWeight: '500', color: C.text },
  btnPriText: { color: '#fff' },
  input: { backgroundColor: C.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.text },
  label: { fontSize: 14, fontWeight: '500', color: C.text, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
