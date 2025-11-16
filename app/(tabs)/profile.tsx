import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStook } from '@/context/stook-context';
import { useThemeColor } from '@/hooks/use-theme-color';

const editableFields = [
  { label: 'Phone number', key: 'phone', placeholder: '+48 123 456 789', keyboardType: 'phone-pad' },
  { label: 'LinkedIn profile', key: 'linkedin', placeholder: 'linkedin.com/in/you' },
  { label: 'Favorite meme / gif', key: 'favoriteMeme', placeholder: 'Drop a fun link or line' },
  { label: 'Bonus action', key: 'bonus', placeholder: 'E.g. “Send me a coffee invite”' },
] as const;

export default function ProfileScreen() {
  const { isActive, toggleActive, shareables, updateShareable, resetShareables } = useStook();
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#a0a0a0', dark: '#6b7280' }, 'text');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#e0f2fe', dark: '#0f172a' }}
      headerImage={
        <IconSymbol size={280} name="slider.horizontal.3" color="#0284c7" style={styles.headerIcon} />
      }>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile & tap payload</ThemedText>
        <ThemedText>
          Decide whether Stook is discoverable and configure what people get when they tap your phone.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.card} lightColor="#ffffff" darkColor="#15191f">
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText type="subtitle">Stook availability</ThemedText>
            <ThemedText>
              {isActive ? 'Live and ready for NFC greetings.' : 'Paused until you flip it back on.'}
            </ThemedText>
          </View>
          <Switch
            value={isActive}
            onValueChange={(value) => toggleActive(value)}
            thumbColor={isActive ? '#22c55e' : '#d4d4d8'}
            trackColor={{ false: '#a1a1aa', true: '#bbf7d0' }}
          />
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Shared links & signals</ThemedText>
          <Pressable onPress={resetShareables} accessibilityRole="button">
            <ThemedText type="link">Reset defaults</ThemedText>
          </Pressable>
        </View>
        {editableFields.map((field) => (
          <View key={field.key} style={styles.inputBlock}>
            <ThemedText type="defaultSemiBold">{field.label}</ThemedText>
            <ThemedView style={styles.inputWrapper} lightColor="#ffffff" darkColor="#0c0d0f">
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder={field.placeholder}
                placeholderTextColor={placeholderColor}
                value={shareables[field.key]}
                onChangeText={(value) => updateShareable(field.key, value)}
                keyboardType={field.keyboardType ?? 'default'}
              />
            </ThemedView>
          </View>
        ))}
      </ThemedView>

      <ThemedView style={styles.footerCard} lightColor="#f1f5f9" darkColor="#111827">
        <ThemedText type="defaultSemiBold">Need inspiration?</ThemedText>
        <ThemedText>
          Set up a meme-of-the-week link, drop your music profile, or add a mini CTA. Whatever you write here
          shows up in the Home tab so you can proof it before events.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    opacity: 0.3,
    right: -10,
    bottom: -50,
    position: 'absolute',
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  section: {
    gap: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputBlock: {
    gap: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    fontSize: 16,
    paddingVertical: 6,
  },
  footerCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
});
