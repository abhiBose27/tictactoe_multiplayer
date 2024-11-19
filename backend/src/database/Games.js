const { v4 } = require("uuid")
const assert = require("assert")

const processReturnData = (info) => {
    assert(info.rows.length < 2)
    return info.rows.length === 1 ? info.rows[0] : null
}

const insertGames = async(client, game) => {
    try {
        const player1Id = game.player1 ? game.player1.userId : null
        const player2Id = game.player2 ? game.player2.userId : null
        const gameInfo = await client.query("insert into games (gameid, player1id, player2id, winnerid, isforfeit, starttime, lastmovetime) values ($1, $2, $3, $4, $5, $6, $7) returning *",
            [game.gameId, player1Id, player2Id, game.winnerUserId, game.isGameForfeit, game.startTime, game.lastMoveTime]
        )
        return processReturnData(gameInfo)
    } catch (error) {
        throw new Error(`Error: Insert Games ${error}`)
    }
}

module.exports = {
    insertGames
}