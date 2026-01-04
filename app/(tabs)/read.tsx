import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Card, Paragraph, Title } from 'react-native-paper';
import { db } from '../database';
import { readNfc } from '../nfc';

export default function ReadScreen() {
  const handleRead = async () => {
    try {
      const data = await readNfc();
      if (!data) {
        Alert.alert('No data', 'No NFC data found');
        return;
      }

      const stmt = await db.prepareAsync(`
        INSERT INTO contacts (
          name, surname, phone, links, notes, source, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      try {
        await stmt.executeAsync([
          data.name ?? '',
          data.surname ?? '',
          data.phone ?? '',
          data.links ?? '',
          data.notes ?? '',
          'nfc',
          new Date().toISOString(),
        ]);
      } finally {
        await stmt.finalizeAsync();
      }

      Alert.alert('Success', 'Data saved from NFC');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to read NFC');
    }
  };

return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Read NFC Tag</Title>
          <Paragraph>Scan a tag to save its data to your device.</Paragraph>
          <Button mode="contained" onPress={handleRead} style={styles.button}>
            Scan NFC
          </Button>
          <Button mode="outlined" onPress={() => router.push('/write')} style={styles.button}>
            Go to Write NFC
          </Button>
          <Button mode="outlined" onPress={() => router.push('/nfclist')} style={styles.button}>
            Go to NFC List
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: '#f7f7f7' },
  card: { padding: 16 },
  button: { marginVertical: 6 },
});