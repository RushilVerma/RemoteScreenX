const WebSocketServer = require('ws').WebSocketServer;
const { PORT, SERVER_IP } = require('../private/server_settings.json');
const screenshot = require('screenshot-desktop');
const robot = require("robotjs");
const sharp = require('sharp');
const sensitivity = 2;
const ws = new WebSocketServer({ port: PORT, host: SERVER_IP }); // Specify the IP address to listen on

ws.on('headers', (headers, request) => {
  headers.push('Access-Control-Allow-Origin: *'); // Update this with your specific origin if needed
});

ws.on('connection', function (clientWs) {
  console.log('WebSocket connected');

  clientWs.on('message', function (message) {
    // console.log('Received message:', message);

    // Parse the message as JSON
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (error) {
      console.log('Error parsing message:', error);
      return;
    }

    // Check the message type
    switch (parsedMessage.type) {
      case 'touch':
        handleTouch(parsedMessage.data);
        break;
      case 'text':
        const sendData = {
          'type': 'text',
          'data': message
        };
        clientWs.send(JSON.stringify(sendData));
        break;
      default:
        console.log('Unknown message type:', parsedMessage.type);
    }
  });

  // Send initial screen capture when client connects
  captureScreenAndSendFrames(clientWs);

  clientWs.on('close', function () {
    console.log('WebSocket disconnected');
  });
});

ws.on('listening', function () {
  const server = ws._server; // Access the underlying HTTP server
  const address = server.address(); // Get the address of the HTTP server

  if (address) {
    console.log(`WebSocket server running on ws://${address.address}:${address.port}`);
  } else {
    console.log('Failed to get server address');
  }
});

// Function to capture screen and send frames to clients
function captureScreenAndSendFrames(clientWs) {
  if (!clientWs) {
    console.log('clientWs is not defined');
    return;
  }
  screenshot({ format: 'jpg' })
  .then((img) => {
    // Resize the image using sharp
    sharp(img)
      .resize({ width: 800 }) // Adjust the width as needed
      .toBuffer()
      .then((resizedImg) => {
        const imgData = resizedImg.toString('base64');
        let cursorPos = robot.getMousePos();
        cursorPos = {
          x: cursorPos.x / robot.getScreenSize().width,
          y: cursorPos.y / robot.getScreenSize().height,
        };
        cursorPos = {
          x: cursorPos.x < 1 ? cursorPos.x : 1,
          y: cursorPos.y < 1 ? cursorPos.y : 1,
        };
        // console.log("Sending Cursor : "+cursorPos.x+","+cursorPos.y)
        const jsonData = {
          type: 'image',
          data: imgData,
          cursor: cursorPos,
        };
        // Send screen capture frame to the connected client
        if (clientWs.readyState === 1) {
          clientWs.send(JSON.stringify(jsonData));
        }
      })
      .catch((err) => {
        console.error('Error resizing image:', err);
      });
  })
  .catch((error) => {
    console.log('Screenshot failed:', error);
  })
  .finally(() => setTimeout(captureScreenAndSendFrames.bind(null, clientWs), 10));
}

// Function to calculate new mouse position based on touch type
function calChange(touchData_type, newX, newY) {
  switch (touchData_type) {
    case 'left':
      newX -= sensitivity;
      break;
    case 'right':
      newX += sensitivity;
      break;
    case 'up':
      newY -= sensitivity;
      break;
    case 'down':
      newY += sensitivity;
      break;
    default:
      console.log('Unknown direction:', touchData_type);
      return [newX, newY];
  }
  return [newX, newY];
}

let moveMouseInterval;

// Function to handle touch events
function handleTouch(touchData) {
  // console.log(touchData);
  try {
    if (touchData.event === 'press') {
      if (touchData.type === 'click') {
        // Perform a mouse click
        moveMouseInterval = setInterval(() => {
          robot.mouseClick();
        }, 100);
      } else {
        moveMouseInterval = setInterval(() => {
          let { x: newX, y: newY } = robot.getMousePos();
          [newX, newY] = calChange(touchData.type, newX, newY);
          // Move the mouse to the new coordinates
          robot.moveMouse(newX, newY);
        }, 10);
      }
    } else if (touchData.event === 'release') {
      clearInterval(moveMouseInterval);
    }
  } catch (error) {
    console.log('Error handling touch:', error);
  }
}
