import assert from "assert"
import { Game } from "./Game.js"
import { UserManager } from "./UserManager.js"
import { User } from "./User.js"
import { 
    getUserByCredentials, 
    getUserByEmailId, 
    getUserByUsername, 
    insertUserByCredentials, 
    updateUserStats 
} from "../database/Users.js"
import { connectToDb } from "../database/Connection.js"
import { ERRORS, MESSAGES } from "../messages.js"


export class GameManager {
    
    /*
    create table users (userid uuid, emailid text, password text, username text, level int, xp int, unique (emailid));
    */
    constructor() {
        this.games = []
        this.pendingGameId = null
        this.dbClient = connectToDb()
        this.userManager = new UserManager()
    }

    addGame(game) {
        this.games.push(game)
    }

    removeGame(gameId) {
        this.games = this.games.filter(g => g.gameId !== gameId)
    }

    getGameFromGameId(gameId) {
        return this.games.find(g => g.gameId === gameId)
    }

    displayGameManagerStatus() {
        // Display Users
        console.log("Games: ")
        this.games.forEach(game => console.log(game.gameId))
        console.log("User Manager: ")
        console.log(this.userManager)
        console.log("---------------\n\n")
    }

    getRouteToCallback() {
        return {
            [MESSAGES.LOGIN]: this.login.bind(this),
            [MESSAGES.LOGOUT]: this.logout.bind(this),
            [MESSAGES.MOVE]: this.makeMove.bind(this),
            [MESSAGES.SIGNUP]: this.signup.bind(this),
            [MESSAGES.LOGOUT]: this.logout.bind(this),
            [MESSAGES.EXIT_GAME]: this.exitGame.bind(this),
            [MESSAGES.JOIN_GAME]: this.joinGame.bind(this) 
        }
    }

    getRouteToParameters() {
        return {
            "signup"   : ["emailId", "userName", "password", "confirmPassword"],
            "login"    : ["emailId", "password"],
            "move"     : ["userId", "move"],
            "logout"   : ["userId"],
            "join_game": ["userId"],
            "exit_game": ["userId"],
        }
    }

    enableMessageHandler(socket) {
        socket.on("message", async (crude_message) => {
            const message = JSON.parse(crude_message.toString())
            if (!this.#checkParams(message))
                return this.#invalidParams(socket)

            const routeCallback = this.getRouteToCallback()[message.type]
            await routeCallback(message.payload, socket)
            return this.displayGameManagerStatus()
        })
    }

// Async Route Callbacks ------------------------------------------------------------
    async removeUserUsingSocket(socket) {
        const userId = this.userManager.getUserIdFromSocket(socket)
        if (userId === undefined) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_SOCKET,
                    message: "Socket associated not in the lobby"
                }
            }))
        }
        await this.logout({userId}, socket)
        this.displayGameManagerStatus()
    }

    async login(payload, socket) {
        // Check if the user exists in db
        const { emailId, password } = payload
        const userInfo = await getUserByCredentials(this.dbClient, emailId, password)
        if (!userInfo) {
           return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_CREDENTIALS,
                    message: "Invalid email/password"
                }
            }))
        }

        // Check if the user is already logged in
        if (this.#isUserLoggedIn(userInfo.userid)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_LOGGED_IN,
                    message: `${emailId} already logged in`
                }
            })) 
        }

        // User not logged in
        const user = new User(userInfo.userid, userInfo.username, userInfo.level, userInfo.xp)
        this.userManager.addUser(user, socket)
        this.userManager.sendMessage(user.userId, {
            type: MESSAGES.LOGIN,
            payload: {
                userId  : userInfo.userid,
                userName: userInfo.username,
                emailId : userInfo.emailid,
                password: userInfo.password,
                level   : userInfo.level,
                xp      : userInfo.xp
            } 
        })
    }

    async signup(payload, socket) {
        // Check if the passwords match
        const { emailId, password, userName, confirmPassword } = payload
        if (password !== confirmPassword) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.MISMATCH_PASSWORDS,
                    message: `Passwords do not match`
                }
            }))
        }
        
        // Check if the user is already signed up
        const userInfoByEmailId = await getUserByEmailId(this.dbClient, emailId)
        if (userInfoByEmailId) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_REGISTERED,
                    message: `${emailId} already signed up`
                }
            }))
        }

        // Check if the username is already taken up
        const userInfoByUsername = await getUserByUsername(this.dbClient, userName)
        if (userInfoByUsername) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USERNAME_TAKEN,
                    message: `${userName} already taken`
                }
            }))
        }

        // User not signed up
        const signUpInfo = await insertUserByCredentials(this.dbClient, emailId, password, userName)
        if (!signUpInfo) 
            throw new Error("Error: Could not add new data")

        const user = new User(signUpInfo.userid, signUpInfo.username, signUpInfo.level, signUpInfo.xp)
        this.userManager.addUser(user, socket)
        this.userManager.sendMessage(user.userId, {
            type: MESSAGES.SIGNUP,
            payload: {
                userId  : signUpInfo.userid,
                userName: signUpInfo.username,
                emailId : signUpInfo.emailid,
                password: signUpInfo.password,
                level   : signUpInfo.level,
                xp      : signUpInfo.xp
            }
        }) 
    }

    async logout(payload, socket) {
        // Check if the user is already logged in
        const userId = payload.userId
        if (!this.#isUserLoggedIn(userId)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_LOGGED_IN,
                    message: `${userId} not logged in`
                }
            }))
        }
        
        // Check if the user is communicating with another socket   
        if (!this.#isUserConnectedWithTheSocket(userId, socket)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_SOCKET,
                    message: `${userId} already connected to the server with a different socket`
                }
            }))
        }

        // Check if the user in a game
        if (this.#isUserInTheGame(userId)) {
            const user   = this.userManager.getUserFromUserId(userId)
            const gameId = this.userManager.getGameIdFromUserId(userId)
            const game   = this.getGameFromGameId(gameId)
            if (gameId === this.pendingGameId) 
                this.pendingGameId = null

            // Forfeit game and get the result of the game
            game.forfeitGame(user)
            assert(game.getIsGameOver(), `Error: Game is not over after forfeit by ${userId}`)
            await this.#endGame(game)
        }

        this.userManager.sendMessage(userId, {
            type: MESSAGES.LOGOUT,
            payload: {userId}
        })
        this.userManager.removeUser(userId)
    }

    async joinGame(payload, socket) {
        // Check if the user is already logged in
        const userId = payload.userId
        if (!this.#isUserLoggedIn(userId)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_LOGGED_IN,
                    message: `${userId} not logged in`
                }
            }))
        }

        // Check if the user is communicating with another socket 
        if (!this.#isUserConnectedWithTheSocket(userId, socket)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_SOCKET,
                    message: `${userId} already connected to the server with a different socket`
                }
            }))
        }

        // Check if the user in a game
        if (this.#isUserInTheGame(userId)) {
            return this.userManager.sendMessage(userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_IN_GAME,
                    message: `${userId} already in a game`
                }
            })
        }

        const user = this.userManager.getUserFromUserId(userId)
        if (!this.pendingGameId)
            return this.#noPendingGame(user)
        return this.#pendingGame(user)
    }

    async exitGame(payload, socket) {
        // Check if the user is already logged in
        const userId = payload.userId
        if (!this.#isUserLoggedIn(userId)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_LOGGED_IN,
                    message: `${userId} not logged in`
                }
            }))
        }

        // Check if the user is communicating with another socket 
        if (!this.#isUserConnectedWithTheSocket(userId, socket)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_SOCKET,
                    message: `${userId} already connected to the server with a different socket`
                }
            }))
        }

        // Check if the user is in the game
        if (!this.#isUserInTheGame(userId)) {
            return this.userManager.sendMessage(userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_IN_GAME,
                    message: `${userId} not in any game`
                }
            })
        }

        const user   = this.userManager.getUserFromUserId(userId)
        const gameId = this.userManager.getGameIdFromUserId(userId)
        const game   = this.getGameFromGameId(gameId)
        if (gameId === this.pendingGameId) 
            this.pendingGameId = null
        game.forfeitGame(user)
        assert(game.getIsGameOver(), `Error: Game is not over after forfeit by ${userId}`)
        await this.#endGame(game)
    }

    async makeMove(payload, socket) {
        // Check if the user is already logged in
        const { userId, move } = payload
         if (!this.#isUserLoggedIn(userId)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_LOGGED_IN,
                    message: `${userId} not logged in`
                }
            }))
        }
        
        // Check if the user is communicating with another socket 
        if (!this.#isUserConnectedWithTheSocket(userId, socket)) {
            return socket.send(JSON.stringify({
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_SOCKET,
                    message: `${userId} already connected to the server with a different socket`
                }
            }))
        }
        
        // Check if the user is in the game
        if (!this.#isUserInTheGame(userId)) {
            return this.userManager.sendMessage(userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.USER_NOT_IN_GAME,
                    message: `${userId} not in any game`
                }
            })
        }

        // Check if the move is valid
        const user   = this.userManager.getUserFromUserId(userId)
        const gameId = this.userManager.getGameIdFromUserId(userId)
        const game   = this.getGameFromGameId(gameId)
        const moveMade = game.makeMove(user, move)
        if (!moveMade) {
            return this.userManager.sendMessage(userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_MOVE,
                    message: `Invalid Move`
                }
            })
        }

        // Move is valid so send the messages to the players of this game
        this.userManager.broadcast(gameId, {
            type: MESSAGES.MOVE,
            payload: {gameId, userId, move}
        })

        // Check if the game is over
        if (game.getIsGameOver()) {
            await this.#endGame(game)
        }
    }


// Private methods --------------------------------------------------------------

    #invalidParams(socket) {
        return socket.send(JSON.stringify({
            type: MESSAGES.GAME_ERROR,
            payload: {
                errorType: ERRORS.INVALID_PARAMETERS,
                message: "Invalid Parameters"
            }
        }))
    }

    #noPendingGame(user) {
        const game = new Game()
        game.setPlayer(user)
        this.addGame(game)
        this.userManager.addUserToGame(user, game.gameId)
        this.userManager.broadcast(game.gameId, {
            type: MESSAGES.GAME_ADDED,
            payload: {
                gameId: game.gameId,
            }
        })
        this.pendingGameId = game.gameId
    }

    #pendingGame(user) {
        const game = this.getGameFromGameId(this.pendingGameId)
        if (game === undefined) 
            throw new Error(`Error: Incorrect pending game Id ${this.pendingGameId}`)
        game.setPlayer(user)
        this.userManager.addUserToGame(user, this.pendingGameId)
        this.userManager.broadcast(this.pendingGameId, {
            type: MESSAGES.GAME_STARTED,
            payload: {
                gameId: this.pendingGameId,
                crossPlayer: {
                    userId: game.player1.userId,
                    userName: game.player1.userName
                },
                circlePlayer: {
                    userId: game.player2.userId,
                    userName: game.player2.userName
                },
            }
        })
        this.pendingGameId = null
    }

    async #endGame(game) {
        const isForfeit = game.getIsGameForfeit()
        this.userManager.broadcast(game.gameId, {
            type: MESSAGES.GAME_OVER,
            payload: {
                gameId: game.gameId,
                crossPlayer: {
                    userId: game.player1.userId,
                    userName: game.player1.userName,
                    level: game.player1.level,
                    xp: game.player1.xp
                },
                circlePlayer: {
                    userId: game.player2.userId,
                    userName: game.player2.userName,
                    level: game.player2.level,
                    xp: game.player2.xp
                },
                isForfeit,
                winnerUserId: game.getWinnerUserId(),
                winningPattern: game.getWinningPattern()
            }
        })
        const users = this.userManager.getUsersFromGameId(game.gameId)
        for (const u of users) {
            await updateUserStats(this.dbClient, u.userId, u.level, u.xp)
            this.userManager.removeUserFromGame(u.userId)
        }
        this.removeGame(game.gameId)
    }

    /* #isMatchMade(user) {
        if (!this.pendingGameId)
            return false
        const game = this.getGameFromGameId(this.pendingGameId)
        const level = game.player1.level
        return Math.abs(level - user.level) <= 2
    } */

    #checkParams(message) {
        if (Object.keys(message).toString() !== ["type", "payload"].toString())
            return false
        const messageType = message.type
        const payload     = message.payload
        const requiredProps = this.getRouteToParameters()[messageType]
        if (Object.keys(payload).toString() !== requiredProps.toString())
            return false
        for (const prop in payload) {
            if (!payload[prop] || payload[prop].length === 0)
                return false
        }
        return true
    }

    #isUserConnectedWithTheSocket(userId, socket) {
        return socket === this.userManager.getSocketFromUserId(userId)
    }

    #isUserInTheGame(userId) {
        const gameId = this.userManager.getGameIdFromUserId(userId)
        return this.getGameFromGameId(gameId) !== undefined
    }

    #isUserLoggedIn(userId) {
        return this.userManager.getUserFromUserId(userId) !== undefined
    }
}