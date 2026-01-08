import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Card, Paragraph, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../lib/database";
import { readNfc } from "../../lib/nfc";

const ASSET_AUDIO = require("../../assets/audio/fart.mp3");

export default function ReadScreen() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const toDay = (iso: string) => iso.slice(0, 10);

  const canStook = (lastStookedAt: string | null, now: string) => {
    if (!lastStookedAt) return true;
    return toDay(lastStookedAt) < toDay(now);
  };

  const loadCurrentSound = async (): Promise<Audio.Sound> => {
    if (sound) await sound.unloadAsync();

    let stored = await AsyncStorage.getItem("currentNfcSound");
    let parsed: { uri: string; isAsset?: boolean } | null = null;
    if (stored) {
      try {
        parsed = JSON.parse(stored);
      } catch {
        parsed = { uri: stored, isAsset: false };
      }
    }

    let newSound: Audio.Sound;

    if (!parsed) {
      ({ sound: newSound } = await Audio.Sound.createAsync(ASSET_AUDIO));
    } else if (parsed.isAsset) {
      ({ sound: newSound } = await Audio.Sound.createAsync(parsed.uri));
    } else {
      try {
        ({ sound: newSound } = await Audio.Sound.createAsync({
          uri: parsed.uri,
        }));
      } catch {
        ({ sound: newSound } = await Audio.Sound.createAsync(ASSET_AUDIO));
      }
    }

    setSound(newSound);
    return newSound;
  };

  useEffect(() => {
    let mounted = true;

    loadCurrentSound().catch(console.error);

    return () => {
      mounted = false;
      sound?.unloadAsync();
    };
  }, []);

  // Obsługa skanowania NFC
  const handleRead = async () => {
    let transactionStarted = false;
    try {
      const data = await readNfc();
      if (!data || data.type !== "profile") return;

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
        [data.owner.tag_id],
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
          [data.owner.tag_id, f.tag_id, f.name, f.surname, now],
        );
      }

      await db.execAsync("COMMIT");
      transactionStarted = false;

      const currentSound = await loadCurrentSound();
      await currentSound.replayAsync();

      Alert.alert("Success", "Profile and friends saved");
    } catch (e) {
      if (transactionStarted) await db.execAsync("ROLLBACK");
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
