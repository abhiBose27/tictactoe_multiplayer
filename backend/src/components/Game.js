import {v4 as uuidv4 } from "uuid"
import {TicTacToe} from "tictactoe_game_class"

export class Game {

    constructor() {
        this.gameId        = uuidv4()
        this.startTime     = new Date()
        this.board         = new TicTacToe(3)
        this.player1       = null
        this.player2       = null
        this.winner        = null
        this.isDraw        = false
        this.lastMoveTime  = null
        this.isGameOver    = false
        this.isGameForfeit = false
    }

    setPlayer(user) {
        if (!this.player1)
            this.player1 = user
        else if (!this.player2) 
            this.player2 = user
    }

    getWinningPattern() {
        return this.board.getWinningPattern()
    }

    getWinner() {
        return this.winner
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

    forfeitGame(user) {
        if (this.isGameOver)
            return
        if (user.userId === this.player1.userId)
            this.winner = this.player2
        else if (user.userId === this.player2.userId)
            this.winner = this.player1
        if (this.winner)
            this.winner.levelUp()
        this.isGameOver = true
        this.isGameForfeit = true
    }

    makeMove(user, move) {
        if (this.isGameOver)
            return false
        if (this.player1.userId === user.userId && !this.board.isValid(move, "X"))
            return false
        if (this.player2.userId === user.userId && !this.board.isValid(move, "O"))
            return false

        this.board.setMove(move)
        this.lastMoveTime = new Date()
        if (this.board.isWinner()) {
            this.winner = user
            this.isGameOver = true
            this.winner.levelUp()
        }
        if (this.board.isDraw()) {
            this.isDraw = true
            this.isGameOver = true
        }
        this.board.setTurn()
        return true
    }
}