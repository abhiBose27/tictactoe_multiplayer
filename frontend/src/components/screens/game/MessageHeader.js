import React from "react"
import PropTypes from "prop-types"
import { Header } from "semantic-ui-react"


export const MessageHeader = React.memo(({userId, winnerUserId, gameMessage}) => {
    const getMessageColor = () => {
        if (!winnerUserId)
            return "grey"
        if (userId === winnerUserId)
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
    winnerUserId: PropTypes.string,
    gameMessage: PropTypes.string.isRequired
}