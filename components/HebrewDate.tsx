import { HDate } from '@hebcal/core';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SynagogueConfig } from '../config/mockConfig';

interface HebrewDateProps {
  config: SynagogueConfig;
}

export default function HebrewDate({ config }: HebrewDateProps) {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // המרת התאריך הנוכחי לתאריך עברי
  const getHebrewDate = (date: Date): string => {
    // יצירת אובייקט תאריך עברי מתאריך גרגוריאני
    const hDate = new HDate(date);
    
    // השגת התאריך העברי בפורמט גמטרייה (אותיות עבריות)
    return hDate.renderGematriya();
  };
  
  const hebrewDate = getHebrewDate(currentDateTime);
  const timeString = currentDateTime.toLocaleTimeString('he-IL', { 
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