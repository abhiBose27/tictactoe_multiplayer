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
        // Security level check
        if (this.level < 0) {
            this.xp = 0
            this.level = 0
            return
        }

        // Core 
        if (this.xp - 20 > 0)
            this.xp -= 20
        else if (this.level === 0)
            this.xp = 0
        else {
            this.level -= 1
            this.xp = 90
        }
    }
}

module.exports = {
    User
}