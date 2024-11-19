const { WebSocketServer } = require("ws")
const { GameManager } = require("./components/managers/GameManager.js");
const { connectToDb } = require("./database/Connection.js");


const wss = new WebSocketServer({ port: 8080 })
const gameManager = new GameManager(connectToDb())

wss.on("connection", function connection(ws, req) {
    gameManager.enableMessageHandler(ws)
    ws.on("close", async() => await gameManager.removeUserUsingSocket(ws))
});