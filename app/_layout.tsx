import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { initDB } from './database';
import { initNFC } from './nfc';

export default function Layout() {
  useEffect(() => {
    initDB();
    initNFC();
  }, []);

  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="write" options={{ title: 'Write NFC' }} />
      <Tabs.Screen name="read" options={{ title: 'Read NFC' }} />
    </Tabs>
  );
}