import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStook } from '@/context/stook-context';

const shareableFields = [
  { label: 'Phone', key: 'phone' },
  { label: 'LinkedIn', key: 'linkedin' },
  { label: 'Favorite meme', key: 'favoriteMeme' },
  { label: 'Bonus', key: 'bonus' },
] as const;

export default function HomeScreen() {
  const { shareables, isActive, enqueueMockTap } = useStook();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#aef5d8', dark: '#09372c' }}
      headerImage={
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.heroIcon}
          contentFit="contain"
        />
      }>
      <ThemedView style={styles.hero}>
        <ThemedText type="title">Stook</ThemedText>
        <ThemedText style={styles.heroTagline}>
          Tap-to-meet information card. Keep it active and up to date from the Profile tab.
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[styles.statusCard, !isActive && styles.statusCardPaused]}
        lightColor="#ffffff"
        darkColor="#111315">
        <ThemedText type="subtitle">
          {isActive ? 'Ready for NFC taps' : 'Stook is paused'}
        </ThemedText>
        <ThemedText>
          {isActive
            ? 'Anyone tapping you will see the details below.'
            : 'Switch it back on inside Profile to start sharing again.'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Shared fields</ThemedText>
        {shareableFields.map((item) => (
          <View key={item.key} style={styles.shareRow}>
            <ThemedText type="defaultSemiBold">{item.label}</ThemedText>
            <ThemedText style={styles.shareValue}>
              {shareables[item.key] ? shareables[item.key] : 'Configure in Profile'}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      <Pressable
        accessibilityRole="button"
        onPress={enqueueMockTap}
        style={({ pressed }) => [
          styles.mockButton,
          { opacity: pressed ? 0.8 : 1, backgroundColor: isActive ? '#0f172a' : '#4b5563' },
        ]}>
        <ThemedText style={styles.mockButtonLabel}>
          {isActive ? 'Simulate NFC tap' : 'Enable Stook to simulate'}
        </ThemedText>
      </Pressable>

      <ThemedText style={styles.helperCopy}>
        Tap the button to push a packet into the background listener and preview what another phone
        would read from your Stook.
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    paddingBottom: 8,
  },
  heroTagline: {
    fontSize: 18,
    lineHeight: 24,
  },
  heroIcon: {
    height: 160,
    width: 160,
    bottom: -20,
    right: 16,
    position: 'absolute',
    opacity: 0.1,
  },
  section: {
    paddingVertical: 12,
    gap: 8,
  },
  statusCard: {
    padding: 16,
    borderRadius: 14,
    gap: 6,
    marginVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  statusCardPaused: {
    borderColor: '#fb923c',
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  shareValue: {
    maxWidth: '65%',
    textAlign: 'right',
  },
  mockButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 6,
  },
  mockButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  helperCopy: {
    fontSize: 14,
    opacity: 0.8,
  },
});
