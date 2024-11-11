import React from "react"
import PropTypes from "prop-types"
import image from "../../../images/player_logo.jpg"


export const PlayerLogo = React.memo(({player, userId}) => {
    
    return (
        <div>
            <img className="ui circular image" alt="logo" src={image}/>
            <p className="logo-name">{player.userId === userId ? `(You) ${player.userName}` : player.userName}</p>
        </div>
    )
})

PlayerLogo.propTypes = {
    player: PropTypes.object.isRequired,
    userId: PropTypes.string,
}