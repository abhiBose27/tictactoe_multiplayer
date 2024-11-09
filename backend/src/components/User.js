export class User {
    
    constructor(userId, userName, level, xp) {
        this.userId   = userId
        this.userName = userName
        this.level    = level
        this.xp       = xp
    }

    levelUp() {
        if (this.xp + 20 < 100) {
            this.xp += 20
            return
        }
        this.level += 1
        this.xp = 0
    }
}