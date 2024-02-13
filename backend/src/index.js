import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import http from 'http';
import { WebSocketServer } from 'ws';


const server = http.createServer(app);

dotenv.config({
    path: './env'
})

const wss = new WebSocketServer({server});

// WebSocket event handling
wss.on('connection', (ws) => {
    console.log('A new client connected.');
  
    // Event listener for incoming messages
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
  
      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === wss.OPEN) {
          client.send(message.toString());
        }
      });
    });
  
    // Event listener for client disconnection
    ws.on('close', () => {
      console.log('A client disconnected.');
    });
  });

connectDB()
.then(() => {
    server.listen(process.env.PORT || 5000, () => {
        console.log(` Server is running at PORT : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);
})

















// import express from "express"
// const app = express()

// ( async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("ERROR:", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//            console.log(`App is listening on PORT ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("ERROR:", error)
//         throw error
//     }
// } )()