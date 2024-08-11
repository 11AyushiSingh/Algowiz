# Algowiz
# installation
Prerequisites
Node.js (version 12.x or higher)
npm (Node Package Manager)

# Setup
Clone the repository or download the project files and install the dependencies.
npm i

# Usages
Run the server and client and command for this is
node server.js
node client.js

# Project Structure
|- server.js           # WebSocket server implementation
|- client.js           # WebSocket listener (client) implementation
|- package.json        # Node.js project configuration and dependencies
|- README.md           # Project documentation (this file)


# web socket server
it will sennd the order update to the client listener with specified delays
and perform :-

First 10 updates within 1 second
Next 20 updates after 2 seconds
40 updates after 3 seconds
Final 30 updates after 5 seconds
and logs each order update along with time stamp

# web socket listener
WebSocket client that listens to these
updates, filters out duplicates and redundant updates, determines actions
based on order details, and logs all activities.


# logging and time
Server Logs: Logs every order update sent, including the time.

Client Logs: Logs filtered duplicates, processed updates, actions taken (placeOrder, modifyOrder, cancelOrder), and any updates sent to the action handler.



