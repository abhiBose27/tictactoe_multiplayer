export class SocketManager {

    constructor() {
        this.gameIdToUsers = new Map()
        this.userIdToGameId = new Map()
    }

    addUser(user, gameId) {
        this.gameIdToUsers.set(gameId, [...(this.gameIdToUsers.get(gameId) || []), user])
        this.userIdToGameId.set(user.userId, gameId)
    }

    getUsers(gameId) {
        return this.gameIdToUsers.get(gameId) || []
    }

    getGameId(userId) {
        return this.userIdToGameId.get(userId)
    }

    removeUser(userId) {
        const gameId = this.getGameId(userId)
        if (gameId === undefined) {
            console.error("User not associated with any game")
            return
        }
        const users = this.getUsers(gameId)
        const newUsers = users.filter(u => u.userId !== userId)
        if (newUsers.length === 0) 
            this.gameIdToUsers.delete(gameId)
        else 
            this.gameIdToUsers.set(gameId, newUsers)
        this.userIdToGameId.delete(userId)
    }

    broadcast(gameId, message) {
        const users = this.getUsers(gameId)
        users.forEach(user => user.sendMessage(message))
    }
}