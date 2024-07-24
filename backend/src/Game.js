import {v4 as uuidv4 } from "uuid"
import {TicTacToe} from "tictactoe_game_class"

export class Game {

    constructor() {
        this.gameId    = uuidv4()
        this.startTime = new Date()
        this.board     = new TicTacToe(3)
        this.player1   = null
        this.player2   = null
        this.winner    = null
        this.isDraw    = false
        this.lastMoveTime = null
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

    forfeitGame(user) {
        if (user.userId === this.player1.userId)
            this.winner = this.player2
        else if (user.userId === this.player2.userId)
            this.winner = this.player1
    }

    makeMove(user, move) {
        if (this.player1.userId === user.userId && !this.board.isValid(move, "X"))
            return false
        if (this.player2.userId === user.userId && !this.board.isValid(move, "O"))
            return false

        this.board.setMove(move)
        this.lastMoveTime = new Date()
        this.winner = this.board.isWinner() ? user : null
        this.isDraw = this.board.isDraw()
        this.board.setTurn()
        return true
    }
}