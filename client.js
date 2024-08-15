const WebSocket = require("ws");


const ws = new WebSocket("ws://localhost:3000");

let lastTimeReceived = null; 
let pendingUpdates = []; 
let existingOrders = {}; 

// Function to check if a new update is redundant compared to an existing update
function isRedundantUpdate(newUpdate, existingUpdate) {
  return (
    newUpdate.AppOrderID === existingUpdate.AppOrderID &&
    newUpdate.price === existingUpdate.price &&
    newUpdate.triggerPrice === existingUpdate.triggerPrice &&
    newUpdate.priceType === existingUpdate.priceType &&
    newUpdate.productType === existingUpdate.productType &&
    newUpdate.status === existingUpdate.status &&
    newUpdate.exchange === existingUpdate.exchange &&
    newUpdate.symbol === existingUpdate.symbol
  );
}

// Function to determine the action required for an order update
function determineAction(orderUpdate) {
  const orderExists = existingOrders[orderUpdate.AppOrderID] !== undefined;

  if (orderUpdate.priceType === "MKT" && orderUpdate.status === "complete") {
    // For Market orders that are complete, modify or place order based on existence
    return orderExists ? "modifyOrder" : "placeOrder";
  } else if (orderUpdate.priceType === "LMT" && orderUpdate.status === "open") {
    // For Limit orders that are open, modify or place order based on existence
    return orderExists ? "modifyOrder" : "placeOrder";
  } else if (
    (orderUpdate.priceType === "SL-LMT" ||
      orderUpdate.priceType === "SL-MKT") &&
    orderUpdate.status === "pending"
  ) {
    // For Stop-Limit or Stop-Market orders that are pending, modify or place order based on existence
    return orderExists ? "modifyOrder" : "placeOrder";
  } else if (
    (orderUpdate.priceType === "LMT" ||
      orderUpdate.priceType === "SL-LMT" ||
      orderUpdate.priceType === "SL-MKT") &&
    orderUpdate.status === "cancelled"
  ) {
    // For cancelled orders, perform cancel action
    return "cancelOrder";
  }
  return null; // No action if conditions are not met
}

// Function to handle the order update based on determined action
function handleOrderUpdate(orderUpdate) {
  const action = determineAction(orderUpdate);
  if (action) {
    console.log(`For AppOrderId: ${orderUpdate.AppOrderID}: ${action} `);
  }
}

// Function to process all pending updates
function processUpdates() {
  if (pendingUpdates.length > 0) {
    // Remove redundant updates by keeping only unique updates based on AppOrderID
    const uniqueUpdates = Array.from(
      new Map(pendingUpdates.map((item) => [item["AppOrderID"], item])).values()
    );

    uniqueUpdates.forEach((orderUpdate) => {
      const existingOrder = existingOrders[orderUpdate.AppOrderID];
      if (existingOrder && isRedundantUpdate(orderUpdate, existingOrder)) {
        console.log(
          `Filtered redundant update for Order ID: ${orderUpdate.AppOrderID}`
        );
        return;
      }

      // Handle the order update and update existingOrders
      handleOrderUpdate(orderUpdate);
      existingOrders[orderUpdate.AppOrderID] = orderUpdate;
    });

    // Clear the pending updates after processing
    pendingUpdates = [];
  }
}

// Event handler for receiving messages from WebSocket
ws.on("message", (data) => {
  const orderUpdate = JSON.parse(data);

  console.log(`Received: ${JSON.stringify(orderUpdate)}`);

  // Add the received update to the pendingUpdates queue
  pendingUpdates.push(orderUpdate);

  const currentTime = new Date().getTime();
  if (!lastTimeReceived || currentTime - lastTimeReceived > 1000) {
    // If more than 1 second has passed since the last update, process all updates
    processUpdates();
    lastTimeReceived = currentTime;
  } else {
    // Otherwise, set a timeout to process updates once 1 second has passed
    setTimeout(processUpdates, 1000 - (currentTime - lastTimeReceived));
  }
});

// Event handler for WebSocket connection open
ws.on("open", () => {
  console.log("Connected to WebSocket server");
});

// Event handler for WebSocket connection close
ws.on("close", () => {
  console.log("Disconnected from WebSocket server");
});

// Event handler for WebSocket errors
ws.on("error", (error) => {
  console.error(`WebSocket error: ${error}`);
});
