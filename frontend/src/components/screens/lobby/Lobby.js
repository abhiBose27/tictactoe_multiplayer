import { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Loader } from "semantic-ui-react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import { MESSAGES } from "../../../Messages"
import { Header } from "../../assets/Header"
import { ACTIONS } from "../../../Actions"
import { initUserState } from "../../../Reducer"


export const Lobby = ({socket}) => {
    const navigate             = useNavigate()
    const dispatch             = useDispatch()
    const { user }             = useSelector(state => state.user)
    const { userId, userName } = user

    useEffect(() => {
        if (sessionStorage.getItem("pageRefresh"))
            navigate("/", { replace: true })
    }, [navigate])

    useEffect(() => {
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            const messagePayload = message.payload
            switch (message.type) {
                case MESSAGES.GAME_ADDED:
                    dispatch({type: ACTIONS.ADD_GAME, payload: {
                        ...initUserState.game,
                        gameId: messagePayload.gameId,
                        player1: {
                            userId: messagePayload.crossPlayer.userId,
                            userName: messagePayload.crossPlayer.userName
                        }
                    }})
                    break
                case MESSAGES.GAME_STARTED:
                    dispatch({type: ACTIONS.ADD_GAME, payload: {
                        isStarted: true,
                        gameId: messagePayload.gameId,
                        player1: {
                            userId: messagePayload.crossPlayer.userId,
                            userName: messagePayload.crossPlayer.userName
                        }, player2: {
                            userId: messagePayload.circlePlayer.userId,
                            userName: messagePayload.circlePlayer.userName
                        }
                    }})
                    navigate(`/game/${messagePayload.gameId}`, { replace: true })
                    break
                case MESSAGES.LOGOUT:
                    dispatch({type: ACTIONS.LOGIN, payload: initUserState.isLoggedIn})
                    dispatch({type: ACTIONS.ADD_USER, payload: initUserState.user})
                    dispatch({type: ACTIONS.ADD_GAME, payload: initUserState.game})
                    navigate("/", { replace: true })
                    break
                default:
                    break
            }
        }
        socket.send(JSON.stringify({
            type: MESSAGES.JOIN_GAME,
            payload: {userId}
        }))
       
    }, [socket, userId, userName, dispatch, navigate])

    return (
        <>
            <Header socket={socket} userName={userName} userId={userId}/>
            <Loader className="ui active slow green massive double loader">Finding a player...</Loader>
        </>
    )   
}


Lobby.propTypes = {
    socket: PropTypes.object.isRequired
}
