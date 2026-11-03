import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import Editor from './src/Editor';
import { getToken, setToken, whoami } from './src/github';
import List from './src/List';
import Login from './src/Login';
import { C } from './src/ui';

export default function App() {
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [open, setOpen] = useState<{ file: string | null } | null>(null);

  const signOut = useCallback(async () => { await setToken(null); setOpen(null); setUser(null); }, []);
  useEffect(() => {
    (async () => { try { setUser((await getToken()) ? await whoami() : null); } catch { setUser(null); } })();
  }, []);
  useEffect(() => {
    const h = BackHandler.addEventListener('hardwareBackPress', () => (open ? (setOpen(null), true) : false));
    return () => h.remove();
  }, [open]);

  return (
    <View style={{ flex: 1, backgroundColor: C.ground }}>
      <StatusBar style="dark" />
      {user === undefined ? <ActivityIndicator style={{ flex: 1 }} color={C.muted} />
        : !user ? <Login onDone={setUser} />
        : open ? <Editor file={open.file} onBack={() => setOpen(null)} onAuth={signOut} />
        : <List user={user} onOpen={(file) => setOpen({ file })} onNew={() => setOpen({ file: null })} onSignOut={signOut} />}
    </View>
  );
}
