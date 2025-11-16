// import * as NFC from 'expo-nfc';
// import * as Haptics from 'expo-haptics';
// import { Contact } from '../types';

// class NFCService {
//   private isScanning = false;

//   async checkNFCAvailability(): Promise<boolean> {
//     try {
//       const isAvailable = await NFC.hasHardwareAsync();
//       if (!isAvailable) return false;
      
//       const isEnabled = await NFC.isEnabledAsync();
//       return isEnabled;
//     } catch (error) {
//       console.error('NFC check failed:', error);
//       return false;
//     }
//   }

//   async writeContactData(contact: Partial<Contact>): Promise<boolean> {
//     try {
//       const jsonData = JSON.stringify(contact);
//       const record = {
//         recordType: NFC.TNF_WELL_KNOWN,
//         type: NFC.RTD_TEXT,
//         payload: this.stringToBytes(jsonData),
//       };

//       await NFC.writeNdefMessageAsync([record]);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       return true;
//     } catch (error) {
//       console.error('Write failed:', error);
//       await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return false;
//     }
//   }

//   async startScanningForContacts(
//     onContact: (contact: Partial<Contact>) => void
//   ): Promise<void> {
//     if (this.isScanning) return;
    
//     try {
//       this.isScanning = true;
      
//       await NFC.scanNdefMessageAsync({
//         onNdefMessage: (message) => {
//           if (message.ndefMessage && message.ndefMessage.length > 0) {
//             const record = message.ndefMessage[0];
//             const text = this.bytesToString(record.payload);
            
//             try {
//               const contact = JSON.parse(text);
//               Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
//               onContact(contact);
//             } catch (e) {
//               console.error('Failed to parse contact:', e);
//             }
//           }
//         },
//       });
//     } catch (error) {
//       console.error('Scan failed:', error);
//       this.isScanning = false;
//     }
//   }

//   stopScanning(): void {
//     this.isScanning = false;
//     NFC.cancelNdefMessageScanAsync();
//   }

//   private stringToBytes(str: string): Uint8Array {
//     const encoder = new TextEncoder();
//     return encoder.encode(str);
//   }

//   private bytesToString(bytes: Uint8Array): string {
//     const decoder = new TextDecoder();
//     return decoder.decode(bytes);
//   }
// }

// export default new NFCService();