import { Game } from "./Game.js"
import { SocketManager } from "./SocketManager.js"
import { User } from "./User.js"
import { EXIT_GAME, GAME_ADDED, GAME_ALERT, GAME_OVER, GAME_STARTED, JOIN_GAME, MOVE } from "./messages.js"

export class GameManager {
    
    constructor() {
        this.games = [] // List of Game Types
        this.pendingGameId = null
        this.users = [] // List of User Types
        this.socketManager = new SocketManager()
    }

    addUser(user) {
        this.users.push(user)
    }

    addGame(game) {
        this.games.push(game)
    }

    removeUser(userId) {
        this.users = this.users.filter(u => u.userId !== userId)
    }

    removeGame(gameId) {
        this.games = this.games.filter(g => g.gameId !== gameId)
    }

    findUser(userId) {
        return this.users.find(u => u.userId === userId)
    }

    findGame(gameId) {
        return this.games.find(g => g.gameId === gameId)
    }

    removeUserUsingSocket(socket) {
        const user = this.users.find(u => u.socket === socket)
        if (user === undefined) {
            socket.send(JSON.stringify({
                type: GAME_ALERT,
                payload: {
                    message: "Socket associated not in the lobby"
                }
            }))
            console.error("Error: User not in the lobby")
            return
        }
        this.#exitGame(user.userId)
        console.log(this)
    }

    enableMessageHandler(socket) {
        socket.on("message", async (crude_message) => {
            // Parse the message from the client
            const message = JSON.parse(crude_message.toString())
            if (message.type === JOIN_GAME) {
                const userId = message.payload.userId
                const name   = message.payload.name
                this.#joinGame(userId, name, socket)
            }
            if (message.type === EXIT_GAME) {
                const userId = message.payload.userId
                this.#exitGame(userId, socket)
            }
            if (message.type === MOVE) {
                const userId = message.payload.userId
                const move   = message.payload.move
                this.#makeMove(userId, move, socket)
            }
            console.log(this)
        })
    }

    #joinGame(userId, name, socket) {
        let user = this.findUser(userId)
        if (user !== undefined) 
            return this.#alreadyInGame(userId, socket)
        
        user = new User(socket, userId, name)
        this.addUser(user)
        if (!this.pendingGameId)
            return this.#noPendingGame(user)
        return this.#pendingGame(user)
    }

    #alreadyInGame(userId, socket) {
        socket.send(JSON.stringify({
            type: GAME_ALERT,
            payload: {
                message: `User ${userId} already in a game`
            }
        }))
        console.error(`Error: User ${userId} already in a game`)
    }

    #noPendingGame(user) {
        const game = new Game()
        game.setPlayer(user)
        this.addGame(game)
        this.socketManager.addUser(user, game.gameId)
        this.socketManager.broadcast(game.gameId, {
            type: GAME_ADDED,
            payload: {
                gameId: game.gameId
            }
        })
        this.pendingGameId = game.gameId
    }

    #pendingGame(user) {
        const game = this.findGame(this.pendingGameId)
        if (game === undefined) 
            throw new Error(`Error: Incorrect pending game Id ${this.pendingGameId}`)
        game.setPlayer(user)
        this.socketManager.addUser(user, this.pendingGameId)
        this.socketManager.broadcast(this.pendingGameId, {
            type: GAME_STARTED,
            payload: {
                gameId: this.pendingGameId,
                cross_player: {
                    id: game.player1.userId,
                    name: game.player1.name
                },
                circle_player: {
                    id: game.player2.userId,
                    name: game.player2.name
                },
            }
        })
        this.pendingGameId = null
    }

    #exitGame(userId, socket) {
        const user = this.findUser(userId)
        if (user === undefined) {
            socket.send(JSON.stringify({
                type: GAME_ALERT,
                payload: {
                    message: `User ${userId} not in the game`
                }
            }))
            console.error(`Error: Incorrect User ID: ${userId}`)
            return
        }
        const gameId = this.socketManager.getGameId(userId)
        const game   = this.findGame(gameId)
        if (game === undefined) 
            throw new Error(`Error: Incorrect Game Id ${gameId}`)
        if (gameId === this.pendingGameId) 
            this.pendingGameId = null
        game.forfeitGame(user)
        this.#endGame(game, true)
    }

    #endGame(game, isForfeit) {
        const users = this.socketManager.getUsers(game.gameId)
        const winner = game.getWinner()
        this.socketManager.broadcast(game.gameId, {
            type: GAME_OVER,
            payload: {
                gameId: game.gameId,
                isForfeit: isForfeit,
                result: winner ? winner.userId : null,
                winningPattern: game.getWinningPattern()
            }
        })
        users.forEach(user => {
            this.removeUser(user.userId)
            this.socketManager.removeUser(user.userId)
        })
        this.removeGame(game.gameId)
    }

    #makeMove(userId, move, socket) {
        const user = this.findUser(userId)
        if (user === undefined) {
            socket.send(JSON.stringify({
                type: GAME_ALERT,
                payload: {
                    message: `User ${userId} not in the game`
                }
            }))
            console.error(`Error: Incorred User ID: ${userId}`)
            return
        }
        const gameId = this.socketManager.getGameId(user.userId)
        const game   = this.findGame(gameId)
        if (game === undefined) 
            throw new Error(`Error: Incorrect Game Id ${gameId}`)
        const moveMade = game.makeMove(user, move)
        if (moveMade) {
            this.socketManager.broadcast(gameId, {
                type: MOVE,
                payload: {
                    gameId: gameId,
                    userId: userId,
                    move: move
                }
            })
        }
        else {
            user.sendMessage({
                type: GAME_ALERT,
                payload: {
                    message: `Invalid Move`
                }
            })
        }
        const winner = game.getWinner()
        const isDraw = game.getIsDraw()
        if (winner || isDraw) 
           this.#endGame(game, false)
    }
   
}