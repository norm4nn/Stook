import React, { useEffect, useState } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useStore } from './src/store/useStore';
import storageService from './src/services/storageService';
import { View, ActivityIndicator } from 'react-native';
import { theme } from './src/constants/theme';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { setUser } = useStore();

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async () => {
    try {
      const user = await storageService.getUser();
      const savedContacts = await storageService.getContacts();
      
      if (user) {
        setUser(user);
      }
      
      if (savedContacts.length > 0) {
        useStore.setState({ contacts: savedContacts });
      }
    } catch (error) {
      console.error('Failed to load app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
}