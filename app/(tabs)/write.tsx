import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, TextInput, Title } from "react-native-paper";
import { db } from "../database";
import { writeNfc } from "../nfc";

const MAX_BYTES = 716;

function calculateBytes(payload: any): number {
  const json = JSON.stringify(payload);
  return new TextEncoder().encode(json).length;
}

export default function WriteScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [ownerTagId, setOwnerTagId] = useState<string | null>(null);

  const loadLocalProfile = async () => {
  const rows = await db.getAllAsync<{
    tag_id: string | null;
    name: string;
    surname: string;
    phone: string;
    links: string;
    notes: string;
  }>(`
    SELECT tag_id, name, surname, phone, links, notes
    FROM contacts
    WHERE source = 'local'
    ORDER BY createdAt DESC
    LIMIT 1
  `);

  if (rows.length > 0) {
    setOwnerTagId(rows[0].tag_id ?? null);

    setForm({
      name: rows[0].name ?? "",
      surname: rows[0].surname ?? "",
      phone: rows[0].phone ?? "",
      links: rows[0].links ?? "",
      notes: rows[0].notes ?? "",
    });
  }
};

  useEffect(() => {
    // friends with NFC tags
    db.getAllAsync(
      "SELECT tag_id, name, surname FROM contacts WHERE tag_id IS NOT NULL",
    ).then(setFriends);

    // load local profile into form
    loadLocalProfile();
  }, []);

  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    links: "",
    notes: "",
  });

  // Funkcja zapisująca dopiero gdy mamy prawdziwy tag_id z NFC
  const saveToDB = async (tagId: string): Promise<void> => {
    const stmt = await db.prepareAsync(`
      INSERT OR REPLACE INTO contacts (
        tag_id, name, surname, phone, links, notes, source, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await stmt.executeAsync([
        tagId,
        form.name,
        form.surname,
        form.phone,
        form.links,
        form.notes,
        "local",
        new Date().toISOString(),
      ]);
    } finally {
      await stmt.finalizeAsync();
    }
  };

  const handleWrite = async () => {
    // Przygotuj payload w pamięci
    const payload = {
      type: "profile",
      owner: form,
      friends: friends
        .filter((f) => selected.includes(f.tag_id))
        .map((f) => ({
          tag_id: f.tag_id,
          name: f.name,
          surname: f.surname,
        })),
    };

    const size = calculateBytes(payload);
    if (size > MAX_BYTES) {
      Alert.alert("Error", "Too much data for NFC tag");
      return;
    }

    try {
      // Zapis na NFC
      const tagId = await writeNfc(payload);
      console.log("Tag ID:", tagId);

      // TYLKO jeśli mamy prawdziwy tagId zapisujemy do bazy
      if (!tagId) {
        Alert.alert("Error", "NFC tag returned no ID");
        return;
      }

      await saveToDB(tagId);

      Alert.alert("Success", "Written to NFC");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "NFC write failed");
    }
  };

  const payloadPreview = {
    type: "profile",
    owner: form,
    friends: friends.filter((f) => selected.includes(f.tag_id)),
  };

  const usedBytes = calculateBytes(payloadPreview);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Write NFC Tag</Title>
          <Paragraph>
            Fill in the details and write them to an NFC tag.
          </Paragraph>

          <TextInput
            label="Name"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            style={styles.input}
          />
          <TextInput
            label="Surname"
            value={form.surname}
            onChangeText={(v) => setForm({ ...form, surname: v })}
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Links"
            value={form.links}
            onChangeText={(v) => setForm({ ...form, links: v })}
            style={styles.input}
          />
          <TextInput
            label="Notes"
            value={form.notes}
            onChangeText={(v) => setForm({ ...form, notes: v })}
            multiline
            numberOfLines={3}
            style={styles.input}
          />

          <Title style={{ marginTop: 16 }}>Share friends</Title>
          {friends
            .filter((f) => f.tag_id !== ownerTagId)
            .map((f) => (
            <Button
              key={f.tag_id}
              mode={selected.includes(f.tag_id) ? "contained" : "outlined"}
              style={{ marginTop: 6 }}
              onPress={() =>
                setSelected((prev) =>
                  prev.includes(f.tag_id)
                    ? prev.filter((id) => id !== f.tag_id)
                    : [...prev, f.tag_id],
                )
              }
            >
              {f.name} {f.surname}
            </Button>
          ))}

          <Paragraph>
            NFC usage: {usedBytes} / {MAX_BYTES} bytes
          </Paragraph>
          {usedBytes > MAX_BYTES && (
            <Paragraph style={{ color: "red" }}>
              Payload too large for NFC tag
            </Paragraph>
          )}

          <Button mode="contained" onPress={handleWrite} style={styles.button}>
            Write to NFC
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/read")}
            style={styles.button}
          >
            Go to Read NFC
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push("/nfclist")}
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
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  card: { padding: 16 },
  input: { marginTop: 8 },
  button: { marginTop: 12 },
});
