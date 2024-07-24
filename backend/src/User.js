export class User {
    
    constructor(socket, userId, name) {
        this.userId = userId
        this.socket = socket
        this.name   = name
    }

    sendMessage(message) {
        this.socket.send(JSON.stringify(message))
    }
}