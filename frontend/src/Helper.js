export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
export const getInitialLevelProgress = (userId, player1, player2, prevXp, prevLevel) => {
    const player = userId === player1.userId ? player1 : player2
    if (prevLevel > player.level)
        return {
            updatedLevel: player.level,
            updatedXp: 100
        }
    if (prevLevel < player.level)
        return {
            updatedLevel: player.level,
            updatedXp: 0
        }
    return {
        updatedLevel: prevLevel,
        updatedXp: prevXp
    }
}
