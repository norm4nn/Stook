import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, Title } from "react-native-paper";
import { db } from "../database";
import { readNfc } from "../nfc";

export default function ReadScreen() {
  const handleRead = async () => {
    const data = await readNfc();
    if (!data || data.type !== "profile") return;

    // zapis ownera
    await db.runAsync(
      `INSERT OR IGNORE INTO contacts
       (tag_id, name, surname, phone, links, notes, source, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.owner.tag_id,
        data.owner.name,
        data.owner.surname,
        data.owner.phone,
        data.owner.links,
        data.owner.notes,
        "nfc",
        new Date().toISOString(),
      ],
    );

    for (const f of data.friends) {
      await db.runAsync(
        `INSERT INTO shared_contacts
         (tag_id, name, surname, from_tag_id, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [
          f.tag_id,
          f.name,
          f.surname,
          data.owner.tag_id,
          new Date().toISOString(),
        ],
      );
    }

    Alert.alert("Success", "Profile and friends saved");
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
          <Button
            mode="outlined"
            onPress={() => router.push("/write")}
            style={styles.button}
          >
            Go to Write NFC
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
  button: { marginVertical: 6 },
});
