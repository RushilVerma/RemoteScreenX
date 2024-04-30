const WebSocketServer = require('ws').WebSocketServer;
const { PORT, SERVER_IP } = require('../private/server_settings.json');
const { createCanvas } = require('canvas');
const screenshot = require('screenshot-desktop');

const ws = new WebSocketServer({ port: PORT, host: SERVER_IP }); // Specify the IP address to listen on

const SCREEN_WIDTH = 1920; // Width of the screen to capture
const SCREEN_HEIGHT = 1080; // Height of the screen to capture

// Create a canvas to draw screen captures
const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const ctx = canvas.getContext('2d');

ws.on('connection', function (clientWs) {
  console.log('WebSocket connected');

  clientWs.on('message', function (message) {
    console.log('Received message:', message);

    // Parse the message as JSON
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.error('Error parsing message:', error);
      return;
    }

    // Check the message type
    switch (parsedMessage.type) {
      case 'touch':
        handleTouch(parsedMessage.data);
        break;
      default:
        console.log('Unknown message type:', parsedMessage.type);
    }
  });

  // Send initial screen capture when client connects
  captureScreenAndSendFrames.bind(null, clientWs)();

  clientWs.on('close', function () {
    console.log('WebSocket disconnected');
  });
});

ws.on('listening', function () {
  const server = ws._server; // Access the underlying HTTP server
  const address = server.address(); // Get the address of the HTTP server

  if (address) {
    console.log(`WebSocket server running on ws://${JSON.stringify(address)}:${address.port}`);
  } else {
    console.error('Failed to get server address');
  }
});

// Function to capture screen and send frames to clients
function captureScreenAndSendFrames(clientWs) {
  if (!clientWs) {
    console.log('clientWs is not defined');
    return;
  }

  screenshot({ format: 'png' })
    .then((img) => {
      // Draw captured screen image onto canvas
      const imgData = Buffer.from(img).toString('base64');

      // Send screen capture frame to the connected client
      if (clientWs.readyState === 1) {
        clientWs.send(imgData);
      }
    })
    .catch((error) => {
      console.error('Screenshot failed:', error);
    })
    .finally(()=>setTimeout(captureScreenAndSendFrames.bind(null, clientWs), 10));
}

// Function to handle touch events
function handleTouch(touchData) {
  const { x, y } = touchData;
  
  // Move the mouse to the specified coordinates
  robot.moveMouse(x, y);

  // Perform a mouse click
  robot.mouseClick();
  
  console.log(`Emulated click at (${x}, ${y})`);
}
