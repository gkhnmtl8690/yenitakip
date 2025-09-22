
import React from 'react';
import { View, StatusBar } from 'react-native';
import App from '../scripts/app.js';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="default" backgroundColor="transparent" translucent={true} />
      <App />
    </View>
  );
}
