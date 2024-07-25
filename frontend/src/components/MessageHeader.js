import React from "react"
import PropTypes from "prop-types"


export const MessageHeader = React.memo(({gameStatus}) => {
    const getClassName = () => {
        if (gameStatus.userWon) 
            return "ui success message"
        if (gameStatus.gameOver)
            return "ui negative message"
        return "ui message"
    }

    return (
        <div className={getClassName()}>
            {gameStatus.message}
        </div>
    )
})

MessageHeader.propTypes = {
    gameStatus: PropTypes.object.isRequired
}