import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Contact } from '../../types';
import { theme } from '../../constants/theme';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onPress }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(contact.name)}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{contact.name}</Text>
        {contact.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detail}>{contact.email}</Text>
          </View>
        )}
        {contact.phone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.detail}>{contact.phone}</Text>
          </View>
        )}
        <Text style={styles.date}>
          {new Date(contact.tapDate).toLocaleDateString('pl-PL')}
        </Text>
      </View>
      
      <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  initials: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  detail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  date: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});