import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { db } from '../database';

type Contact = {
  id: number;
  name: string;
  surname: string;
  phone: string;
  links: string;
  notes: string;
  createdAt: string;
};

export default function NfcListScreen() {
  const [data, setData] = useState<Contact[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const result = await db.getAllAsync<Contact>(
        `SELECT * FROM contacts WHERE source = 'nfc' ORDER BY createdAt DESC`
      );
      setData(result);
    } catch (e) {
      console.error('Failed to load NFC contacts', e);
    }
  };

  // 🔴 delete single record
  const deleteOne = (id: number) => {
    Alert.alert(
      'Delete record',
      'Are you sure you want to delete this NFC entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.execAsync(
              `DELETE FROM contacts WHERE id = ${id}`
            );
            loadData();
          },
        },
      ]
    );
  };

  // 🔴 delete all NFC records
  const deleteAll = () => {
    Alert.alert(
      'Delete all NFC records',
      'This will permanently remove all NFC data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete all',
          style: 'destructive',
          onPress: async () => {
            await db.execAsync(
              `DELETE FROM contacts WHERE source = 'nfc'`
            );
            loadData();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Contact }) => (
    <Pressable
      onLongPress={() => deleteOne(item.id)}
      style={styles.row}
    >
      <Text style={styles.name}>
        {item.name} {item.surname}
      </Text>

      {item.phone ? <Text>{item.phone}</Text> : null}
      {item.links ? <Text>{item.links}</Text> : null}
      {item.notes ? <Text>{item.notes}</Text> : null}

      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>

      <Text style={styles.hint}>
        Long press to delete
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.deleteAll} onPress={deleteAll}>
        <Text style={styles.deleteAllText}>Delete all NFC records</Text>
      </Pressable>

      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Brak zapisanych danych NFC</Text>
        }
        contentContainerStyle={
          data.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteAll: {
    padding: 12,
    backgroundColor: '#ffecec',
    alignItems: 'center',
  },
  deleteAllText: {
    color: '#c00',
    fontWeight: 'bold',
  },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    marginTop: 4,
    color: '#888',
    fontSize: 12,
  },
  hint: {
    marginTop: 4,
    fontSize: 11,
    color: '#aaa',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});