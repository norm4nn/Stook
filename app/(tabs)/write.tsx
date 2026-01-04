import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, TextInput, Title } from 'react-native-paper';
import { db } from '../database';
import { writeNfc } from '../nfc';

export default function WriteScreen() {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    phone: '',
    links: '',
    notes: '',
  });

  const saveToDB = async () => {
    const stmt = await db.prepareAsync(`
      INSERT INTO contacts (
        name, surname, phone, links, notes, source, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await stmt.executeAsync([
        form.name,
        form.surname,
        form.phone,
        form.links,
        form.notes,
        'local',
        new Date().toISOString(),
      ]);
    } finally {
      await stmt.finalizeAsync();
    }
  };

  const handleWrite = async () => {
    try {
      await writeNfc(form);
      await saveToDB();
      Alert.alert('Success', 'Data written to NFC and saved locally');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to write NFC tag');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Write NFC Tag</Title>
          <Paragraph>Fill in the details and write them to an NFC tag.</Paragraph>

          <TextInput
            label="Name"
            value={form.name}
            onChangeText={v => setForm({ ...form, name: v })}
            style={styles.input}
          />

          <TextInput
            label="Surname"
            value={form.surname}
            onChangeText={v => setForm({ ...form, surname: v })}
            style={styles.input}
          />

          <TextInput
            label="Phone"
            value={form.phone}
            onChangeText={v => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
            style={styles.input}
          />

          <TextInput
            label="Links"
            value={form.links}
            onChangeText={v => setForm({ ...form, links: v })}
            style={styles.input}
          />

          <TextInput
            label="Notes"
            value={form.notes}
            onChangeText={v => setForm({ ...form, notes: v })}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleWrite}
            style={styles.button}
          >
            Write to NFC
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/read')}
            style={styles.button}
          >
            Go to Read NFC
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push('/nfclist')}
            style={styles.button}
          >
            Go to NFC List
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  card: {
    padding: 16,
  },
  input: {
    marginTop: 8,
  },
  button: {
    marginTop: 12,
  },
});