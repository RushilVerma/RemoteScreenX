import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, TextInput, Pressable } from 'react-native';
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
      const data = JSON.parse(e.data);
      const messageType = data.type;
      const messageData = data.data;
      if (messageType !== 'image') console.log(`Message Ayo... : ${data}`);
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

  const sendMessage = () => {
    if (socket) {
      // Example: Sending a text message
      const message = {
        type: 'text',
        data: 'Hello from React Native Android!',
      };
      if (socket) {
        socket.send(JSON.stringify(message));
      }
    }
  };

  const sendTouchEvent = (type, event) => {
    const touchData = {
      type: 'touch',
      data: { type, event },
    };
    if (socket) {
      socket.send(JSON.stringify(touchData));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        {receivedImage ? (
          <WebView
            source={{ html: `<img src="${receivedImage}" style="width: 100%; height: 100%;" />` }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : null}
      </View>
      <View style={styles.rightContainer}>
        <TextInput
          style={styles.input}
          onChangeText={text => setServerIP(text)}
          value={serverIP}
        />
        <View style={styles.buttonContainer}>
          <Button title={connecting ? "Connecting..." : "Connect"} onPress={handleConnect} disabled={connecting || socket !== null} />
          <Button title="Send Message" onPress={sendMessage} disabled={!socket} />
        </View>
        <View style={styles.arrowContainer}>
          <View style={styles.row}>
            <Pressable
              onPressIn={(e) => sendTouchEvent('up', 'press')}
              onPressOut={(e) => sendTouchEvent('up', 'release')}
              style={[styles.arrowButton, styles.upButton]}
            />
          </View>
          <View style={styles.row}>
            <Pressable
              onPressIn={(e) => sendTouchEvent('left', 'press')}
              onPressOut={(e) => sendTouchEvent('left', 'release')}
              style={[styles.arrowButton, styles.leftButton]}
            />
            <Pressable
              onPressIn={(e) => sendTouchEvent('click', 'press')}
              onPressOut={(e) => sendTouchEvent('click', 'release')}
              style={[styles.centerButton, styles.clickButton]}
            />
            <Pressable
              onPressIn={(e) => sendTouchEvent('right', 'press')}
              onPressOut={(e) => sendTouchEvent('right', 'release')}
              style={[styles.arrowButton, styles.rightButton]}
            />
          </View>
          <View style={styles.row}>
            <Pressable
              onPressIn={(e) => sendTouchEvent('down', 'press')}
              onPressOut={(e) => sendTouchEvent('down', 'release')}
              style={[styles.arrowButton, styles.downButton]}
            />
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Add space between items
    alignItems: 'center', // Center items vertically
    padding: 10,
  },
  webViewContainer: {
    flex: 1,
    marginRight: 10, // Add margin to separate from right container
  },
  rightContainer: {
    flex: 0.27,
    justifyContent: 'center',
    alignItems: 'flex-start', // Align items to the start (left)
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: '100%', // Take full width of the container
  },
  buttonContainer: {
    justifyContent: 'space-around',
    width: '100%', // Take full width of the container
  },
  arrowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  arrowButton: {
    width: 50,
    height: 50,
    // margin: 5,
    borderWidth: 1,
    borderRadius: 5,
  },
  upButton: {
    backgroundColor: 'green',
  },
  downButton: {
    backgroundColor: 'red',
  },
  leftButton: {
    backgroundColor: 'blue',
  },
  rightButton: {
    backgroundColor: 'yellow',
  },
  centerButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'purple',
  },
  clickButton: {
    borderRadius: 50,
  },
});
export default PCWebSocket;