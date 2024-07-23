import React from "react"
import PropTypes from "prop-types"
import { PlayerLogo } from "./PlayerLogo"
import { Fireworks } from "@fireworks-js/react"
import { GridTable } from "./GridTable"


export const GamePlay = React.memo(({onCellClick, gameMetaData, userId, name, board, playFireworks, winningPattern}) => {
    return (
        <div className="game">
            <PlayerLogo player={gameMetaData.player1} userId={userId} name={name}/>
            <GridTable onCellClick={onCellClick} board={board} winningPattern={winningPattern}/>
            <PlayerLogo player={gameMetaData.player2} userId={userId} name={name}/>
            {
                playFireworks && <Fireworks
                    autostart
                    options={{ opacity: 0.7 }}
                    style={{
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        position: "fixed",
                        background: "transparent"
                    }}
                />
            }
        </div>
    )
})

GamePlay.propTypes = {
    onCellClick: PropTypes.func.isRequired,
    gameMetaData: PropTypes.object.isRequired,
    userId: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired,
    board: PropTypes.array.isRequired,
    playFireworks: PropTypes.bool.isRequired,
    winningPattern: PropTypes.array.isRequired
}