import React from "react"
import PropTypes from "prop-types"
import { Divider } from "semantic-ui-react"
import { PlayerLogo } from "./PlayerLogo"


export const GameLoading = React.memo(({gameMetaData, userId, name}) => {
    return (
        <div className="loading">
            <PlayerLogo player={gameMetaData.player1} userId={userId} name={name}/>
            <Divider inverted vertical>VS</Divider>
            <PlayerLogo player={gameMetaData.player2} userId={userId} name={name}/>
        </div>
    )
})

GameLoading.propTypes = {
    gameMetaData: PropTypes.object.isRequired,
    userId: PropTypes.any.isRequired,
    name: PropTypes.string.isRequired
}