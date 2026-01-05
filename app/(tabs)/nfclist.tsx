import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../database";

type Contact = {
  tag_id: string;
  name: string;
  surname: string;
  phone: string;
  links: string;
  notes: string;
  source: string; // 'nfc' lub 'local'
  createdAt: string;
};

type SharedContact = {
  tag_id: string;
  name: string;
  surname: string;
  from_tag_id: string;
  createdAt: string;
};

export default function NfcListScreen() {
  const [data, setData] = useState<
    (Contact & { friends?: SharedContact[]; isLocal?: boolean })[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    try {
      // Pobierz wszystkie kontakty NFC i lokalne
      const contacts: Contact[] = await db.getAllAsync(
        `SELECT * FROM contacts ORDER BY createdAt DESC`,
      );

      // Pobierz wszystkich shared_contacts dla kontaktów
      const tagIds = contacts.map((c) => c.tag_id);
      let shared: SharedContact[] = [];
      if (tagIds.length > 0) {
        shared = await db.getAllAsync(
          `SELECT * FROM shared_contacts WHERE tag_id IN (${tagIds.map(() => "?").join(",")})`,
          tagIds,
        );
      }

      // Grupowanie shared_contacts po tag_id
      const groupedFriends = shared.reduce<Record<string, SharedContact[]>>(
        (acc, f) => {
          if (!acc[f.tag_id]) acc[f.tag_id] = [];
          acc[f.tag_id].push(f);
          return acc;
        },
        {},
      );

      // Dołącz znajomych i flagę 'your profile'
      const merged = contacts.map((c) => ({
        ...c,
        friends: groupedFriends[c.tag_id] || [],
        isLocal: c.source === "local",
      }));

      setData(merged);
    } catch (e) {
      console.error("Failed to load NFC contacts", e);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: Contact & { friends?: SharedContact[]; isLocal?: boolean };
  }) => (
    <View style={styles.row}>
      <Text style={styles.name}>
        {item.name} {item.surname} {item.isLocal ? "(Your Profile)" : ""}
      </Text>
      {item.phone ? <Text>{item.phone}</Text> : null}
      {item.links ? <Text>{item.links}</Text> : null}
      {item.notes ? <Text>{item.notes}</Text> : null}
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString()}
      </Text>

      {/* Wyświetl znajomych jeśli są */}
      {item.friends && item.friends.length > 0 && (
        <View style={styles.friendsContainer}>
          <Text style={styles.friendsTitle}>
            Friends shared by {item.friends.length}{" "}
            {item.friends.length > 1 ? "people" : "person"}:
          </Text>
          {item.friends.map((f) => (
            <Text key={`${f.from_tag_id}-${f.tag_id}`} style={styles.friend}>
              {f.name} {f.surname} (from {f.from_tag_id})
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.tag_id}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>Brak zapisanych danych NFC</Text>
      }
      contentContainerStyle={
        data.length === 0 ? styles.emptyContainer : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  date: {
    marginTop: 4,
    color: "#888",
    fontSize: 12,
  },
  friendsContainer: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#00aaff",
  },
  friendsTitle: {
    fontStyle: "italic",
    color: "#00aaff",
    marginBottom: 4,
  },
  friend: {
    color: "#0077cc",
  },
  empty: {
    textAlign: "center",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
