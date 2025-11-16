import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import storageService from '../services/storageService';
import { useStore } from '../store/useStore';
import { theme } from '../constants/theme';

export const SettingsScreen = () => {
  const handleClearData = () => {
    Alert.alert(
      'Czy na pewno?',
      'Wszystkie dane zostaną usunięte. Ta operacja jest nieodwracalna.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: async () => {
            await storageService.clearAll();
            useStore.setState({ contacts: [], tapEvents: [], user: null });
            Alert.alert('Sukces', 'Dane zostały wyczyszczone');
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, title, onPress, danger }: any) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={danger ? theme.colors.error : theme.colors.text} 
      />
      <Text style={[styles.menuText, danger && styles.dangerText]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar style="dark" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Ustawienia</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OGÓLNE</Text>
          <MenuItem 
            icon="notifications-outline" 
            title="Powiadomienia" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="shield-checkmark-outline" 
            title="Prywatność" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="language-outline" 
            title="Język" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>POMOC</Text>
          <MenuItem 
            icon="help-circle-outline" 
            title="Centrum pomocy" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="chatbubble-outline" 
            title="Skontaktuj się z nami" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="document-text-outline" 
            title="Regulamin" 
            onPress={() => {}} 
          />
          <MenuItem 
            icon="lock-closed-outline" 
            title="Polityka prywatności" 
            onPress={() => {}} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>O APLIKACJI</Text>
          <MenuItem 
            icon="information-circle-outline" 
            title="O aplikacji Stook" 
            onPress={() => {}} 
          />
          <View style={styles.versionRow}>
            <Text style={styles.versionLabel}>Wersja</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STREFA NIEBEZPIECZNA</Text>
          <MenuItem 
            icon="trash-outline" 
            title="Wyczyść wszystkie dane" 
            onPress={handleClearData}
            danger
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with snus by Stook Team</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl + 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  dangerText: {
    color: theme.colors.error,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  versionLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  versionValue: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});