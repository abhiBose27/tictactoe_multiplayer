import React from "react"
import PropTypes from "prop-types"
import { Header } from "semantic-ui-react"


export const MessageHeader = React.memo(({userId, winner, gameMessage}) => {
    const getMessageColor = () => {
        if (!winner)
            return "grey"
        if (userId === winner.userId)
            return "green"
        return "red"
    }
    return (
        <Header 
            as="h1"
            textAlign="center"
            content={gameMessage}
            color={getMessageColor()}
        />
    ) 
})

MessageHeader.propTypes = {
    userId: PropTypes.string,
    winner: PropTypes.object,
    gameMessage: PropTypes.string.isRequired
}