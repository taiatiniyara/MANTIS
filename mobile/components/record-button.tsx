import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function RecordButton() {
  // Note: Navigation is handled by the tab bar itself
  // This component just renders the visual button
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <Text style={styles.icon}>+</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  icon: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    marginTop: -2,
  },
});
