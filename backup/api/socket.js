import { v4 as uuidv4 } from 'uuid';
const jwt = require('jsonwebtoken');
import { WebSocketServer } from 'ws';
const Apikeys = require('../../database/models/apikeys.model');
const Account = require('../../database/models/brokers.model');
const WatchMarket = require('../../database/models/marketwatches.model');
const Users = require('../../database/models/users.model');

export default async function handler(req, res) {
 try {
   if (res.socket.server.wss) {
       console.log('Socket is already runningkl');
   } else {
       console.log('Socket is initializing')
       const server = res.socket.server
       const wss = new WebSocketServer({ noServer: true })
       res.socket.server.wss = wss
       server.on('upgrade', (req, socket, head) => {
         if (!req.url.includes('/_next/webpack-hmr')) {
           wss.handleUpgrade(req, socket, head, (ws) => {
             wss.emit('connection', ws, req);
           });
         }
       });
      
       var brokersData = await getCommonToken(1);
       const DataSocket = require("fyers-api-v3").fyersDataSocket;
      //  const GeneralSocket = require("fyers-api-v3").fyersOrderSocket;
       const accesstoken = `${brokersData[0].client_id}:${brokersData[0].token}`;
       var skt = DataSocket.getInstance(accesstoken,"");
      //  var Generalskt = new GeneralSocket(accesstoken,"");
       var websocketList = [];
       wss.on('connection', async (ws,req)=> {

         const url = new URL(req.url, 'http://localhost:3000');
         //const url = new URL(req.url,'https://tuliptechnicals.com');
         const token = url.searchParams.get('token');
      
         if(!token) {
           ws.close(401, 'Unauthorized');
           return;
         }

         if (!await isValidToken(token)) {
           ws.close();
           return;
         } else {
           const userId = uuidv4();
           console.log(`Recieved a new connection.`);
           websocketList.push(ws);
           console.log(`${userId} connected.`);
             ws.addEventListener("open", (event) => {
               ws.send(JSON.stringify({
                 'type': 'connected'
               }));
             });
   
             ws.addEventListener("message", (event) => {
               const Incomingdata = JSON.parse(event.data);
               console.log("Incomingdata",Incomingdata);
               if(Incomingdata.type === 'subscribe1') {
                 Incomingdata.watchlist?.map(item => {
                  skt.subscribe([item.symbol]);
                 })
               }
               if(Incomingdata.type === 'subscribe') {
                 console.log("Subscribe Symbol ", Incomingdata.symbol);
                 getNewConnectsubs(Incomingdata.symbol,Incomingdata.userId,ws);
                 skt.subscribe([Incomingdata.symbol]);
               }
   
               if(Incomingdata.type === 'unsubscribe') {
                 console.log("UnSubscribe Symbol ", Incomingdata.symbol);
                 getNewConnect(Incomingdata.symbol,Incomingdata.userId,ws);
                 skt.unsubscribe([Incomingdata.symbol]);
               }
   
               if(Incomingdata.type === 'singleSubscribe') {
                 skt.subscribe([Incomingdata.symbol]);
               }
             });
   
             ws.addEventListener('close', (code, reason) => {
               console.log('Client disconnected:', code, reason);
               skt.on("close",function(){
                 console.log("socket closed")
               })
             });
   
             ws.addEventListener('error', (error) => {
               console.error('WebSocket encountered an error:', error);
             });
   
             skt.on("connect",async function(){
               var result = await WatchMarket.findAndCountAll({raw:true});
               result.rows.map(item => {
                 skt.subscribe([item.symbol]);
                 console.log("Subscribing Symbol ", item.symbol);
               });
             })
     
             skt.on("message",async function(message){
               wss.clients.forEach(client =>
                  client.send(JSON.stringify({
                    'type': 'socketinfo', 
                    'symbol': message.symbol,   
                    'info': message,
                  }))
                );

                if(message.symbol) {
                  wss.clients.forEach(client =>
                    client.send(JSON.stringify({
                      'type': 'latestInfo',    
                      'symbol': message.symbol,   
                      'info': message,
                    }))
                  )
                }
             })

             skt.on('orders',function (msg) {
              console.log("orders",msg)
            })
             
             skt.on("error",function(message){
              console.log("error is",message)
             })
             
             skt.on("close",function() {
              console.log("socket closed")
             })

            //  // General Sockets

            //  Generalskt.on("error",function (errmsg) {
            //   console.log("General Socket Errors",errmsg)
            //  })
          
            //   //for ticks of general data like price-alerts,EDIS
            //   Generalskt.on('general',function (msg) {
            //     console.log("general",msg)
            //   })
            //   Generalskt.on('connect',function () {
            //     Generalskt.subscribe([Generalskt.orderUpdates,Generalskt.positionUpdates])
            //   })
            //   Generalskt.on('close',function () {
            //     console.log('General Socket closed')
            //   })
              
            //   //for ticks of orderupdates
            //   Generalskt.on('orders',function (msg) {
            //     console.log("General orders",msg)
            //   })
            //   //
             skt.connect()
             skt.autoreconnect() 
            //  Generalskt.autoreconnect()
            //  Generalskt.connect()
             ws.on('disconnect', () => {
              console.log(`Socket ${ws.id} disconnected.`);
             }); 
        
         }
 
       });
 
   }
   res.end()
 } catch (error) {
    console.log("Error in Socket Handler", error);
 }
}

async function isValidToken(token) {
  const checkToken = jwt.verify(token, process.env.NEXT_PUBLIC_SECRET);
  const User = await newgetToken(checkToken.user_id);
  if(User.length > 0) {
    return true;
  } else {
    return false;
  } 
}

async function getNewConnect(sym,userId,socket) {
  await WatchMarket.destroy({
   where: {
     symbol: sym,
     user_id:userId
   },
 });
 socket.send(JSON.stringify({
  'type': 'removeItem'
 }));
}


async function getCommonToken(userid = 1) {
  var result = await Apikeys.findAndCountAll({
   where: {
     id: userid
   }
  });
  var datas = [];
  result.rows.map(item => {
      datas.push({
        'token': item.access_token,
        'client_id': item.key,
        'password': item.secret
      })
  })
  return datas;
}

async function getNewConnectsubs(sym,userId,socket) {
  var brokersData = await getCommonToken(1);
  const FyersAPI = require("fyers-api-v3").fyersModel;
  var fyersA = new FyersAPI();
  fyersA.setAppId(`${brokersData[0].client_id}`);
  fyersA.setAccessToken(`${brokersData[0].token}`);
  var inp=[sym];
  const item = await fyersA.getQuotes(inp);
  console.log("Subscribe Symbol Details", item.d[0]['v']['symbol']);
  if(item.s == 'ok') {
    await WatchMarket.create({
      user_id: userId,
      symbol : item.d[0]['v']['symbol'],
      ask :  item.d[0]['v']['ask'],
      bid :   item.d[0]['v']['bid'],
      ch : item.d[0]['v']['ch'],
      chp : item.d[0]['v']['chp'],
      high_price : item.d[0]['v']['high_price'],
      low_price : item.d[0]['v']['low_price'],
      lp : item.d[0]['v']['lp'],
      open_price : item.d[0]['v']['open_price'],
      prev_close_price : item.d[0]['v']['prev_close_price'],
      tt : item.d[0]['v']['tt'],
      volume : item.d[0]['v']['volume']
  });
  socket.send(JSON.stringify({
    'type': 'removeItem'
  }));
}
}

async function getToken(userid) {
  var result = await Account.findAndCountAll({
   where: {
     user_id: userid
   }
  });
  return result.rows;
}

async function newgetToken(userid) {
  var result = await Users.findAndCountAll({
   where: {
     id: userid
   }
  });
  return result.rows;
}
