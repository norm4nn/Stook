import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { Card, IconButton, Title } from "react-native-paper";
import * as FileSystem from "expo-file-system/legacy";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ASSET_AUDIO = require("../../assets/audio/fart.mp3");
const CUSTOM_FILE_NAME = "custom.m4a";

export default function RecordScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [currentSound, setCurrentSound] = useState<{
    uri: string;
    isAsset?: boolean;
  } | null>(null);
  const [customUri, setCustomUri] = useState<string | null>(null);

  const loadSounds = async () => {
    try {
      const customPath = FileSystem.documentDirectory + CUSTOM_FILE_NAME;
      const fileInfo = await FileSystem.getInfoAsync(customPath);
      setCustomUri(fileInfo.exists ? "file://" + customPath : null);

      const stored = await AsyncStorage.getItem("currentNfcSound");
      if (stored) setCurrentSound(JSON.parse(stored));
      else setCurrentSound({ uri: ASSET_AUDIO, isAsset: true });
    } catch (err) {
      console.error("Failed to load sounds:", err);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) return;

      const newPath = FileSystem.documentDirectory + CUSTOM_FILE_NAME;
      await FileSystem.moveAsync({ from: uri, to: newPath });

      const fullUri = "file://" + newPath;
      setRecording(null);
      setCustomUri(fullUri);

      await setAsCurrentSound(fullUri, false);
      Alert.alert("Success", "Custom sound saved!");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRecording = async () => {
    if (recording) await stopRecording();
    else await startRecording();
  };

  const playSound = async (uri: string | any) => {
    try {
      if (playingSound) await playingSound.unloadAsync();

      const sound = new Audio.Sound();
      if (typeof uri === "string" && uri.startsWith("file://")) {
        await sound.loadAsync({ uri });
      } else {
        await sound.loadAsync(uri);
      }

      setPlayingSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error(err);
    }
  };

  const setAsCurrentSound = async (uri: string | any, isAsset?: boolean) => {
    const item = { uri, isAsset };
    await AsyncStorage.setItem("currentNfcSound", JSON.stringify(item));

    try {
      if (playingSound) await playingSound.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(isAsset ? uri : { uri });
      setPlayingSound(sound);
    } catch (err) {
      console.error("Failed to load current sound:", err);
    }

    setCurrentSound(item);
    Alert.alert("Set", "This sound will now play on NFC scan");
  };

  useEffect(() => {
    loadSounds();
    return () => {
      playingSound?.unloadAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ alignItems: "center" }}>
          <Title>Record Your Sound</Title>
          <IconButton
            icon={recording ? "stop" : "microphone"}
            size={80}
            onPress={toggleRecording}
            style={{ marginVertical: 16 }}
          />

          <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
            Choose sound:
          </Text>

          {/* fart.mp3 */}
          <TouchableOpacity
            onPress={() => setAsCurrentSound(ASSET_AUDIO, true)}
            style={styles.soundRow}
          >
            <Text style={styles.soundName}>
              {currentSound?.uri === ASSET_AUDIO ? "● " : ""}fart.mp3
            </Text>
            <IconButton
              icon="play"
              size={24}
              onPress={() => playSound(ASSET_AUDIO)}
            />
          </TouchableOpacity>

          {/* custom.m4a */}
          {customUri && (
            <TouchableOpacity
              onPress={() => setAsCurrentSound(customUri, false)}
              style={styles.soundRow}
            >
              <Text style={styles.soundName}>
                {currentSound?.uri === customUri ? "● " : ""}custom.m4a
              </Text>
              <IconButton
                icon="play"
                size={24}
                onPress={() => playSound(customUri)}
              />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },
  card: { padding: 16 },
  soundRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  soundName: { fontSize: 16, color: "#007AFF" },
});
