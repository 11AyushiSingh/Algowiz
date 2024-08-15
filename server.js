const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

function generateOrderUpdates({
  startId = 1,
  count = 10,
  initialPrice = 100,
  initialTriggerPrice = 50,
  priceType = "MKT",
  status = "open",
  symbol = "TATA",
}) {
  const updates = [];

  for (let i = 0; i < count; i++) {
    updates.push({
      AppOrderID: startId + i,
      price: initialPrice + i * 1.5, // Different logic for price increment
      triggerPrice: initialTriggerPrice + i * 1.2, // Different logic for trigger price increment
      priceType,
      productType: "standard",
      status,
      exchange: "BSE", // Changed exchange for variation
      symbol,
    });
  }

  return updates;
}

function sendOrderUpdates(ws) {
  const updates = [
    ...generateOrderUpdates({ startId: 1, count: 10, initialPrice: 100, initialTriggerPrice: 90, priceType: "MKT", status: "complete", symbol: "ABC" }),
    ...generateOrderUpdates({ startId: 11, count: 20, initialPrice: 200, initialTriggerPrice: 190, priceType: "LMT", status: "open", symbol: "DEF" }),
    ...generateOrderUpdates({ startId: 31, count: 40, initialPrice: 300, initialTriggerPrice: 290, priceType: "SL-LMT", status: "pending", symbol: "IGH" }),
    ...generateOrderUpdates({ startId: 71, count: 30, initialPrice: 400, initialTriggerPrice: 390, priceType: "SL-MKT", status: "complete", symbol: "JKL" }),
    ...generateOrderUpdates({ startId: 41, count: 5, initialPrice: 150, initialTriggerPrice: 140, priceType: "MKT", status: "cancelled", symbol: "NFLX" }),
  ];

  const sendUpdatesWithDelay = (updatesSlice, delay) => {
    setTimeout(() => {
      updatesSlice.forEach((update) => {
        const time = new Date().toLocaleTimeString();
        ws.send(JSON.stringify(update));
        console.log(`[${time}] Sent update: ${JSON.stringify(update)}`);
      });
    }, delay);
  };

  sendUpdatesWithDelay(updates.slice(0, 10), 1000);
  sendUpdatesWithDelay(updates.slice(10, 30), 2000);
  sendUpdatesWithDelay(updates.slice(30, 70), 3000);
  sendUpdatesWithDelay(updates.slice(70, 100), 5000);
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  sendOrderUpdates(ws);

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:3000");
