const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

let receivedUpdates = [];
let actionQueue = [];

function filterAndProcessUpdates(update) {
    // Filtering out duplicates
    const isDuplicate = receivedUpdates.some(
        (u) => u.AppOrderID === update.AppOrderID && u.price === update.price && u.triggerPrice === update.triggerPrice
    );

    if (!isDuplicate) {
        receivedUpdates.push(update);
        console.log(`Processed update: ${JSON.stringify(update)}`);
        actionQueue.push(update);

        if (actionQueue.length === 1) {
            setTimeout(() => {
                determineAction(actionQueue);
                actionQueue = [];
            }, 1000);
        }
    } else {
        console.log(`Filtered duplicate: ${JSON.stringify(update)}`);
    }
}

function determineAction(updates) {
    updates.forEach((update) => {
        if (update.status === 'complete') {
            console.log(`Action: placeOrder for ${update.AppOrderID}`);
        } else if (update.status === 'cancelled') {
            console.log(`Action: cancelOrder for ${update.AppOrderID}`);
        } else {
            console.log(`No action needed for ${update.AppOrderID}`);
        }
    });
}

ws.on('message', (data) => {
    const update = JSON.parse(data);
    filterAndProcessUpdates(update);
});

ws.on('close', () => {
    console.log('Disconnected from server');
});
