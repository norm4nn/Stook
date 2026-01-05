import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
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

  const renderItem = ({ item }: { item: Contact }) => (
    <View style={styles.row}>
      <Text style={styles.name}>
        {item.name} {item.surname}
      </Text>
      {item.phone ? <Text>{item.phone}</Text> : null}
      {item.links ? <Text>{item.links}</Text> : null}
      {item.notes ? <Text>{item.notes}</Text> : null}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>Brak zapisanych danych NFC</Text>
      }
      contentContainerStyle={data.length === 0 ? styles.emptyContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
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
  empty: {
    textAlign: 'center',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
