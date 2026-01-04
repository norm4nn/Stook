import { Platform } from 'react-native';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

const log = (...args: any[]) => console.log('[NFC]', ...args);
const warn = (...args: any[]) => console.warn('[NFC]', ...args);
const error = (...args: any[]) => console.error('[NFC]', ...args);

export async function initNFC() {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    console.warn('[NFC] Skipping NFC init (unsupported platform)');
    return;
  }

  if (!NfcManager?.start) {
    console.warn('[NFC] NFC native module not available (Expo Go)');
    return;
  }

  try {
    await NfcManager.start();
    console.log('[NFC] NFC manager started');
  } catch (e) {
    console.error('[NFC] Failed to start NFC manager', e);
  }
}

export async function writeNfc(data: object) {
  log('writeNfc called');
  log('Payload object:', data);

  const json = JSON.stringify(data);
  log('JSON payload:', json);

  const bytes = Ndef.encodeMessage([
    Ndef.textRecord(json),
  ]);

  log('Encoded NDEF bytes length:', bytes.length);

  try {
    log('Requesting NDEF technology...');
    await NfcManager.requestTechnology(NfcTech.Ndef);
    log('NDEF technology acquired');

    log('Writing NDEF message...');
    await NfcManager.ndefHandler.writeNdefMessage(bytes);
    log('NDEF message written successfully');
  } catch (e) {
    error('Error during NFC write', e);
    throw e;
  } finally {
    log('Releasing NFC technology');
    await NfcManager.cancelTechnologyRequest();
  }
}

export async function readNfc(): Promise<any> {
  log('readNfc called');

  try {
    log('Requesting NDEF technology...');
    await NfcManager.requestTechnology(NfcTech.Ndef);
    log('NDEF technology acquired');

    log('Reading NFC tag...');
    const tag = await NfcManager.getTag();
    log('Raw tag object:', tag);

    const record = tag?.ndefMessage?.[0];
    if (!record?.payload) {
      warn('No NDEF payload found on tag');
      return null;
    }

    log('Raw payload bytes:', record.payload);

    const payloadBytes = Uint8Array.from(record.payload);
    const payloadText = Ndef.text.decodePayload(payloadBytes);

    log('Decoded text payload:', payloadText);

    const parsed = JSON.parse(payloadText);
    log('Parsed JSON object:', parsed);

    return parsed;
  } catch (e) {
    error('Error during NFC read', e);
    throw e;
  } finally {
    log('Releasing NFC technology');
    await NfcManager.cancelTechnologyRequest();
  }
}