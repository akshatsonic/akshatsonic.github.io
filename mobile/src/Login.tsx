import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { CLIENT_ID } from './config';
import { DeviceCode, pollDeviceFlow, setToken, startDeviceFlow, whoami } from './github';
import { C, s } from './ui';

export default function Login({ onDone }: { onDone: (login: string) => void }) {
  const [code, setCode] = useState<DeviceCode | null>(null);
  const [pat, setPat] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const stop = useRef(false);

  const finish = async (t: string) => {
    await setToken(t);
    try { onDone(await whoami()); } catch (e) { await setToken(null); throw e; }
  };
  const run = async (fn: () => Promise<void>) => {
    setErr(''); setBusy(true);
    try { await fn(); } catch (e: any) { setErr(e.message); setCode(null); } finally { setBusy(false); }
  };

  const device = () => run(async () => {
    stop.current = false;
    const d = await startDeviceFlow();
    setCode(d);
    WebBrowser.openBrowserAsync(d.verification_uri);
    await finish(await pollDeviceFlow(d, () => stop.current));
  });

  return (
    <View style={[s.fill, s.pad, { justifyContent: 'center', gap: 16 }]}>
      <Text style={s.h1}>Writer</Text>
      <Text style={s.muted}>Sign in with GitHub to read and commit posts in your blog repository.</Text>

      {code ? (
        <View style={{ gap: 12 }}>
          <Text style={s.body}>Enter this code on GitHub:</Text>
          <Text selectable style={{ fontSize: 36, fontWeight: '600', letterSpacing: 2, color: C.text }}>{code.user_code}</Text>
          <Pressable style={s.btn} onPress={() => WebBrowser.openBrowserAsync(code.verification_uri)}><Text style={s.btnText}>Open github.com/login/device</Text></Pressable>
          <View style={s.row}><ActivityIndicator color={C.muted} /><Text style={[s.muted, { marginLeft: 8 }]}>Waiting for approval…</Text></View>
          <Pressable onPress={() => { stop.current = true; setCode(null); }}><Text style={s.muted}>Cancel</Text></Pressable>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {CLIENT_ID ? (
            <Pressable style={[s.btn, s.btnPri]} onPress={device} disabled={busy}><Text style={[s.btnText, s.btnPriText]}>Sign in with GitHub</Text></Pressable>
          ) : (
            <Text style={s.muted}>No GitHub App client ID set in src/config.ts, so use a token below.</Text>
          )}
          <Text style={[s.label, { marginTop: 8 }]}>Or paste a fine-grained token</Text>
          <TextInput style={s.input} value={pat} onChangeText={setPat} placeholder="github_pat_…" autoCapitalize="none" autoCorrect={false} secureTextEntry />
          <Pressable style={[s.btn, !CLIENT_ID && s.btnPri]} disabled={busy || !pat.trim()} onPress={() => run(() => finish(pat.trim()))}>
            <Text style={[s.btnText, !CLIENT_ID && s.btnPriText]}>Use token</Text>
          </Pressable>
        </View>
      )}
      {!!err && <Text style={{ color: C.neg }}>{err}</Text>}
    </View>
  );
}
