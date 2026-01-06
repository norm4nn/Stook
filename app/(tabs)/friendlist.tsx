import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Card, Paragraph, Text, Title } from "react-native-paper";
import { db } from "../../lib/database";

type Contact = {
  tag_id: string;
  name: string;
  surname: string;
  phone: string;
  links: string;
  notes: string;
  source: string;
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
    }, [])
  );

  const loadData = async () => {
    try {
      const contacts: Contact[] = await db.getAllAsync(
        `SELECT * FROM contacts ORDER BY createdAt DESC`
      );

      const tagIds = contacts.map((c) => c.tag_id);
      let shared: SharedContact[] = [];

      if (tagIds.length > 0) {
        shared = await db.getAllAsync(
          `SELECT * FROM shared_contacts WHERE tag_id IN (${tagIds
            .map(() => "?")
            .join(",")})`,
          tagIds
        );
      }

      const groupedFriends = shared.reduce<Record<string, SharedContact[]>>(
        (acc, f) => {
          if (!acc[f.tag_id]) acc[f.tag_id] = [];
          acc[f.tag_id].push(f);
          return acc;
        },
        {}
      );

      setData(
        contacts.map((c) => ({
          ...c,
          friends: groupedFriends[c.tag_id] || [],
          isLocal: c.source === "local",
        }))
      );
    } catch (e) {
      console.error("Failed to load NFC contacts", e);
    }
  };

  const renderItem = ({
    item,
  }: {
    item: Contact & { friends?: SharedContact[]; isLocal?: boolean };
  }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>
          {item.name} {item.surname}
          {item.isLocal ? " (Your profile)" : ""}
        </Title>

        {item.phone ? <Paragraph>{item.phone}</Paragraph> : null}
        {item.links ? <Paragraph>{item.links}</Paragraph> : null}
        {item.notes ? <Paragraph>{item.notes}</Paragraph> : null}

        <Paragraph style={styles.date}>
          {new Date(item.createdAt).toLocaleString()}
        </Paragraph>

        {item.friends && item.friends.length > 0 && (
          <View style={styles.friendsContainer}>
            <Text style={styles.friendsTitle}>
              Shared friends ({item.friends.length})
            </Text>
            {item.friends.map((f) => (
              <Text
                key={`${f.from_tag_id}-${f.tag_id}`}
                style={styles.friend}
              >
                • {f.name} {f.surname}
              </Text>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Title style={styles.screenTitle}>Saved NFC Profiles</Title>
          <Paragraph style={styles.subtitle}>
            Profiles scanned or created on this device.
          </Paragraph>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.tag_id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={
          <Paragraph style={styles.empty}>
            No NFC data saved yet.
          </Paragraph>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  headerContainer: {
    marginTop: 32,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#555",
    fontSize: 14,
  },
  card: {
    marginBottom: 12,
    padding: 8,
  },
  date: {
    marginTop: 6,
    color: "#888",
    fontSize: 12,
  },
  friendsContainer: {
    marginTop: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#007AFF",
  },
  friendsTitle: {
    fontStyle: "italic",
    color: "#007AFF",
    marginBottom: 4,
  },
  friend: {
    color: "#333",
  },
  empty: {
    textAlign: "center",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});
