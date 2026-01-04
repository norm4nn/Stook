import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { db } from '../database';
import { writeNfc } from '../nfc';

export default function WriteScreen() {
  const [form, setForm] = useState({
    name: 'John',
    surname: 'Doe',
    phone: '',
    links: '',
    notes: '',
  });

  const saveToDB = async () => {
    await db.execAsync(`
      INSERT INTO contacts (
        name, surname, phone, links, notes, source, createdAt
      ) VALUES (
        '${form.name}',
        '${form.surname}',
        '${form.phone}',
        '${form.links}',
        '${form.notes}',
        'local',
        '${new Date().toISOString()}'
      )
    `);
  };

  const handleWrite = async () => {
    await writeNfc(form);
    saveToDB();
    alert('Saved & written to NFC');
  };

  return (
    <View>
      <TextInput value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
      <TextInput value={form.surname} onChangeText={v => setForm({ ...form, surname: v })} />
      <TextInput value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} />
      <TextInput value={form.links} onChangeText={v => setForm({ ...form, links: v })} />
      <TextInput value={form.notes} onChangeText={v => setForm({ ...form, notes: v })} />

      <Button title="Write to NFC tag" onPress={handleWrite} />
    </View>
  );
}