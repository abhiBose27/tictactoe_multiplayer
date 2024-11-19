const assert          = require("assert")
const { UserManager } = require("../managers/UserManager.js")
const { Game }        = require("../entities/Game.js")
const { User }        = require("../entities/User.js")
const { 
    getUserByCredentials, 
    getUserByEmailId, 
    getUserByUsername, 
    insertUserByCredentials, 
    updateUserStats 
} = require("../../database/Users.js")
const { ERRORS, MESSAGES } = require("../../messages.js")
const { 
    isRequiredPropsInParams, 
    checkParamsOptionals, 
    checkParamsRequired, 
    getRouteConfig 
} = require("../../helper.js")
const { insertGames } = require("../../database/Games.js")


class GameManager {
    
    /*
    create table users (userid uuid, emailid text, password text, username text, level int, xp int, unique (emailid));
    */
    constructor(dbClient) {
        this.games = []
        this.pendingGameId = null
        this.dbClient = dbClient
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
        console.log("LoggedIn Users: ", this.userManager.getUsers())
        console.log("UserIdToGameId: ", this.userManager.getUserIdToGameId())
        console.log("---------------\n\n")
    }

    getRouteToCallback() {
        return {
            [MESSAGES.MOVE]     : this.makeMove.bind(this),
            [MESSAGES.LOGIN]    : this.login.bind(this),
            [MESSAGES.LOGOUT]   : this.logout.bind(this),
            [MESSAGES.SIGNUP]   : this.signup.bind(this),
            [MESSAGES.EXIT_GAME]: this.exitGame.bind(this),
            [MESSAGES.JOIN_GAME]: this.joinGame.bind(this),
        }
    }

    isValidParams(message) {
        if (Object.keys(message).toString() !== ["type", "payload"].toString())
            return false
        const messageType = message.type
        const payload     = message.payload
        const routeConfig = getRouteConfig()[messageType]
        const requiredProps = routeConfig.required
        const optionalProps = routeConfig.optional
        
        if (isRequiredPropsInParams(payload, requiredProps) && !optionalProps)
            return false

        if (optionalProps) {
            for (const prop in payload) {
                if (!(prop in requiredProps) && !(prop in optionalProps))
                    return false
            }
            if (!checkParamsOptionals(payload, optionalProps))
                return false
        }
        // To check all the required parameters are provided
        return checkParamsRequired(payload, requiredProps)
    }

    enableMessageHandler(socket) {
        socket.on("message", async (crude_message) => {
            console.log("RECEIVED: ", crude_message.toString())
            const message = JSON.parse(crude_message.toString())
            if (!this.isValidParams(message))
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
        if (payload.existingGameId)
            return this.#addToExistingGame(user, payload.existingGameId)
        if (payload.createLobby)
            return this.#addToNewGame(user)
        if (!this.pendingGameId) {
            this.pendingGameId = this.#addToNewGame(user)
            return
        }
        this.#addToExistingGame(user, this.pendingGameId)
        this.pendingGameId = null
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
        const { userId, row, col } = payload
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
        const moveMade = game.makeMove(user, {row, col})
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
            payload: {gameId, userId, row, col}
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

    #addToNewGame(user) {
        const game = new Game()
        const isPlayerAdded = game.setPlayer(user)
        if (!isPlayerAdded)
            throw new Error("Cant add a player to a new game")
        this.addGame(game)
        this.userManager.addUserToGame(user, game.gameId)
        this.userManager.broadcast(game.gameId, {
            type: MESSAGES.GAME_ADDED,
            payload: {
                gameId: game.gameId,
            }
        })
        return game.gameId
    }

    #addToExistingGame(user, gameId) {
        const game = this.getGameFromGameId(gameId)
        if (game === undefined) {
            return this.userManager.sendMessage(user.userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.INVALID_GAMEID,
                    message: "invalid gameId"
                }
            })
        } 
        //throw new Error(`Error: Incorrect game Id ${gameId}`)
        const isPlayerAdded = game.setPlayer(user)
        if (!isPlayerAdded) {
            return this.userManager.sendMessage(user.userId, {
                type: MESSAGES.GAME_ERROR,
                payload: {
                    errorType: ERRORS.GAME_FULL,
                    message: "game is already full"
                }
            })
        }
        this.userManager.addUserToGame(user, gameId)
        this.userManager.broadcast(gameId, {
            type: MESSAGES.GAME_STARTED,
            payload: {
                gameId: gameId,
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
    }

    async #endGame(game) {
        const isForfeit = game.getIsGameForfeit()
        this.userManager.broadcast(game.gameId, {
            type: MESSAGES.GAME_OVER,
            payload: {
                gameId: game.gameId,
                crossPlayer: {
                    userId: game.player1?.userId,
                    userName: game.player1?.userName,
                    level: game.player1?.level,
                    xp: game.player1?.xp
                },
                circlePlayer: {
                    userId: game.player2?.userId,
                    userName: game.player2?.userName,
                    level: game.player2?.level,
                    xp: game.player2?.xp
                },
                isForfeit,
                winnerUserId: game.getWinnerUserId(),
                winningPattern: game.getWinningPattern()
            }
        })
        const users = this.userManager.getUsersFromGameId(game.gameId)
        await insertGames(this.dbClient, game)
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

module.exports = {
    GameManager
}