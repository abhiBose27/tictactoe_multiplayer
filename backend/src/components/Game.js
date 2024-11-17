import { v4 as uuidv4 } from "uuid"
import { TicTacToe } from "tictactoe_game_class"

export class Game {

    constructor() {
        this.gameId        = uuidv4()
        this.startTime     = new Date()
        this.board         = new TicTacToe(3)
        this.player1       = null
        this.player2       = null
        this.winnerUserId  = null
        this.isDraw        = false
        this.lastMoveTime  = null
        this.isGameOver    = false
        this.isGameForfeit = false
    }

    getWinningPattern() {
        return this.board.getWinningPattern()
    }

    getWinnerUserId() {
        return this.winnerUserId
    }

    getIsDraw() {
        return this.isDraw
    }

    getIsGameOver() {
        return this.isGameOver
    }

    getIsGameForfeit() {
        return this.isGameForfeit
    }

    setPlayer(user) {
        const randomPlayer = Math.floor(Math.random() * 2) + 1
        if (randomPlayer === 1) {
            if (!this.player1)
                this.player1 = user
            else if (!this.player2)
                this.player2 = user
        }
        else if (randomPlayer === 2) {
            if (!this.player2)
                this.player2 = user
            else if (!this.player1)
                this.player1 = user
        }
    }

    setWinner(user) {
        if (this.isGameOver)
            return
        if (!this.player1 || !this.player2) {
            this.isGameOver = true
            return
        }
        if (user.userId === this.player1.userId) {
            this.player1.levelUp()
            this.player2.levelDown()
            this.winnerUserId = this.player1.userId
        }
        if (user.userId === this.player2.userId) {
            this.player2.levelUp()
            this.player1.levelDown()
            this.winnerUserId = this.player2.userId
        }
        this.isGameOver = true
    }

    forfeitGame(user) {
        if (this.isGameOver && this.isGameForfeit)
            return
        if (!this.player1 || !this.player2) {
            this.isGameOver = true
            this.isGameForfeit = true
            return
        }
        if (user.userId === this.player1.userId) {
            this.player2.levelUp()
            this.player1.levelDown()
            this.winnerUserId = this.player2.userId
        }
        if (user.userId === this.player2.userId) {
            this.player1.levelUp()
            this.player2.levelDown()
            this.winnerUserId = this.player1.userId
        }
        this.isGameOver = true
        this.isGameForfeit = true
    }

    makeMove(user, move) {
        if (this.isGameOver || !this.player1 || !this.player2)
            return false
        if (this.player1.userId === user.userId && !this.board.isValid(move, "X"))
            return false
        if (this.player2.userId === user.userId && !this.board.isValid(move, "O"))
            return false

        this.board.setMove(move)
        this.lastMoveTime = new Date()
        if (this.board.isWinner()) 
            this.setWinner(user)
        if (this.board.isDraw()) {
            this.isDraw = true
            this.isGameOver = true
        }
        this.board.setTurn()
        return true
    }
}