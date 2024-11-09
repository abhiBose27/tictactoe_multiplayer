import React from "react"
import PropTypes from "prop-types"
import { MESSAGES } from "../../../Messages"


export const GridTable = React.memo(({
    board,
    socket,
    userId,
    winner
}) => {
    
    const getClassName = (row, col) => {
        if (!winner)
            return "cell"
        return winner.winningPattern.find(e => e.row === row && e.col === col) !== undefined && userId === winner.userId ? "winning-cell": "cell"
    }

    const onCellClick = (event) => {
        const id = event.target.id
        const row = parseInt(id[0])
        const col = parseInt(id[1])
        socket.send(JSON.stringify({
            type: MESSAGES.MOVE,
            payload: {
                userId,
                move: {
                    row: row,
                    col: col
                }
            }
        }))
    }

    return (
        <table className="tab-tic-tac-toe">
            <tbody>
                <tr>
                    <th id="00" className={getClassName(0, 0)} onClick={onCellClick}>{board[0][0]}</th>
                    <th id="01" className={getClassName(0, 1)} onClick={onCellClick}>{board[0][1]}</th>
                    <th id="02" className={getClassName(0, 2)} onClick={onCellClick}>{board[0][2]}</th>
                </tr>
                <tr>
                    <td id="10" className={getClassName(1, 0)} onClick={onCellClick}>{board[1][0]}</td>
                    <td id="11" className={getClassName(1, 1)} onClick={onCellClick}>{board[1][1]}</td>
                    <td id="12" className={getClassName(1, 2)} onClick={onCellClick}>{board[1][2]}</td>
                </tr>
                <tr>
                    <td id="20" className={getClassName(2, 0)} onClick={onCellClick}>{board[2][0]}</td>
                    <td id="21" className={getClassName(2, 1)} onClick={onCellClick}>{board[2][1]}</td>
                    <td id="22" className={getClassName(2, 2)} onClick={onCellClick}>{board[2][2]}</td>
                </tr>
            </tbody>
        </table>
    )
})

GridTable.propTypes = {
    userId: PropTypes.string,
    board: PropTypes.array.isRequired,
    socket: PropTypes.object.isRequired,
    winner: PropTypes.object
}