import React from "react"
import PropTypes from "prop-types"
import { Divider } from "semantic-ui-react"
import { PlayerLogo } from "./PlayerLogo"


export const GameLoading = React.memo(({player1, player2, userId}) => {
    return (
        <div className="loading">
            <PlayerLogo player={player1} userId={userId}/>
            <Divider inverted vertical>VS</Divider>
            <PlayerLogo player={player2} userId={userId}/>
        </div>
    )
})

GameLoading.propTypes = {
    player1: PropTypes.object.isRequired,
    player2: PropTypes.object.isRequired,
    userId: PropTypes.string,
}