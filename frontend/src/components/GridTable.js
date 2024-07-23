import React from "react"
import PropTypes from "prop-types"


export const GridTable = React.memo(({onCellClick, board, winningPattern}) => {
    const getClassName = (row, col) => {
        const isWinningMove = winningPattern.find((e) => e.row === row && e.col === col) !== undefined
        if (isWinningMove)
            return "winning-cell"
        return "cell"
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
    onCellClick: PropTypes.func.isRequired,
    board: PropTypes.array.isRequired,
    winningPattern: PropTypes.array.isRequired
}