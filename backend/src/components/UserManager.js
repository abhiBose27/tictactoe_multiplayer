export class UserManager {

    constructor() {
        this.users          = []
        this.userIdToSocket = new Map()
        this.gameIdToUsers  = new Map()
        this.userIdToGameId = new Map()
    }

    addUser(user, socket) {
        this.users.push(user)
        this.userIdToSocket.set(user.userId, socket)
    }

    addUserToGame(user, gameId) {
        this.gameIdToUsers.set(gameId, [...(this.gameIdToUsers.get(gameId) || []), user])
        this.userIdToGameId.set(user.userId, gameId)
    }

    getSocketFromUserId(userId) {
        return this.userIdToSocket.get(userId)
    }

    getUserIdFromSocket(socket) {
        for (const userId of this.userIdToSocket.keys()) {
            const userSocket = this.getSocketFromUserId(userId)
            if (socket === userSocket)
                return userId
        }
    }

    getUserFromUserId(userId) {
        return this.users.find(u => u.userId === userId)
    }
    
    getUsersFromGameId(gameId) {
        return this.gameIdToUsers.get(gameId) || []
    }

    getGameIdFromUserId(userId) {
        return this.userIdToGameId.get(userId)
    }

    removeUserFromGame(userId) {
        const gameId = this.getGameIdFromUserId(userId)
        if (gameId === undefined)
            return
        const users = this.getUsersFromGameId(gameId)
        const newUsers = users.filter(u => u.userId !== userId)
        if (newUsers.length === 0) 
            this.gameIdToUsers.delete(gameId)
        else 
            this.gameIdToUsers.set(gameId, newUsers)
        this.userIdToGameId.delete(userId)
    }

    removeUser(userId) {
        this.users = this.users.filter(u => u.userId !== userId)
        this.userIdToSocket.delete(userId)
    }

    sendMessage(userId, message) {
        this.getSocketFromUserId(userId).send(JSON.stringify(message))
    }

    broadcast(gameId, message) {
        const users = this.getUsersFromGameId(gameId)
        users.forEach(user => this.sendMessage(user.userId, message))
    }
}