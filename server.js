const WebSocket = require('ws');
const express = require('express');
const app = express();
const port = 3000;

// Initialize a WebSocket Server
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const wss = new WebSocket.Server({ server });

let orderId = 1000;

function sendOrderUpdate(ws, numUpdates, delay) {
    setTimeout(() => {
        for (let i = 0; i < numUpdates; i++) {
            const update = {
                AppOrderID: orderId++,
                price: Math.random() * 100,
                triggerPrice: Math.random() * 100,
                priceType: ['MKT', 'LMT', 'SL-LMT'][Math.floor(Math.random() * 3)],
                status: ['complete', 'open', 'pending', 'cancelled'][Math.floor(Math.random() * 4)],
                exchange: 'NSE',
                symbol: ['IDEA', 'RELIANCE', 'TATA', 'BAJAJ', 'WIPRO', 'ONGC'][Math.floor(Math.random() * 6)]
            };
            ws.send(JSON.stringify(update));
            console.log(`Sent update: ${JSON.stringify(update)}`);
        }
    }, delay);
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Sending updates as per the assignment details
    sendOrderUpdate(ws, 10, 0); // First 10 updates in 1 second
    sendOrderUpdate(ws, 20, 2000); // Next 20 updates after 2 seconds
    sendOrderUpdate(ws, 40, 5000); // 40 updates after 3 seconds
    sendOrderUpdate(ws, 30, 10000); // Final 30 updates after 5 seconds

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
