import React from "react"
import PropTypes from "prop-types"
import { Fireworks } from "@fireworks-js/react"
import { PlayerLogo } from "./PlayerLogo"
import { GridTable } from "./GridTable"


export const GamePlay = React.memo(({ 
    userId,
    socket,
    player1, 
    player2,
    gameState,
}) => {

    const { board, playFireworks, winner } = gameState
    return (
        <div className="game">
            <PlayerLogo player={player1} userId={userId}/>
            <GridTable
                board={board}
                socket={socket}
                userId={userId}
                winner={winner}
            />
            <PlayerLogo player={player2} userId={userId}/>
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
    userId: PropTypes.string,
    socket: PropTypes.object.isRequired,
    player1: PropTypes.object.isRequired,
    player2: PropTypes.object.isRequired,
    gameState: PropTypes.object.isRequired,
}