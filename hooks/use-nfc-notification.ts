import { useEffect } from 'react';
import { Alert } from 'react-native';

import { useStook } from '@/context/stook-context';

export function useNfcNotification() {
  const { latestPacket, acknowledgePacket } = useStook();

  useEffect(() => {
    if (!latestPacket) {
      return;
    }

    const title = latestPacket.active ? 'NFC tap payload' : 'NFC tap rejected';
    const content = Object.entries(latestPacket.payload)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    Alert.alert(
      title,
      content.length ? content : 'No shareable content configured.',
      [
        {
          text: 'Dismiss',
          onPress: () => acknowledgePacket(latestPacket.id),
        },
      ],
      { cancelable: true }
    );

    return () => acknowledgePacket(latestPacket.id);
  }, [latestPacket, acknowledgePacket]);
}
