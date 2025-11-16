import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  View, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface NFCButtonProps {
  onTap: () => void;
  disabled?: boolean;
}

export const NFCButton: React.FC<NFCButtonProps> = ({ onTap, disabled }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = async () => {
    setIsScanning(true);
    
    // Animacja pulsowania
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    await onTap();
    setIsScanning(false);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled || isScanning}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          {isScanning ? (
            <>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.text}>Skanowanie...</Text>
            </>
          ) : (
            <>
              <Ionicons name="wifi" size={70} color="#fff" />
              <Text style={styles.text}>Stuknij telefonem</Text>
              <Text style={styles.subtext}>Zbliż do drugiego urządzenia</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  content: {
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
});