import { Alert, Button, View } from 'react-native';
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
    <View>
      <Button title="Scan NFC tag" onPress={handleRead} />
    </View>
  );
}