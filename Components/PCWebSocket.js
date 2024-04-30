import React, { useState } from 'react';
import { View, StyleSheet, Text, Button, TextInput, TouchableOpacity } from 'react-native';
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
      const data = JSON.parse(e.data);
      const messageType = data.type;
      const messageData = data.data;

      switch (messageType) {
        case 'image':
          const decodedImage = `data:image/png;base64,${messageData}`;
          setReceivedImage(decodedImage);
          break;
        case 'text':
          console.log('Received text message:', messageData);
          // Handle text message
          break;
        default:
          console.log('Unknown message type:', messageType);
      }
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

  const handleTouch = (event) => {
    const { nativeEvent } = event;
    const { locationX, locationY } = nativeEvent;
    const touchData = {
      type: 'touch',
      data: { x: locationX, y: locationY }
    };

    if (socket) {
      socket.send(JSON.stringify(touchData));
    }
  };

  const sendMessage = () => {
    if (socket) {
      // Example: Sending a text message
      const message = {
        type: 'text',
        data: 'Hello from React Native Android!',
      };
      socket.send(JSON.stringify(message));
    }
  };

  return (
    <View>
      <View style={styles.container}>
        {receivedImage ? (
          <WebView
            source={{ html: `<img src="${receivedImage}" style="width: 100%; height: 100%;" />` }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : null}
      </View>
      <TouchableOpacity onPress={handleTouch} style={styles.touchArea}>
        <Text style={styles.touchText}>Touch Here</Text>
      </TouchableOpacity>
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
  touchArea: {
    width: 200,
    height: 200,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default PCWebSocket;
