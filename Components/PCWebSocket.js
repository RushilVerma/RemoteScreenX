import React, { useState } from 'react';
import { View, StyleSheet, Text, Button, TextInput } from 'react-native';
import { PORT, SERVER_IP } from '../private/server_settings.json'
import { WebView } from 'react-native-webview';

const PCWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [serverIP, setServerIP] = useState(SERVER_IP); // Default server IP address
  const [connecting, setConnecting] = useState(false);
  const [receivedImage, setReceivedImage] = useState('');

  const handleConnect = () => {
    console.log("Connecting .... ")
    setConnecting(true);
    // Attempt to connect to the WebSocket server
    const ws = new WebSocket(`ws://${serverIP}:${PORT}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
      setConnecting(false);
    };

    ws.onmessage = (e) => {
      // console.log('Received message:', e.data);
      const decodedImage = `data:image/png;base64,${e.data}`;
      setReceivedImage(decodedImage);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnecting(false);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
      setConnecting(false);
    };
  };

  const sendMessage = () => {
    if (socket) {
      socket.send('Hello from React Native Android!');
    }
  };

  return (
    <View >
      <View style={styles.container}>
        {receivedImage ? (
          <WebView
            source={{ html: `<img src="${receivedImage}" style="width: 100%; height: 100%;" />` }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : null}
      </View>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        onChangeText={text => setServerIP(text)}
        value={serverIP}
      />
      <Button title={connecting ? "Connecting..." : "Connect"} onPress={handleConnect} disabled={connecting || socket !== null} />
      <Button title="Send Message" onPress={sendMessage} disabled={!socket} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 500,
    height: 250,
  },
});

export default PCWebSocket;
