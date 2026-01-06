import { Platform } from "react-native";
import NfcManager, { Ndef, NfcTech } from "react-native-nfc-manager";

export async function initNFC() {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    console.warn("[NFC] Skipping NFC init (unsupported platform)");
    return;
  }

  if (!NfcManager?.start) {
    console.warn("[NFC] NFC native module not available (Expo Go)");
    return;
  }

  try {
    await NfcManager.start();
    console.log("[NFC] NFC manager started");
  } catch (e) {
    console.error("[NFC] Failed to start NFC manager", e);
  }
}

export async function writeNfc(data: any): Promise<string> {
  const json = JSON.stringify(data);
  const bytes = Ndef.encodeMessage([Ndef.textRecord(json)]);

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef);

    const tag = await NfcManager.getTag();
    const tagId = tag?.id;
    if (!tagId) {
      throw new Error("NFC tag has no ID");
    }

    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    return tagId;
  } finally {
    await NfcManager.cancelTechnologyRequest();
  }
}

export async function readNfc(): Promise<any> {
  console.log("readNfc called");

  try {
    console.log("Requesting NDEF technology...");
    await NfcManager.requestTechnology(NfcTech.Ndef);
    console.log("NDEF technology acquired");

    console.log("Reading NFC tag...");
    const tag = await NfcManager.getTag();
    console.log("Raw tag object:", tag);

    if (!tag) {
      console.warn("No tag detected");
      return null;
    }

    // Pobierz pierwszy rekord NDEF
    const record = tag.ndefMessage?.[0];
    if (!record?.payload) {
      console.warn("No NDEF payload found on tag");
      return null;
    }

    console.log("Raw payload bytes:", record.payload);

    // Dekodowanie payloadu
    const payloadBytes = Uint8Array.from(record.payload);
    // Pomijamy pierwsze 3 bajty (status byte + lang code) dla tekstu
    const payloadText = Ndef.text.decodePayload(payloadBytes);

    console.log("Decoded text payload:", payloadText);

    const parsed = JSON.parse(payloadText);
    console.log("Parsed JSON object:", parsed);

    // Dodaj tag_id z fizycznego tagu
    parsed.owner = parsed.owner || {};
    parsed.owner.tag_id = tag.id;

    return parsed;
  } catch (e) {
    console.error("Error during NFC read", e);
    throw e;
  } finally {
    console.log("Releasing NFC technology");
    await NfcManager.cancelTechnologyRequest();
  }
}
