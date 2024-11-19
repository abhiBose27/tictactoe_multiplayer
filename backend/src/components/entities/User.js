class User {
    
    constructor(userId, userName, level, xp) {
        this.userId   = userId
        this.userName = userName
        this.level    = level
        this.xp       = xp
    }

    levelUp() {
        if (this.xp + 30 < 100) {
            this.xp += 30
            return
        }
        this.level += 1
        this.xp = 10
    }

    levelDown() {
        if (this.xp - 20 > 0) {
            this.xp -= 20
            return
        }
        if (this.level === 0) {
            this.xp = 0
            return
        }
        this.level -= 1
        this.xp = 90
    }
}

module.exports = {
    User
}