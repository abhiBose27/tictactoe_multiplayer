import React from "react"
import image from "../images/player_logo.jpg"
import PropTypes from "prop-types"


export const PlayerLogo = React.memo(({player, userId, name}) => {
    const playerDisplayString = () => {
        let displayString = ""
        if (player.userId === userId)
            displayString += `(You) ${name}`
        else 
            displayString  +=`${player.name}`
        return displayString
    }
    
    return (
        <div>
            <img className="ui medium circular image" alt="logo" src={image}/>
            <p>{playerDisplayString()}</p>
        </div>
    )
})

PlayerLogo.propTypes = {
    player: PropTypes.object,
    userId: PropTypes.any,
    name: PropTypes.string
}