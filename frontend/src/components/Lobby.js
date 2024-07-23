import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { EXIT_GAME, GAME_ADDED, GAME_STARTED, JOIN_GAME } from "../Messages"
import { Loader } from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"


export const Lobby = ({socket}) => {
    const navigate = useNavigate()
    const { user } = useSelector(state => state.user)
    const { userId, name } = user.user
    const [gameMetaData, setGameMetaData] = useState({
            isStarted: false, 
            gameId: null, 
            player1: { userId: null, name: null }, 
            player2: { userId: null, name: null }
        }
    )

    useEffect(() => {
        window.onpopstate = () => {
            console.log("Exit from game")
            socket.send(JSON.stringify({
                type: EXIT_GAME,
                payload: {
                    userId: userId
                }
            }))
        }
    }, [userId, socket])

    useEffect(() => {
        const parseMessage = (event) => {
            const message = JSON.parse(event.data)
            const message_type = message.type
            const message_payload = message.payload
            const gameId = message_payload.gameId
            switch (message_type) {
                case GAME_ADDED:
                    setGameMetaData(prevState => {
                        return {
                            ...prevState, 
                            gameId: gameId, 
                            player1: { userId: userId, name: name }
                        }
                    })
                    break
                case GAME_STARTED:
                    setGameMetaData({
                        isStarted: true, 
                        gameId: gameId, 
                        player1: {
                            userId: message_payload.cross_player.id,
                            name: message_payload.cross_player.name
                        }, player2: {
                            userId: message_payload.circle_player.id,
                            name: message_payload.circle_player.name
                        }
                    })
                    break
                default:
                    break;
            }
        }
        socket.send(JSON.stringify({
            type: JOIN_GAME,
            payload: {
                userId: userId,
                name: name
            }
        }))
        socket.addEventListener("message", parseMessage)
        return () => socket.removeEventListener("message", parseMessage)
    }, [navigate, socket, userId, name])

    useEffect(() => {
        const navigateToGame = async() => {
            if (gameMetaData.isStarted)
                navigate(`/game/${gameMetaData.gameId}`, {replace: true, state: {gameMetaData: {gameMetaData}}})
        }
        navigateToGame()
    }, [gameMetaData, navigate])

    return (
        <Loader className="ui active slow green large double loader">Finding a player...</Loader>
    )
}


Lobby.propTypes = {
    socket: PropTypes.object
}
