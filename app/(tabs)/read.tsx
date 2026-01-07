import { Audio } from "expo-av";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, Paragraph, Title } from "react-native-paper";
import { db } from "../../lib/database";
import { readNfc } from "../../lib/nfc";

export default function ReadScreen() {
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);

  const toDay = (iso: string) => iso.slice(0, 10); // YYYY-MM-DD

  const canStook = (
    lastStookedAt: string | null,
    now: string
  ): boolean => {
    if (!lastStookedAt) return true;
    return toDay(lastStookedAt) < toDay(now);
  };

  React.useEffect(() => {
    let mounted = true;

    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/audio/fart.mp3"),
        { shouldPlay: false }
      );
      if (mounted) setSound(sound);
    };

    loadSound();

    return () => {
      mounted = false;
      sound?.unloadAsync();
    };
  }, []);

  const handleRead = async () => {
    let transactionStarted = false;

    try {
      const data = await readNfc();
      if (!data || data.type !== "profile") return;

      const ownTag = await db.getFirstAsync(
        `SELECT tag_id FROM contacts WHERE tag_id = ? AND source = 'local'`,
        [data.owner.tag_id]
      );

      if (ownTag) {
        Alert.alert(
          "This is your tag",
          "You are scanning an NFC tag created on this device."
        );
        return;
      }

      const now = new Date().toISOString();

      const existing = await db.getFirstAsync<{
        stook_count: number | null;
        last_stooked_at: string | null;
      }>(
        `
        SELECT stook_count, last_stooked_at
        FROM contacts
        WHERE tag_id = ?
        `,
        [data.owner.tag_id]
      );

      let stookCount = existing?.stook_count ?? 0;
      if (canStook(existing?.last_stooked_at ?? null, now)) {
        stookCount += 1;
      }

      await db.execAsync("BEGIN");
      transactionStarted = true;

      await db.runAsync(
        `
        INSERT INTO contacts (
          tag_id, name, surname, phone, links, notes,
          source, createdAt, stook_count, last_stooked_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tag_id) DO UPDATE SET
          name = excluded.name,
          surname = excluded.surname,
          phone = excluded.phone,
          links = excluded.links,
          notes = excluded.notes,
          source = excluded.source,
          stook_count = excluded.stook_count,
          last_stooked_at = excluded.last_stooked_at
        `,
        [
          data.owner.tag_id,
          data.owner.name,
          data.owner.surname,
          data.owner.phone,
          data.owner.links,
          data.owner.notes,
          "nfc",
          now,
          stookCount,
          now,
        ]
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
            now,
          ]
        );
      }

      await db.execAsync("COMMIT");
      transactionStarted = false;
      if (sound) {
        await sound.replayAsync();
      }
      Alert.alert("Success", "Profile and friends saved");
    } catch (e) {
      if (transactionStarted) {
        await db.execAsync("ROLLBACK");
      }
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
