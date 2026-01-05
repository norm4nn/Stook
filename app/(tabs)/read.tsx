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

    try {
      const ownTag = await db.getFirstAsync(
        `SELECT tag_id FROM contacts WHERE tag_id = ? AND source = 'local'`,
        [data.owner.tag_id],
      );

      if (ownTag) {
        Alert.alert(
          "This is your tag",
          "You are scanning an NFC tag created on this device.",
        );
        return;
      }

      await db.execAsync("BEGIN");

      await db.runAsync(
        `
        INSERT INTO contacts (
          tag_id, name, surname, phone, links, notes, source, createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tag_id) DO UPDATE SET
          name = excluded.name,
          surname = excluded.surname,
          phone = excluded.phone,
          links = excluded.links,
          notes = excluded.notes,
          source = excluded.source
        `,
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
          `
          INSERT INTO shared_contacts (
            from_tag_id, tag_id, name, surname, createdAt
          )
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(from_tag_id, tag_id) DO UPDATE SET
            name = excluded.name,
            surname = excluded.surname
          `,
          [
            data.owner.tag_id,
            f.tag_id,
            f.name,
            f.surname,
            new Date().toISOString(),
          ],
        );
      }

      await db.execAsync("COMMIT");

      Alert.alert("Success", "Profile and friends saved");
    } catch (e) {
      await db.execAsync("ROLLBACK");
      console.error(e);
      Alert.alert("Error", "Failed to save NFC data");
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
