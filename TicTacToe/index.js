

class TicTacToe {
    constructor(size) {
        this.board = Array(size).fill().map(() => Array(size).fill(""))
        this.turn  = "X"
        this.winningPattern = []
    }

    getWinningPattern() {
        return this.winningPattern
    }

    setMove(move) {
        const turn = this.turn
        const {row, col} = move
        this.board[row][col] = turn
    }

    setTurn() {
        const turn = this.turn
        this.turn = turn === "X" ? "O" : "X"
    }

    isValid(move, symbol) {
        const { row, col } = move
        return this.board[row][col] === "" && symbol === this.turn
    }

    isDraw () {
        for (const row of this.board) {
            for (const elm of row) {
                if (elm === "")
                    return false
            }
        }
        return true
    }

    isWinner() {
        let winningPattern = this.#horizontalCheck()
        if (winningPattern.length !== 0) {
            this.winningPattern = winningPattern
            return true
        }
        winningPattern = this.#verticalCheck()
        if (winningPattern.length !== 0) {
            this.winningPattern = winningPattern
            return true
        }
        winningPattern = this.#forwardDiagnol()
        if (winningPattern.length !== 0) {
            this.winningPattern = winningPattern
            return true
        }
        winningPattern = this.#reverseDiagnol()
        if (winningPattern.length !== 0) {
            this.winningPattern = winningPattern
            return true
        }
        return false
    }

    #horizontalCheck() {
        const turn = this.turn
        for (let row = 0; row < this.board.length; row++) {
            let horizontalCheck = true
            let winningPattern = []
            for (let col = 0; col < this.board[row].length; col++){
                if (turn !== this.board[row][col]) {
                    horizontalCheck = false
                    break
                }
                winningPattern.push({row: row, col: col})
            }
            if (horizontalCheck) 
                return winningPattern
        }
        return []
    }

    #verticalCheck() {
        const turn = this.turn
        for (let col = 0; col < this.board[0].length; col++) {
            let verticalCheck = true
            let winningPattern = []
            for (let row = 0; row < this.board.length; row++) {
                if (turn !== this.board[row][col]) {
                    verticalCheck = false
                    break
                }
                winningPattern.push({row: row, col: col})
            }
            if (verticalCheck)
                return winningPattern
        }
        return []
    }

    #forwardDiagnol() {
        const turn = this.turn
        let diagnolCheck = true
        let winningPattern = []
        for (let i = 0; i < this.board.length; i++) {
            if (turn !== this.board[i][i]) {
                diagnolCheck = false
                break
            }
            winningPattern.push({row: i, col: i})
        }
        return diagnolCheck ? winningPattern: []
    }

    #reverseDiagnol() {
        const turn = this.turn
        let reverseDiagnolCheck = true
        let winningPattern = []
        for (let i = 0; i < this.board.length; i++) {
            if (turn !== this.board[i][this.board[0].length - 1 - i]) {
                reverseDiagnolCheck = false
                break
            }
            winningPattern.push({row: i, col: this.board[0].length - 1 - i})
        }
        return reverseDiagnolCheck ? winningPattern : []
    }
}

module.exports = {TicTacToe}
 