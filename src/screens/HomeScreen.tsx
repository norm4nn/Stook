import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ScrollView,
  RefreshControl 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NFCButton } from '../components/common/NFCButton';
// import nfcService from '../services/nfcService';
import storageService from '../services/storageService';
import { useStore } from '../store/useStore';
import { Contact } from '../types';
import { theme } from '../constants/theme';

export const HomeScreen = () => {
  const [nfcEnabled, setNfcEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, addContact, contacts, tapEvents } = useStore();

  useEffect(() => {
    checkNFC();
  }, []);

  const checkNFC = async () => {
    // const available = await nfcService.checkNFCAvailability();
    // setNfcEnabled(available);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkNFC();
    setRefreshing(false);
  };

  const handleTap = async () => {
    if (!nfcEnabled) {
      Alert.alert('NFC Wyłączone', 'Włącz NFC w ustawieniach telefonu');
      return;
    }

    // try {
    //   await nfcService.startScanningForContacts(async (contactData) => {
    //     if (contactData && contactData.userId) {
    //       const newContact: Contact = {
    //         id: Date.now().toString(),
    //         userId: contactData.userId,
    //         name: contactData.name || 'Nieznany',
    //         email: contactData.email,
    //         phone: contactData.phone,
    //         socialLinks: contactData.socialLinks,
    //         tapDate: new Date(),
    //       };

    //       addContact(newContact);
    //       await storageService.saveContacts([...contacts, newContact]);
          
    //       nfcService.stopScanning();
          
    //       Alert.alert(
    //         'Sukces!',
    //         `Dodano kontakt: ${newContact.name}`,
    //         [{ text: 'Super!' }]
    //       );
    //     }
    //   });
    // } catch (error) {
    //   Alert.alert('Błąd', 'Nie udało się odczytać kontaktu');
    // }
  };

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Cześć!</Text>
          <Text style={styles.title}>Witaj w Stook</Text>
          <Text style={styles.subtitle}>
            Zbliż telefony aby wymienić się kontaktami
          </Text>
        </View>

        <View style={styles.nfcContainer}>
          <NFCButton onTap={handleTap} disabled={!nfcEnabled} />
        </View>

        {!nfcEnabled && (
          <View style={styles.warning}>
            <Text style={styles.warningIcon}>!</Text>
            <Text style={styles.warningText}>
              NFC jest wyłączone. Włącz je w ustawieniach telefonu.
            </Text>
          </View>
        )}

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{contacts.length}</Text>
            <Text style={styles.statLabel}>Kontakty</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{tapEvents.length}</Text>
            <Text style={styles.statLabel}>Stuknięcia</Text>
          </View>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Wskazówki</Text>
          <Text style={styles.tipText}>Zbliż tył telefonu do drugiego urządzenia</Text>
          <Text style={styles.tipText}>Utrzymaj telefony przez 2-3 sekundy</Text>
          <Text style={styles.tipText}>Skonfiguruj profil przed stuknięciem</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  nfcContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  warningText: {
    color: '#856404',
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.xl,
  },
  statBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    minWidth: 120,
    elevation: 2,
  },
  statNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  tips: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginVertical: 4,
  },
});