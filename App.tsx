import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import PCWebSocket from './Components/PCWebSocket';

const App = () => {
  return (
    <View style={styles.container}>
      <Button title='Print' onPress={() => console.log(`Some Logs ..`)}/>
      <PCWebSocket />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Set the background color to black
  },
});

export default App;