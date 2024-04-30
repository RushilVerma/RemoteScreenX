const { createCanvas, loadImage } = require('canvas');
const screenshot = require('desktop-screenshot');

const SCREEN_WIDTH = 1920; // Width of the screen to capture
const SCREEN_HEIGHT = 1080; // Height of the screen to capture

// Create a canvas to draw screen captures
const canvas = createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
const ctx = canvas.getContext('2d');

// Function to capture screen and send frames to clients
function captureScreenAndSendFrames(ws) {
    if(!ws) console.error(`[screencapture.js] Websocket Undefined`)

    screenshot("screen.png", function (error, complete) {
        if (error) {
            console.error('Screenshot failed:', error);
            return;
        }

        // Load captured screen image onto canvas
        loadImage('screen.jpg').then((image) => {
            ctx.drawImage(image, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            const imageData = canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");;
            
            window.location.href=image;
            // Send screen capture frame to connected clients
            ws.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(imageData);
                }
            });
        }).catch((err) => {
            console.error('Error loading image:', err);
        });
    });
}

module.exports =
{
    captureScreenAndSendFrames
}