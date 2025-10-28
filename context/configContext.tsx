import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_QR_CONFIG, SynagogueConfig } from '../config/mockConfig';

// Create context
const ConfigContext = createContext<{
  config: SynagogueConfig;
  updateConfig: (newSettings: Partial<SynagogueConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
}>({
  config: MOCK_QR_CONFIG,
  updateConfig: async () => {},
  resetConfig: async () => {},
});

// Provider component
export const ConfigProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [config, setConfig] = useState<SynagogueConfig>(MOCK_QR_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const storedConfig = await AsyncStorage.getItem('synagogue_config');
      if (storedConfig) {
        setConfig(JSON.parse(storedConfig));
      }
    } catch (error) {
      console.log('Error loading config:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateConfig = async (newSettings: Partial<SynagogueConfig>) => {
    try {
      const updatedConfig = { ...config, ...newSettings };
      
      // Deep merge for nested objects
      if (newSettings.synagogue) {
        updatedConfig.synagogue = { ...config.synagogue, ...newSettings.synagogue };
      }
      if (newSettings.settings) {
        updatedConfig.settings = { ...config.settings, ...newSettings.settings };
      }
      if (newSettings.colors) {
        updatedConfig.colors = { ...config.colors, ...newSettings.colors };
      }
      
      // Update arrays if provided
      if (newSettings.donation_targets) {
        updatedConfig.donation_targets = newSettings.donation_targets;
      }
      if (newSettings.quick_amounts) {
        updatedConfig.quick_amounts = newSettings.quick_amounts;
      }
      
      // Save to state and AsyncStorage
      setConfig(updatedConfig);
      await AsyncStorage.setItem('synagogue_config', JSON.stringify(updatedConfig));
    } catch (error) {
      console.log('Error updating config:', error);
    }
  };

  const resetConfig = async () => {
    try {
      setConfig(MOCK_QR_CONFIG);
      await AsyncStorage.setItem('synagogue_config', JSON.stringify(MOCK_QR_CONFIG));
    } catch (error) {
      console.log('Error resetting config:', error);
    }
  };

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook for easy access
export const useConfig = () => useContext(ConfigContext);