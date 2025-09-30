import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SynagogueConfig } from '../config/mockConfig';

interface HebrewDateProps {
  config: SynagogueConfig;
}

export default function HebrewDate({ config }: HebrewDateProps) {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const hebrewDate = "כ״ט אלול תשפ״ה";
  const timeString = time.toLocaleTimeString('he-IL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <View style={styles.container}>
      <Text style={[styles.time, { color: config.colors.primary }]}>
        {timeString}
      </Text>
      <Text style={styles.date}>{hebrewDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
});